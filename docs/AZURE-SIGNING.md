# 🔐 Guide — Signature numérique avec Azure Key Vault

> ⚠️ **Toutes les commandes sont en PowerShell (Windows).** Pas de `\` pour les retours à la ligne — tout est sur une seule ligne ou avec le backtick `` ` ``.

## Pourquoi signer ?

| Sans signature | Avec signature |
|---|---|
| ❌ SmartScreen : "Éditeur inconnu" | ✅ SmartScreen : "Djabi" (vérifié) |
| ❌ Détecté faux-positif par AV | ✅ Réputation immédiate auprès des AV |
| ❌ UAC bloque le lancement | ✅ UAC affiche ton nom |
| ❌ Bloqué sur réseaux d'entreprise | ✅ Autorisé |

---

## Étape 1 — Activer Azure for Students (gratuit)

1. Aller sur https://azure.microsoft.com/fr-fr/free/students/
2. Se connecter avec ton email universitaire
3. **100$ de crédits** activés automatiquement, aucune carte bancaire requise

---

## Étape 2 — Se connecter et créer le Key Vault

```powershell
# Recharger le PATH si az n'est pas reconnu (une seule fois par session)
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# Se connecter (ouvre le navigateur)
az login

# Créer un groupe de ressources
az group create --name gestio-rg --location francecentral

# Créer le Key Vault
az keyvault create --name gestio-kv --resource-group gestio-rg --location francecentral --sku standard
```

---

## Étape 3 — Créer un certificat de signature de code

> ⚠️ Pour SmartScreen : il faut un certificat **EV (Extended Validation)**.
> Pour commencer (tester le pipeline), un certificat auto-signé suffit.
> Pour la production, acheter un certificat EV chez DigiCert (~$300/an).

### Option A — Certificat auto-signé (tests, gratuit)

```powershell
az keyvault certificate create --vault-name gestio-kv --name gestio-codesign --policy "$(az keyvault certificate get-default-policy)"
```

### Option B — Importer un certificat EV acheté (production)

```powershell
# Importer le .pfx dans Key Vault
az keyvault certificate import --vault-name gestio-kv --name gestio-codesign --file gestio-codesign.pfx --password "MOT_DE_PASSE_PFX"
```

---

## Étape 4 — Créer une App Registration (identité pour GitHub Actions)

```powershell
# 1. Créer l'App Registration
az ad app create --display-name "gestio-github-actions"

# 2. Récupérer le client ID (noter cette valeur → AZURE_CLIENT_ID)
az ad app list --display-name "gestio-github-actions" --query "[].appId" -o tsv

# 3. Créer le Service Principal avec accès au Key Vault
#    Cette commande retourne directement CLIENT_ID, SECRET et TENANT_ID
az ad sp create-for-rbac --name "gestio-github-actions" --role "Key Vault Certificate User" --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/gestio-rg/providers/Microsoft.KeyVault/vaults/gestio-kv"

# ↑ Résultat :
# {
#   "appId":    "xxxxxxxx-..."   ← AZURE_CLIENT_ID
#   "password": "xxxxxxxx-..."   ← AZURE_CLIENT_SECRET  (noter immédiatement, visible une seule fois)
#   "tenant":   "xxxxxxxx-..."   ← AZURE_TENANT_ID
# }
```

---

## Étape 5 — Configurer les secrets GitHub

**Chemin :** dépôt GitHub → Settings → Secrets and variables → Actions → New repository secret

> ⚠️ Champ **Name** → le nom (underscores uniquement, pas d'espaces)
> ⚠️ Champ **Secret** → la valeur issue des commandes de l'Étape 4

| Name (à taper) | Secret (valeur à coller) |
|---|---|
| `AZURE_VAULT_URI` | `https://<nom-du-vault>.vault.azure.net/` |
| `AZURE_CLIENT_ID` | champ `appId` du résultat `az ad sp create-for-rbac` |
| `AZURE_TENANT_ID` | champ `tenant` du résultat `az ad sp create-for-rbac` |
| `AZURE_CLIENT_SECRET` | champ `password` du résultat `az ad sp create-for-rbac` ⚠️ visible une seule fois |

---

## Étape 6 — Tester le pipeline

```powershell
git tag v1.0.0-beta
git push origin v1.0.0-beta
```

Vérifier dans GitHub Actions que les étapes "🔐 Signer" passent en vert.

---

## Étape 7 — Soumettre aux portails False Positive

Une fois l'app signée et publiée, soumettre aux portails AV pour bâtir la réputation :

| Antivirus | Portail | Délai |
|---|---|---|
| **Microsoft Defender** | https://www.microsoft.com/en-us/wdsi/filesubmission | 24-48h |
| **Windows SmartScreen** | Inclus dans la soumission Defender | Automatique |
| **Avast / AVG** | https://www.avast.com/false-positive-file-form.php | 2-5 jours |
| **Kaspersky** | https://opentip.kaspersky.com/ | 2-5 jours |
| **Malwarebytes** | https://forums.malwarebytes.com/forum/122-false-positives/ | 3-7 jours |
| **ESET** | https://support.eset.com/en/submit-a-file | 2-5 jours |
| **VirusTotal** | https://www.virustotal.com/gui/home/upload | Analyse immédiate |

### Procédure recommandée

1. **VirusTotal d'abord** → uploader l'installeur signé → noter les AV qui détectent
2. **Soumettre uniquement aux AV qui détectent**
3. **Joindre** dans chaque soumission :
   - Le fichier `.exe` signé
   - Description : "Application Python compilée avec PyInstaller, signée avec certificat Azure Key Vault"
   - Le lien GitHub public du projet (le code source rassure)
4. **Attendre 5-7 jours** → les signatures sont mises à jour

---

## Pourquoi PyInstaller déclenche les AV ?

PyInstaller pack du Python dans un exécutable Windows — ce comportement ressemble
à ce que font certains malwares (auto-extraction). C'est un faux-positif connu.

**La signature numérique résout 80% du problème.** Les 20% restants se règlent avec les soumissions False Positive.
