"""
Home Page Module - Page d'Accueil Simplifiée
"""

import streamlit as st


def interface_accueil() -> None:
    """
    Page d'accueil simplifiée.
    """
    st.title("🏠 Bienvenue dans Gestio V4")

    st.markdown("""
    ## 💰 Gestion Financière Simplifiée
    
    Bienvenue dans votre application de gestion financière ! 
    
    ### 🚀 Commencez ici :
    
    """)

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        ### ➕ Ajouter des Transactions
        
        Utilisez la page **"Ajouter Transaction"** pour :
        - 📸 Scanner un ticket (OCR)
        - 📄 Importer un PDF
        - 📊 Importer un fichier CSV  
        - 🔁 Créer une transaction récurrente
        """)

        if st.button("➕ Ajouter une Transaction", type="primary", use_container_width=True):
            st.session_state.requested_page = "➕ Ajouter Transaction"
            st.rerun()

    with col2:
        st.markdown("""
        ### 📊 Voir vos Transactions
        
        Consultez la page **"Voir Transactions"** pour :
        - 📋 Tableau interactif et éditable
        - 🔍 Filtres avancés (date, type, catégorie)
        - ✏️ Modification directe des données
        - 🗑️ Suppression de transactions
        """)

        if st.button("📊 Voir mes Transactions", use_container_width=True):
            st.session_state.requested_page = "📊 Voir Transactions"
            st.rerun()

    st.markdown("---")

    st.info("""
    💡 **Astuce** : Utilisez la barre latérale pour naviguer rapidement entre les différentes pages.
    """)

    st.success("""
    ✅ **Application prête à l'emploi !** Toutes les fonctionnalités de base sont opérationnelles.
    """)
