# 🎨 Shared UI Components

Composants d'interface réutilisables pour garantir une identité visuelle cohérente (Design System).

## 🔔 Notifications (`toast_components.py`)

Remplace les `st.success` standards par des "Toasts" flottants plus modernes et moins intrusifs.

-   `toast_success("Message")` : ✅ Vert
-   `toast_warning("Message")` : ⚠️ Orange
-   `toast_error("Message")` : ❌ Rouge

Techniquement, cela injecte du code HTML/CSS/JS personnalisé dans la page Streamlit.

## 🏷️ Badges & Cartes

Système d'affichage standardisé pour les transactions.

### Badges (`get_badge_html`)
Génère une petite étiquette colorée selon la source.
-   🧾 **Ticket (OCR)** : Bleu
-   📄 **Facture (PDF)** : Orange
-   📝 **Manuel** : Gris

### Carte Transaction (`afficher_carte_transaction`)
Le composant standard pour afficher le détail d'une opération.
Il gère :
-   La mise en page (Colonnes).
-   La couleur du montant (+Vert / -Rouge).
-   L'affichage intelligent des pièces jointes (Onglets Image/PDF).

## 🖌️ Styles (`styles.py`)

Contient les feuilles de style CSS globales. Usage de variables CSS pour faciliter le passage en Dark Mode (géré nativement par Streamlit mais surchargé ici pour certains composants custom).
