# 🎨 Bibliothèque d'Émojis Portfolio

Émojis stylés et cohérents pour l'application de gestion financière.

## 📦 Installation

```python
from resources.emojis import FINANCE, get_emoji, get_trend_emoji
```

## 🏦 Catégories disponibles

### Finance & Comptes
```python
FINANCE = {
    "bank": "🏦",           # Banque
    "savings": "🐷",        # Épargne
    "piggy_bank": "💰",     # Tirelire
    "money_bag": "💵",      # Liquide
    "credit_card": "💳",    # Carte
    "wallet": "👛",         # Portefeuille
}
```

### Investissements
```python
INVESTMENTS = {
    "chart_up": "📈",       # Graphique montant
    "stocks": "📊",         # Actions
    "trending_up": "🚀",    # Tendance haussière
    "target": "🎯",         # Objectif
}
```

### Dépenses
```python
EXPENSES = {
    "shopping": "🛒",       # Courses
    "restaurant": "🍽️",    # Restaurant
    "transport": "🚗",      # Transport
    "home": "🏠",          # Loyer
    "utilities": "💡",     # Électricité
    "phone": "📱",         # Téléphone
}
```

### Échéances
```python
SCHEDULE = {
    "calendar": "📅",      # Calendrier
    "bell": "🔔",          # Notification
    "warning": "⚠️",       # Alerte
    "urgent": "🚨",        # Urgent
}
```

### Objectifs
```python
GOALS = {
    "house": "🏡",         # Maison
    "car": "🚙",           # Voiture
    "vacation": "🏖️",     # Vacances
    "education": "🎓",     # Diplôme
}
```

## 🔧 Fonctions utilitaires

### `get_emoji(category, default="💳")`
Récupère l'emoji d'une catégorie automatiquement.

```python
emoji = get_emoji("restaurant")  # → 🍽️
emoji = get_emoji("courses")     # → 🛒
emoji = get_emoji("loyer")       # → 🏠
```

### `get_trend_emoji(value)`
Emoji de tendance selon la valeur.

```python
get_trend_emoji(21.5)   # → 🚀 (positif)
get_trend_emoji(-5.2)   # → 📉 (négatif)
get_trend_emoji(0)      # → ➡️ (neutre)
```

### `get_status_emoji(status)`
Emoji de statut.

```python
get_status_emoji("active")      # → 🟢
get_status_emoji("terminée")    # → ✔️
get_status_emoji("expirée")     # → ❌
```

### `get_urgency_emoji(days_left)`
Emoji d'urgence selon jours restants.

```python
get_urgency_emoji(1)   # → 🚨 (urgent)
get_urgency_emoji(3)   # → ⚠️ (attention)
get_urgency_emoji(7)   # → 🔔 (rappel)
get_urgency_emoji(30)  # → 📅 (normal)
```

## 💡 Exemples d'utilisation

### Dans Streamlit

```python
import streamlit as st
from resources.emojis import FINANCE, get_emoji, get_trend_emoji

# Afficher un compte
st.markdown(f"{FINANCE['bank']} **Compte Courant**: 3 842,50 €")

# Afficher une catégorie dynamique
category = "restaurant"
emoji = get_emoji(category)
st.markdown(f"{emoji} {category.title()}: 145 € / 200 €")

# Afficher une tendance
trend = 21.75
emoji = get_trend_emoji(trend)
st.markdown(f"PEA: 24 350 € {emoji} +{trend}%")
```

### Dans les cards

```python
# Card avec emoji
st.markdown(f"""
    <div class="card-header">
      <div class="card-title">
        {FINANCE['bank']} Liquidités
      </div>
    </div>
""", unsafe_allow_html=True)
```

### Dans les listes

```python
# Liste de transactions
for tx in transactions:
    emoji = get_emoji(tx.category)
    st.markdown(f"{emoji} {tx.description}: {tx.amount} €")
```

## 🎯 Mapping automatique

Le fichier contient un mapping complet des catégories :

```python
CATEGORY_ICONS = {
    "alimentation": "🍽️",
    "courses": "🛒",
    "transport": "🚗",
    "loyer": "🏠",
    "santé": "🏥",
    "loisirs": "🎬",
    # ... 30+ catégories
}
```

## 📊 Exemple complet

```python
from resources.emojis import *

# Compte avec tendance
account = {
    "name": "Compte Courant",
    "balance": 3842.5,
    "trend": 2.4
}

print(f"{FINANCE['bank']} {account['name']}")
print(f"Solde: {account['balance']} € {get_trend_emoji(account['trend'])} +{account['trend']}%")

# Échéance avec urgence
bill = {
    "name": "Électricité EDF",
    "amount": 89.0,
    "days_left": 1
}

urgency = get_urgency_emoji(bill['days_left'])
category = get_emoji("électricité")
print(f"{urgency} {category} {bill['name']}: {bill['amount']} € (J-{bill['days_left']})")
```

## 🚀 Avantages

✅ **Cohérence visuelle** : Émojis uniformes dans toute l'app  
✅ **Facile à utiliser** : Fonctions helper automatiques  
✅ **Extensible** : Ajoutez vos propres catégories  
✅ **Type-safe** : Dictionnaires bien définis  
✅ **Documenté** : Commentaires sur chaque emoji  

## 📝 Notes

- Les émojis sont **Unicode standard** (compatibles tous OS)
- Préférer les émojis **simples** (1 caractère) pour cohérence
- Utiliser `get_emoji()` pour **mapping automatique**
- Tester le rendu sur **Windows/Mac/Linux**

## 🔄 Mise à jour

Pour ajouter une catégorie :

```python
# Dans emojis.py
CATEGORY_ICONS = {
    # ... existant
    "nouvelle_categorie": "🆕",
}
```

Voilà ! Vos émojis sont prêts à être utilisés partout dans l'application ! 🎉
