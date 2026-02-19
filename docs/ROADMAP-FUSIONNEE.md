# Roadmap Gestio - 4 Piliers pour une App Professionnelle "Indestructible"

## Contexte du Projet

**Projet :** Gestio - Application de gestion financière
**Stack :** Streamlit + Python + SQLite + OCR (RapidOCR/EasyOCR)
**Objectif :** Transformer l'app actuelle en produit professionnel via le GitHub Student Pack

**Analyse du code actuel :**
- **Architecture** : DDD (Domain-Driven Design) bien structuré
- **UI** : Streamlit avec CSS custom (responsive.css, theme_v2.css)
- **OCR** : RapidOCR + EasyOCR avec détection hardware (hardware_utils.py)
- **Base de données** : SQLite avec WAL mode, pas de chiffrement
- **Services** : Séparation claire (OCR, Transaction, Recurrence)

---

| Pilier | État Actuel | Problème |
|--------|-------------|----------|
| Performance | OCR synchrone | Bloque l'UI Streamlit |
| Intelligence Locale | Catégorisation manuelle | Pas de NLP local |
| Sécurité | SQLite non chiffré | Données financières vulnérables |
| Mobile | CSS responsive basique | Pas de PWA, pas installable |

---

# Pilier 1 : PERFORMANCE (Multiprocessing & Concurrence)

## Lacune identifiée

Dans `domains/transactions/ocr/services/ocr_service.py`, le traitement OCR est **synchrone** :

```python
# Ligne 175 - Bloque l'UI Streamlit complètement
raw_text = self.ocr_engine.extract_text(image_path)
```

Le fichier `hardware_utils.py` détecte bien les 14 cœurs mais **n'est jamais utilisé** pour paralléliser le travail. L'OCR tourne sur 1 seul thread et freeze l'interface pendant le scan.

## Compétence à acquérir

**Multiprocessing & Concurrence Python** :
- `concurrent.futures.ProcessPoolExecutor` pour paralléliser les tâches CPU-bound (OCR)
- `asyncio` pour les I/O non-bloquantes
- Pattern Producer/Consumer avec queues
- Gestion des processus vs threads (GIL Python)

## Ressource Pack

