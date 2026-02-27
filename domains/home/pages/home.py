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
        st.page_link("add", label="➕ Ajouter une Transaction", icon="➕", use_container_width=True)

    with col2:
        st.markdown("""
### 📊 Voir vos Transactions

Consultez la page **"Voir Transactions"** pour :
- 📋 Tableau interactif et éditable
- 🔍 Filtres avancés (date, type, catégorie)
- ✏️ Modification directe des données
- 🗑️ Suppression de transactions
""")
        st.page_link("view", label="📊 Voir mes Transactions", icon="📊", use_container_width=True)

    st.markdown("---")

    st.markdown("""
<div class="stInfo">
    💡 <strong>Astuce</strong> : Utilisez la barre latérale pour naviguer rapidement entre les différentes pages.
</div>
<br>
<div class="stSuccess">
    ✅ <strong>Application prête à l'emploi !</strong> Toutes les fonctionnalités de base sont opérationnelles.
</div>
""", unsafe_allow_html=True)
