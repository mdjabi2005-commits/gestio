"""
Page de visualisation des transactions (Dashboard)
Refactorisé pour utiliser les composants modulaires avec st.fragment (pour pywebview).
"""

from datetime import date

import pandas as pd
import streamlit as st

from shared.ui.toast_components import toast_error
from ...database import transaction_repository
from ...services.transaction_service import transaction_service
# Imports des composants
# Assuming 'view' folder with components is a sibling of 'pages' inside 'transactions'
from ...view.components.calendar_component import render_calendar, get_calendar_selected_dates
from ...view.components.charts import render_evolution_chart
from ...view.components.kpi_metrics import render_kpi_cards
from ...view.components.transaction_table import render_transaction_table
from ...view.sunburst_navigation import sunburst_navigation


# ============================================================
# FONCTIONS DE RENDU (sans fragments)
# ============================================================

def render_sunburst():
    """
    Fragment pour le sunburst: navigation par type/catégorie/sous-catégorie.
    Se recharge indépendamment lors des selections.
    """
    st.subheader("📂 Navigation")

    selected_types = set()
    selected_categories = set()
    selected_subcategories = set()

    # Récupérer les données complètes depuis le session state
    all_df = st.session_state.get("all_transactions_df")

    if all_df is not None and not all_df.empty:
        # Construire la hiérarchie à partir de tout l'historique
        hierarchy = _build_hierarchy(all_df)

        if hierarchy:
            selection = sunburst_navigation(hierarchy, key="main_sunburst", height=350)

            if selection and selection.get('codes'):
                selected_codes = selection.get('codes', [])

                if selected_codes:
                    for code in selected_codes:
                        if '_SUB_' in code:
                            type_part = code.split('_CAT_')[0].replace('TYPE_', '')
                            parts = code.split('_CAT_')[1]
                            cat_part, sub_part = parts.split('_SUB_')

                            selected_types.add(type_part.replace('_', ' ').title())
                            selected_categories.add(cat_part.replace('_', ' ').title())
                            selected_subcategories.add(sub_part.replace('_', ' ').title())

                        elif '_CAT_' in code:
                            type_part = code.split('_CAT_')[0].replace('TYPE_', '')
                            cat_part = code.split('_CAT_')[1]

                            selected_types.add(type_part.replace('_', ' ').title())
                            selected_categories.add(cat_part.replace('_', ' ').title())

                        elif code.startswith('TYPE_') and '_CAT_' not in code:
                            type_part = code.replace('TYPE_', '')
                            selected_types.add(type_part.replace('_', ' ').title())

                    # Affichage des filtres actifs
                    active_filters = []
                    if selected_types:
                        active_filters.append(f"Types: {', '.join(selected_types)}")
                    if selected_categories:
                        active_filters.append(f"Catégories: {', '.join(selected_categories)}")
                    if selected_subcategories:
                        active_filters.append(f"Sous-cat: {', '.join(selected_subcategories)}")

                    if active_filters:
                        st.info(f"📂 {' | '.join(active_filters)}")
        else:
            st.info("Pas assez de données pour le graphique.")

    # Stocker les filtres sunburst dans session_state
    st.session_state.view_filters_sunburst = {
        "selected_types": selected_types,
        "selected_categories": selected_categories,
        "selected_subcategories": selected_subcategories
    }


# ============================================================
# FRAGMENT 2: KPIs
# ============================================================
def render_kpis():
    """
    Fragment pour les KPIs.
    Se recharge quand les filtres changent.
    """
    st.subheader("📊 Aperçu")

    # Appliquer les filtres
    filtered_df = _get_filtered_data()

    if filtered_df is None or filtered_df.empty:
        st.info("Aucune transaction avec ces filtres.")
        return

    render_kpi_cards(filtered_df)


# ============================================================
# TABLEAU + GRAPHIQUE
# ============================================================
def render_table():
    """
    Fragment pour le tableau et le graphique.
    Contient les interactions (edit, delete).
    """
    st.subheader("📋 Détails")

    # Appliquer les filtres
    filtered_df = _get_filtered_data()

    if filtered_df is None or filtered_df.empty:
        st.info("Aucune transaction à afficher.")
        return

    col_chart, col_table = st.columns([1, 1])

    # C. Graphique Évolution
    with col_chart:
        render_evolution_chart(filtered_df, height=400)

    # D. Tableau Éditable
    with col_table:
        render_transaction_table(filtered_df, transaction_repository)


# ============================================================
# FONCTIONS UTILITAIRES
# ============================================================

def _get_filtered_data() -> pd.DataFrame:
    """
    Applique les filtres actifs sur les données.
    """
    all_df = st.session_state.get("all_transactions_df")
    filters = st.session_state.get("view_filters", {})

    if all_df is None or all_df.empty:
        return pd.DataFrame()

    filtered_df = all_df.copy()

    # 1. Filtre Date (liste de dates sélectionnées)
    selected_dates = filters.get("selected_dates", [])

    if selected_dates:
        # Filtrer pour afficher uniquement les dates sélectionnées
        filtered_df = filtered_df[filtered_df['date'].isin(selected_dates)]

    # 2. Filtre Type
    selected_types = filters.get("selected_types", set())
    if selected_types:
        filtered_df = filtered_df[filtered_df['type'].isin(selected_types)]

    # 3. Filtre Catégorie
    selected_categories = filters.get("selected_categories", set())
    if selected_categories:
        filtered_df = filtered_df[filtered_df['category'].isin(selected_categories)]

    # 4. Filtre Sous-catégorie
    selected_subcategories = filters.get("selected_subcategories", set())
    if selected_subcategories:
        filtered_df = filtered_df[filtered_df['subcategory'].isin(selected_subcategories)]

    return filtered_df


