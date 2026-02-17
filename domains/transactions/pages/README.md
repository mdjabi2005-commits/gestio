# 📄 Contrôleurs de Page (Pages)

Ce dossier contient les **points d'entrée** de l'interface utilisateur pour le domaine Transactions.
Chaque fichier correspond (généralement) à une "Page" accessible depuis le menu latéral.

## 📂 Contenu

### 1. `view.py` (Voir Transactions)
- **Rôle** : Dashboard principal d'exploration.
- **Responsabilité** :
    - Charger les données via `TransactionRepository`.
    - Assembler les composants de visualisation (`view/components`).
    - Gérer la logique de filtrage global.

### 2. `add.py` (Ajouter Transaction)
- **Rôle** : Formulaire d'entrée de données.
- **Responsabilité** :
    - Gérer les différents modes de saisie :
        - ✍️ **Manuel** : Formulaire simple.
        - 🧾 **Ticket (OCR)** : Upload image -> Appel `OCRService`.
        - 📄 **Relevé (PDF)** : Upload PDF -> Appel `OCRService`.
    - Valider les données avant envoi au Repository.

### 3. `recurrences.py` (Gestion Récurrences)
- **Rôle** : "Centre de commande" des abonnements.
- **Responsabilité** :
    - Lister les récurrences actives.
    - Afficher les projections de coûts (Mensuel/Annuel).
    - Permettre la suppression d'abonnements.

---

## 🧠 Architecture "Page Controller"

Ces fichiers agissent comme des **Contrôleurs** dans un modèle MVC.
Ils ne contiennent pas de logique métier complexe ("Comment calculer une TVA ?") ni de code SQL ("SELECT * FROM...").
Leur travail est de :
1.  **Recevoir** l'action utilisateur (Clic bouton).
2.  **Appeler** le bon Service ou Repository.
3.  **Mettre à jour** l'affichage (via `st.rerun()`).
