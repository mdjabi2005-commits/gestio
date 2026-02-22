#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gestio V4 - Financial Management Application
Refactored modular version

@author: djabi
@version: 4.0 (Refactored)
@date: 2025-11-17
"""

import streamlit as st

# Initialize logging system FIRST (before any other imports)
from config.logging_config import setup_logging

setup_logging()

# ==============================
# STREAMLIT CONFIGURATION
# ==============================
st.set_page_config(
    page_title="Gestio V4 - Gestion Financière",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS pour supprimer les marges et occupe toute la largeur
st.markdown("""
<style>
    .block-container {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        max-width: 100% !important;
    }
    div[data-testid="stVerticalBlock"] {
        gap: 0.5rem;
    }
    /* Supprimer les marges latérales */
    .stApp {
        margin-left: 0rem !important;
        margin-right: 0rem !important;
    }
    /* Container principal */
    .main .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# ==============================
# IMPORTS - Configuration
# ==============================
from config import (
    DB_PATH, TO_SCAN_DIR,
    REVENUS_A_TRAITER
)

# ==============================
# IMPORTS - Database
# ==============================
from domains.transactions.database.schema import (
    init_transaction_table,
    migrate_transaction_table
)
from domains.transactions.database.schema_table_recurrence import init_recurrence_table

# ==============================
# IMPORTS - UI
# ==============================
from shared.ui import load_all_styles, refresh_and_rerun

# ==============================
# IMPORTS - Pages
# ==============================
from domains.home.pages.home import interface_accueil
from domains.transactions.pages.add.add import interface_add_transaction
from domains.transactions.pages.view.view import interface_voir_transactions
from domains.transactions.pages.recurrences.recurrences import interface_recurrences

# ==============================
# LOGGING CONFIGURATION
# ==============================
from config.logging_config import get_logger

# Get logger for main module
logger = get_logger(__name__)

# ==============================
# DATABASE INITIALIZATION
# ==============================
try:
    init_transaction_table()
    migrate_transaction_table()
    init_recurrence_table()

    # Init attachments table
    from domains.transactions.database.schema import init_attachments_table

    init_attachments_table()
    # Auto-generate missing recurring transactions
    from domains.transactions.recurrence import backfill_all_recurrences

    created = backfill_all_recurrences()
    if created:
        logger.info(f"Recurrence backfill: {created} transactions created")

    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    st.error(f"⚠️ Erreur d'initialisation de la base de données : {e}")

# ==============================
# LOAD STYLES
# ==============================
load_all_styles()


# ==============================
# MAIN APPLICATION
# ==============================
# noinspection PyShadowingNames
def main():
    """Main application router."""
    # noinspection PyShadowingNames
    try:
        # Sidebar Branding
        st.sidebar.title("💰 Gestio V4")

        # Navigation Setup (Native Streamlit)
        # Group pages by functionality
        pages = {
            "Tableau de Bord": [
                st.Page(interface_accueil, title="Accueil", icon="🏠", default=True),
                st.Page(interface_voir_transactions, title="Voir Transactions", icon="📊", url_path="view"),
            ],
            "Saisie": [
                st.Page(interface_add_transaction, title="Ajouter Transaction", icon="➕", url_path="add"),
                st.Page(interface_recurrences, title="Récurrences", icon="🔄", url_path="recurrences"),
            ]
        }

        pg = st.navigation(pages)

        # Sidebar Utilities
        st.sidebar.markdown("---")

        # Quick Refresh
        if st.sidebar.button("🔄 Rafraîchir", use_container_width=True):
            refresh_and_rerun()

        # Debug/Technical Info (Hidden by default)
        with st.sidebar.expander("ℹ️ Informations Techniques", expanded=False):
            st.markdown(f"**Version:** 4.0 (Refactored)")
            st.divider()
            st.caption("Base de données")
            st.code(DB_PATH, language="text")
            st.caption("Dossier Tickets")
            st.code(TO_SCAN_DIR, language="text")
            st.caption("Dossier Revenus")
            st.code(REVENUS_A_TRAITER, language="text")

        # Run the selected page
        pg.run()

    except Exception as e:
        from config.logging_config import log_error
        trace_id = log_error(e, "Application V4 failed")
        st.error(f"ERREUR CRITIQUE [TraceID: {trace_id}]: L'application V4 a rencontré une erreur.")
        st.exception(e)


# ==============================
# APPLICATION ENTRY POINT
# ==============================
if __name__ == "__main__":
    main()