# ============================================================
# FONCTIONS DE CHARGEMENT (AVEC CACHE)
# ============================================================

@st.cache_data(ttl=60)  # Cache pendant 60 secondes
def _load_all_transactions():
    """Charge toutes les transactions avec cache."""
    return transaction_service.get_filtered_transactions_df()


# noinspection PyBroadException
@st.cache_data(ttl=300)  # Cache pendant 5 minutes
def _load_occurrences():
    """Charge les occurrences de récurrences avec cache."""
    # noinspection PyBroadException
    try:
        from ...database.repository_recurrence import RecurrenceRepository
        recurrence_repo = RecurrenceRepository()
        recurrences = recurrence_repo.get_all_recurrences()

        occurrences_data = []
        today = date.today()

        for rec in recurrences:
            msgs = rec.generate_occurrences(today)
            occurrences_data.extend(msgs)

        if occurrences_data:
            df = pd.DataFrame(occurrences_data)
            df['date'] = pd.to_datetime(df['date']).dt.date
            df['id'] = df.apply(lambda x: f"rec_{x['recurrence_id']}_{x['date']}", axis=1)
            return df
        return pd.DataFrame()
    except Exception:
        return pd.DataFrame()


def _build_hierarchy(df: pd.DataFrame) -> dict:
    """Construit la hiérarchie pour le Sunburst au format attendu par le JS."""
    if df.empty:
        return {}

    # Structure attendue par le JS: {code: {label, amount, color, children: [codes]}}
    hierarchy = {'TR': {
        'label': 'Total',
        'total': float(df['amount'].sum()),
        'color': '#64748b',
        'children': []
    }}

    # Racine

    # Grouper par Type
    for type_name in ["Dépense", "Revenu"]:
        type_df = df[df['type'].str.lower() == type_name.lower()]
        if type_df.empty:
            continue

        type_code = f"TYPE_{type_name.upper()}"
        type_total = float(type_df['amount'].sum())

        hierarchy[type_code] = {
            'label': type_name,
            'total': type_total,
            'color': '#ef4444' if type_name == 'Dépense' else '#10b981',
            'children': []
        }
        hierarchy['TR']['children'].append(type_code)

        # Grouper par Catégorie
        if 'category' in df.columns:
            for cat_name, cat_df in type_df.groupby("category"):
                cat_code = f"{type_code}_CAT_{str(cat_name).upper().replace(' ', '_')}"
                cat_total = float(cat_df['amount'].sum())

                hierarchy[cat_code] = {
                    'label': str(cat_name),
                    'total': cat_total,
                    'color': '#f59e0b' if type_name == 'Dépense' else '#14b8a6',
                    'children': []
                }
                hierarchy[type_code]['children'].append(cat_code)

                # Grouper par Sous-catégorie
                if 'subcategory' in df.columns:
                    for sub_name, sub_df in cat_df.groupby("subcategory"):
                        if pd.notna(sub_name):
                            sub_code = f"{cat_code}_SUB_{str(sub_name).upper().replace(' ', '_')}"
                            sub_total = float(sub_df['amount'].sum())

                            if sub_total > 0:
                                hierarchy[sub_code] = {
                                    'label': str(sub_name),
                                    'amount': sub_total,
                                    'total': sub_total,
                                    'color': '#fbbf24' if type_name == 'Dépense' else '#2dd4bf',
                                    'children': []
                                }
                                hierarchy[cat_code]['children'].append(sub_code)

    return hierarchy


# ============================================================
# PAGE PRINCIPALE
# ============================================================

def interface_voir_transactions():
    """Page principale du Dashboard Financier avec fragments."""

    # Initialiser les données globales en session_state (une seule fois)
    if "all_transactions_df" not in st.session_state:
        with st.spinner("Chargement des transactions..."):
            all_df = _load_all_transactions()

            # Normalisation des données
            if all_df is not None and not all_df.empty:
                if 'type' in all_df.columns:
                    all_df['type'] = all_df['type'].astype(str).str.capitalize()
                    all_df['type'] = all_df['type'].replace(
                        {'Revenus': 'Revenu', 'Dépenses': 'Dépense', 'Depense': 'Dépense'})

                if 'category' in all_df.columns:
                    all_df['category'] = all_df['category'].astype(str).str.capitalize()

            st.session_state.all_transactions_df = all_df

    # Vérifier si les données sont chargées
    all_df = st.session_state.get("all_transactions_df")

    if all_df is None:
        toast_error("Erreur de chargement des données.", duration=3000)
        return

    if all_df.empty:
        st.info("Aucune transaction enregistrée. Commencez par en ajouter !")
        return

    # Afficher les fragments
    st.header("📊 Tableau de Bord Financier")

    # Zone de filtres: Calendrier (hors fragment) + Sunburst (fragment)
    col_sunburst, col_calendar = st.columns([2, 1])

    with col_sunburst:
        render_sunburst()

    with col_calendar:
        st.subheader("📅 Période")
        render_calendar(all_df, key="main_calendar")

    # Stocker les filtres complets (dates + sunburst)
    sunburst_filters = st.session_state.get("view_filters_sunburst", {})
    selected_dates = get_calendar_selected_dates(key="main_calendar")

    st.session_state.view_filters = {
        "selected_dates": selected_dates,
        "selected_types": sunburst_filters.get("selected_types", set()),
        "selected_categories": sunburst_filters.get("selected_categories", set()),
        "selected_subcategories": sunburst_filters.get("selected_subcategories", set())
    }

    st.markdown("---")

    # Fragment 2: KPIs
    render_kpis()

    st.markdown("---")

    # Fragment 3: Tableau + Graphique
    render_table()