| Formation | Cours précis | Lien |
|-----------|-------------|------|
| **Educative** | "Python Concurrent Programming" | [S'inscrire](https://www.educative.io/github) |
| **Educative** | "Building Data Science Web Apps with Streamlit" - Chapitre Async | [S'inscrire](https://www.educative.io/github) |
| **DataCamp** | "Python Programming" - Chapitre Parallel | [S'inscrire](https://www.datacamp.com/github-students) |

## Exercice pratique

**Implémenter un worker OCR asynchrone avec progress bar :**

1. Créer un `ProcessPoolExecutor` avec `max_workers=os.cpu_count() - 2`
2. Implémenter un système de queue pour traiter les tickets en background
3. Ajouter une progress bar Streamlit (`st.progress()`) pendant le traitement
4. Utiliser `st.fragment` ou `st.rerun()` pour mettre à jour l'UI sans blocage

```python
# Code cible à atteindre
from concurrent.futures import ProcessPoolExecutor
import streamlit as st

def process_ocr_background(file_paths: list):
    with ProcessPoolExecutor(max_workers=12) as executor:
        results = list(executor.map(ocr_engine.extract_text, file_paths))
    return results
```

**Métrique de validation :** L'UI reste fluide pendant le traitement d'un ticket avec une progress bar et le traitement utilise 12+ cœurs CPU.

---

# Pilier 2 : INTELLIGENCE LOCALE (NLP/SLM)

## Lacune identifiée

Dans `domains/transactions/database/model.py`, la catégorisation est **entièrement manuelle** :

```python
# Ligne 32 - Valeur par défaut, l'utilisateur doit choisir
categorie: str = Field("Non catégorisé", description="Catégorie principale")
```

Le parser LLM existe (`llm_parser.py`) mais n'est pas intégré pour l'auto-catégorisation. L'utilisateur doit manuellement sélectionner :
- Catégorie principale (Alimentation, Transport, etc.)
- Sous-catégorie

## Compétence à acquérir

**NLP Local & Small Language Models (SLM)** :
- Fine-tuning de modèles légère (DistilBERT, TinyLlama)
- Inference locale avec ONNX Runtime
- Hugging Face Transformers offline
- Classification de texte sans API externe

## Ressource Pack

| Formation | Cours précis | Lien |
|-----------|-------------|------|
| **Educative** | "Natural Language Processing with Python" | [S'inscrire](https://www.educative.io/github) |
| **Educative** | "Machine Learning Engineering" - Chapitre ML local | [S'inscrire](https://www.educative.io/github) |
| **Azure for Students** | 100$ crédit pour tester des modèles plus lourds | [S'inscrire](https://azure.microsoft.com/fr-fr/free/students/) |

| Modèle | Usage | Lien |
|--------|-------|------|
| **DistilBERT-base-uncased-finetuned-sst-2** | Classification sentiments (50MB) | [Hugging Face](https://huggingface.co/) |
| **TinyLlama-1.1B** | SLM local (1GB) | [Hugging Face](https://huggingface.co/) |
| **bert-base-uncased** | Classification personnalisée | [Hugging Face](https://huggingface.co/) |
| **facebook/bart-large-mnli** | Zero-shot classification | [Hugging Face](https://huggingface.co/) |
| **cardiffnlp/twitter-roberta-base-sentiment-latest** | Sentiment analysis | [Hugging Face](https://huggingface.co/) |

| Outil | Usage | Lien |
|-------|-------|------|
| **Deepnote** | Prototyper les notebooks ML | [S'inscrire](https://deepnote.com/) |

## Exercice pratique

**Entraîner un classifier de catégories local :**

1. Créer un dataset de 50-100 transactions labelisées (catégories existantes)
2. Fine-tuner un modèle `bert-base-uncased` sur la classification
3. Exporter le modèle en ONNX pour inference rapide
4. Intégrer dans `transaction_service.py` pour suggérer automatiquement la catégorie

```python
# Code cible à atteindre
from transformers import pipeline

# Chargement local - pas d'API externe
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device="cpu"  # Local, pas de GPU needed
)

def auto_categorize(description: str, categories: list) -> str:
    result = classifier(description, candidate_labels=categories)
    return result['labels'][0]  # Catégorie suggérée
```

**Métrique de validation :** Ajouter une transaction → Le système suggère automatiquement "Alimentation" avec 85%+ de confiance, sans appel cloud.

---

# Pilier 3 : SÉCURITÉ BANCAIRE (Chiffrement)

## Lacune identifiée

Dans `shared/database/connection.py`, SQLite est **non chiffré** :

```python
# Ligne 32 - Connexion plain text
conn = sqlite3.connect(actual_db_path, timeout=max(timeout, 30.0))
# Pas de chiffrement, pas de mot de passe
```

Les données financières sensibles (montants, IBAN, descriptions) sont stockées en **plain text**. N'importe qui avec accès au fichier `.db` peut lire toutes les données.

## Compétence à acquérir

**Chiffrement de base de données locale** :
- SQLite avec extension `sqlcipher` ou `SQLite Encryption Extension`
- Clé de chiffrement dérivée du mot de passe utilisateur (PBKDF2)
- Stockage sécurisé des credentials (1Password pour dev)
- Bonnes pratiques PCI-DSS niveau 1 (même en local)

## Ressource Pack

| Formation | Cours précis | Lien |
|-----------|-------------|------|
| **Educative** | "Database Design with SQLite" - Chapitre Security | [S'inscrire](https://www.educative.io/github) |
| **Educative** | "Python Security Cookbook" | [S'inscrire](https://www.educative.io/github) |
| **1Password** | Gestionnaire de mots de passe (1 an gratuit) | [Activer](https://1password.com/) |

| Outil | Usage | Lien |
|-------|-------|------|
| **sqlcipher** | Chiffrement AES-256 pour SQLite | [Site](https://www.zetetic.net/sqlcipher/) |
| **cryptography** | Librairie Python pour clés | [PyPI](https://pypi.org/project/cryptography/) |
| **keyring** | Stockage sécurisé des credentials | [PyPI](https://pypi.org/project/keyring/) |

## Exercice pratique

**Implémenter SQLite chiffré avec clé dérivée :**

1. Installer `sqlcipher` ou utiliser `cryptography` pour chiffrer le fichier DB
2. Implémenter une fonction de dérivation de clé (PBKDF2)
3. Stocker le sel dans un fichier séparé ou le trousseau système
4. Ajouter un écran de déverrouillage au démarrage (mot de passe ou PIN)

```python
# Code cible à atteindre
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import base64

def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def encrypt_database(db_path: str, password: str):
    """Chiffrer la base SQLite existante"""
    # Implémenter avec sqlcipher ou chiffrement au niveau fichier
    pass
```

**Métrique de validation :**
- Ouvrir le fichier `.db` avec un éditeur → Les données sont illisibles
- Lancer l'app → Demande un mot de passe → Déchiffre et fonctionne normalement

---

# Pilier 4 : FINITION MOBILE (PWA/UX)

## Lacune identifiée

Le fichier `resources/styles/responsive.css` contient des styles de base :

```css
/* Apenas quelques règles */
@media (max-width: 768px) {
    .stButton > button { width: 100%; }
}
```

**Problèmes identifiés :**
- Pas de PWA (Progressive Web App) - impossible d'installer sur mobile
- Navigation non optimisée pour petit écran
- Les tableaux de données ne sont pas responsives
- Pas d'offline capability

## Compétence à acquérir

**PWA & Responsive Design Avancé** :
- Manifest PWA (`manifest.json`)
- Service Workers pour offline-first
- Meta tags pour mobile
- CSS Grid/Flexbox avancé
- Touch-friendly interfaces

## Ressource Pack

| Formation | Cours précis | Lien |
|-----------|-------------|------|
| **FrontendMasters** | "Introduction to HTML/CSS" | [S'inscrire](https://frontendmasters.com/github-students/) |
| **FrontendMasters** | "Designing UI/UX" | [S'inscrire](https://frontendmasters.com/github-students/) |
| **FrontendMasters** | "Progressive Web Apps" | [S'inscrire](https://frontendmasters.com/github-students/) |
| **Scrimba** | "Build Python Web Apps" | [S'inscrire](https://scrimba.com/github) |
| **Educative** | "Progressive Web Apps in React" | [S'inscrire](https://www.educative.io/github) |

## Exercice pratique

**Transformer Gestio en PWA installable :**

1. Créer un `manifest.json` avec icônes, couleurs, mode d'affichage
2. Créer un Service Worker pour le caching offline
3. Ajouter les meta tags viewport pour mobile
4. Optimiser le CSS pour les petits écrans (touch targets 44px+)
5. Ajouter un mode "hors ligne" qui affiche les données en cache

```json
// manifest.json
{
  "name": "Gestio - Gestion Financière",
  "short_name": "Gestio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e1e1e",
  "theme_color": "#00CC96",
  "icons": [
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"}
  ]
}
```

```javascript
// service-worker.js (Streamlit static folder)
const CACHE_NAME = 'gestio-v1';
const urlsToCache = ['/', '/index.html', '/static/css/main.css'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});
```

**Métrique de validation :**
- Ouvrir sur mobile → Message "Ajouter à l'écran d'accueil"
- Installer → Appears comme une app native avec icône
- Mode avion → L'app fonctionne avec les données en cache

---

# Roadmap Synthétique (4-6 mois)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MOIS 1 : PERFORMANCES                              │
├─────────────────────────────────────────────────────────────────────────┤
│ S1-S2 : Educative → Python Concurrent Programming                      │
│ S3-S4 : Implémenter ProcessPoolExecutor pour OCR                       │
│ ▶ Résultat : OCR sur 12 cœurs sans freeze UI                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     MOIS 2 : IA LOCALE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ S1-S2 : Hugging Face → Datasets & Models                               │
│ S3-S4 : Entraîner classifier catégories (bert-base)                    │
│ ▶ Résultat : Auto-catégorisation sans cloud                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     MOIS 3 : SÉCURITÉ                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ S1-S2 : Educative → Database Security + 1Password setup               │
│ S3-S4 : Implémenter SQLite chiffré                                    │
│ ▶ Résultat : Données bancaires illisibles sans mot de passe            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     MOIS 4 : MOBILE PWA                                │
├─────────────────────────────────────────────────────────────────────────┤
│ S1-S2 : FrontendMasters → HTML/CSS + UI/UX                            │
│ S3-S4 : Créer manifest.json + Service Worker                          │
│ ▶ Résultat : App installable sur mobile, mode offline                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Checklist de Validation

## Mois 1 - Performance
- [ ] ProcessPoolExecutor implémenté
- [ ] Progress bar Streamlit fonctionnelle
- [ ] Benchmark : 10 tickets traités en < 5 secondes (vs 30s avant)

## Mois 2 - IA Locale
- [ ] Dataset de 50+ transactions labelisées créé
- [ ] Modèle fine-tuné et exporté ONNX
- [ ] Fonction `auto_categorize()` intégrée
- [ ] Précision > 80% sur les suggestions

## Mois 3 - Sécurité
- [ ] Base SQLite chiffrée
- [ ] Écran de déverrouillage au démarrage
- [ ] Clé dérivées avec PBKDF2 (100K itérations)
- [ ] Données illisibles avec hex editor

## Mois 4 - Mobile PWA
- [ ] Manifest.json créé
- [ ] Service Worker enregistré
- [ ] Test sur mobile : "Ajouter à l'écran d'accueil"
- [ ] Mode offline fonctionnel

---

# Checklist d'Activation

## Cette semaine
- [ ] Activer le **GitHub Student Pack** : https://education.github.com/pack/
- [ ] S'inscrire à **Educative** : https://www.educative.io/github
- [ ] S'inscrire à **FrontendMasters** : https://frontendmasters.com/github-students/

## Ce mois
- [ ] Commencer **Educative** → "Python Concurrent Programming"
- [ ] Commencer **FrontendMasters** → "Progressive Web Apps"
- [ ] Activer **1Password** (via le Pack)

## Prochains mois
- [ ] Explorer **Hugging Face** pour les modèles NLP
- [ ] Activer **Azure for Students** pour les tests ML
- [ ] Configurer **Deepnote** pour les prototypes

---

# Ressources Rapides

| Action | Lien |
|--------|------|
| **Activer GitHub Student Pack** | https://education.github.com/pack/ |
| **Educative - 6 mois** | https://www.educative.io/github |
| **DataCamp - 3 mois** | https://www.datacamp.com/github-students |
| **FrontendMasters - 6 mois** | https://frontendmasters.com/github-students/ |
| **1Password - 1 an** | https://1password.com/ |
| **Azure for Students - 100$** | https://azure.microsoft.com/fr-fr/free/students/ |
| **Hugging Face Models** | https://huggingface.co/models |
| **Deepnote** | https://deepnote.com/ |

---

# ==============================================================
# AUDIT TECHNIQUE & COMPLÉMENTS V4 (Ajouté le 19/02/2026)
# ==============================================================

## Synthèse des manques identifiés

*Basé sur l'audit du code V1 existant, voici les points techniques critiques qui manquaient dans la roadmap initiale.*

### 🛠️ Pilier 0 : Refactoring de la Dette Technique (Prioritaire)

| Composant | Problème Identifié dans le Code | Solution Cible |
| :--- | :--- | :--- |
| **`launcher.py`** | Mélange Tkinter/Streamlit, fragile, 265 lignes de dette. Force l'utilisation d'une fenêtre Tkinter obsolète. | **Suppression totale**. Remplacement par un script `run.py` (3 lignes) pour un lancement natif dans le navigateur par défaut (Chrome/Edge). |
| **`ocr_service.py`** | Synchrone, bloque l'UI, utilise 1 cœur sur 14. Aucun worker pool configuré. | **Multiprocessing**. Utilisation de `ProcessPoolExecutor` (12 cœurs). Séparation I/O et CPU. |
| **`pattern_manager.py`** | Regex statiques uniquement. Ne gère pas les variations de tickets. 0 Intelligence. | **Architecture Twin Heuristic**. Garder Regex pour Date/Monnaie. Déléguer "Marchand" à une IA locale (SLM TinyLlama). |

### 🛡️ Pilier 5 : Qualité Industrielle (CI/CD)

*Ce pilier manquait totalement mais est vital pour une approche "Pro" et sécurisée.*

- [ ] **Tests Unitaires (`tests/`)** :
    - Fichiers `test_ocr.py`, `test_db.py`.
    - Utilisation de `pytest`.
- [ ] **Linting Strict** :
    - Configurer `ruff` ou `pylint` pour interdire les `print()` et les variables inutilisées.
- [ ] **CI Pipeline** :
    - Créer `.github/workflows/test.yml` qui lance les tests AVANT de permettre la création d'une Release.

### 📦 Pilier 6 : Environnement & Dépendances

- [ ] **Gestionnaire de paquets** :
    - Abandonner `requirements.txt` (trop fragile).
    - Adopter **`uv`** (Universal Virtualenv) ou **Poetry**.
    - Fichier `pyproject.toml` unique pour gérer toutes les dépendances.
- [ ] **IDE** :
    - Configurer PyCharm pour utiliser l'interpréteur virtuel créé par `uv`.

---
*Roadmap mise à jour avec les constats d'audit V4.*
