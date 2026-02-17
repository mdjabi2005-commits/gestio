"""
Émojis et icônes stylées pour l'application portfolio.
Inspiré du design Next.js avec des émojis cohérents et professionnels.
"""

# 🏦 Finance & Comptes
FINANCE = {
    "bank": "🏦",           # Banque / Compte courant
    "savings": "🐷",        # Épargne / Livret
    "piggy_bank": "💰",     # Tirelire / Économies
    "money_bag": "💵",      # Argent liquide
    "credit_card": "💳",    # Carte bancaire
    "wallet": "👛",         # Portefeuille
    "safe": "🔐",           # Coffre-fort
    "coin": "🪙",           # Pièce
}

# 📈 Investissements & Trading
INVESTMENTS = {
    "chart_up": "📈",       # Graphique montant
    "chart_down": "📉",     # Graphique descendant
    "stocks": "📊",         # Actions / Bourse
    "trending_up": "🚀",    # Tendance haussière
    "trending_down": "📉",  # Tendance baissière
    "growth": "🌱",         # Croissance
    "target": "🎯",         # Objectif
    "trophy": "🏆",         # Réussite
}

# 💳 Dépenses & Budget
EXPENSES = {
    "shopping": "🛒",       # Courses
    "restaurant": "🍽️",    # Restaurant
    "coffee": "☕",         # Café
    "transport": "🚗",      # Transport
    "gas": "⛽",           # Essence
    "home": "🏠",          # Loyer / Maison
    "utilities": "💡",     # Électricité / Services
    "phone": "📱",         # Téléphone
    "internet": "🌐",      # Internet
    "health": "🏥",        # Santé
    "pharmacy": "💊",      # Pharmacie
    "education": "📚",     # Éducation
    "entertainment": "🎬", # Loisirs
    "sports": "⚽",        # Sport
    "travel": "✈️",        # Voyage
    "gift": "🎁",          # Cadeau
}

# 📅 Échéances & Récurrence
SCHEDULE = {
    "calendar": "📅",      # Calendrier
    "clock": "⏰",         # Horloge
    "bell": "🔔",          # Notification
    "warning": "⚠️",       # Alerte
    "urgent": "🚨",        # Urgent
    "check": "✅",         # Validé
    "pending": "⏳",       # En attente
    "repeat": "🔄",        # Récurrent
}

# 🎯 Objectifs & Projets
GOALS = {
    "target": "🎯",        # Objectif
    "house": "🏡",         # Maison
    "car": "🚙",           # Voiture
    "vacation": "🏖️",     # Vacances
    "wedding": "💍",       # Mariage
    "baby": "👶",          # Bébé
    "education": "🎓",     # Diplôme
    "business": "💼",      # Entreprise
    "retirement": "🌴",    # Retraite
}

# 🔧 UI & Navigation
UI = {
    "search": "🔍",        # Recherche
    "settings": "⚙️",      # Paramètres
    "user": "👤",          # Utilisateur
    "logout": "🚪",        # Déconnexion
    "download": "⬇️",      # Télécharger
    "upload": "⬆️",        # Importer
    "edit": "✏️",          # Éditer
    "delete": "🗑️",       # Supprimer
    "add": "➕",           # Ajouter
    "remove": "➖",        # Retirer
    "info": "ℹ️",          # Information
    "help": "❓",          # Aide
}

# ✅ Statuts & États
STATUS = {
    "success": "✅",       # Succès
    "error": "❌",         # Erreur
    "warning": "⚠️",       # Avertissement
    "info": "ℹ️",          # Information
    "loading": "⏳",       # Chargement
    "done": "✔️",          # Terminé
    "pending": "⏸️",       # En pause
    "active": "🟢",       # Actif
    "inactive": "🔴",     # Inactif
}

# 🏷️ Catégories par défaut (mapping)
CATEGORY_ICONS = {
    # Alimentation
    "alimentation": "🍽️",
    "courses": "🛒",
    "restaurant": "🍽️",
    "café": "☕",
    
    # Transport
    "transport": "🚗",
    "essence": "⛽",
    "parking": "🅿️",
    "taxi": "🚕",
    
    # Logement
    "loyer": "🏠",
    "charges": "🏠",
    "électricité": "💡",
    "eau": "💧",
    "gaz": "🔥",
    "internet": "🌐",
    "téléphone": "📱",
    
    # Santé
    "santé": "🏥",
    "pharmacie": "💊",
    "médecin": "👨‍⚕️",
    
    # Loisirs
    "loisirs": "🎬",
    "sport": "⚽",
    "voyage": "✈️",
    "culture": "🎭",
    
    # Autres
    "éducation": "📚",
    "vêtements": "👕",
    "beauté": "💄",
    "cadeaux": "🎁",
    "assurance": "🛡️",
    "impôts": "📋",
    "épargne": "💰",
    "investissement": "📈",
    "retrait": "💵",
}


def get_emoji(category: str, default: str = "💳") -> str:
    """
    Récupère l'emoji correspondant à une catégorie.
    
    Args:
        category: Nom de la catégorie
        default: Emoji par défaut si non trouvé
        
    Returns:
        Emoji correspondant
    """
    if not category:
        return default
    
    category_lower = category.lower()
    return CATEGORY_ICONS.get(category_lower, default)


def get_trend_emoji(value: float) -> str:
    """
    Récupère l'emoji de tendance selon la valeur.
    
    Args:
        value: Valeur de tendance (positif = hausse, négatif = baisse)
        
    Returns:
        Emoji de tendance
    """
    if value > 0:
        return INVESTMENTS["trending_up"]
    elif value < 0:
        return INVESTMENTS["trending_down"]
    else:
        return "➡️"


def get_status_emoji(status: str) -> str:
    """
    Récupère l'emoji de statut.
    
    Args:
        status: Statut (active, terminée, expirée, etc.)
        
    Returns:
        Emoji de statut
    """
    status_map = {
        "active": STATUS["active"],
        "terminée": STATUS["done"],
        "expirée": STATUS["error"],
        "en attente": STATUS["pending"],
        "validé": STATUS["success"],
    }
    return status_map.get(status.lower(), STATUS["info"])


def get_urgency_emoji(days_left: int) -> str:
    """
    Récupère l'emoji d'urgence selon les jours restants.
    
    Args:
        days_left: Nombre de jours restants
        
    Returns:
        Emoji d'urgence
    """
    if days_left <= 1:
        return SCHEDULE["urgent"]
    elif days_left <= 3:
        return SCHEDULE["warning"]
    elif days_left <= 7:
        return SCHEDULE["bell"]
    else:
        return SCHEDULE["calendar"]


# Export des dictionnaires principaux
__all__ = [
    "FINANCE",
    "INVESTMENTS",
    "EXPENSES",
    "SCHEDULE",
    "GOALS",
    "UI",
    "STATUS",
    "CATEGORY_ICONS",
    "get_emoji",
    "get_trend_emoji",
    "get_status_emoji",
    "get_urgency_emoji",
]
