# 🚀 Build Gestio V4

## 📦 Deux configurations

### 1️⃣ **Tests locaux** (rapide)
```bash
pyinstaller gestio-dev.spec
```
- ✅ Build rapide (~2-3 min)
- 📁 Résultat : `dist/GestioV4/` (dossier avec fichiers)
- 🎯 Usage : tester l'application compilée

### 2️⃣ **Distribution** (production)
```bash
pyinstaller gestio.spec
```
- ⏱️ Build plus long (~5-10 min)
- 📄 Résultat : `dist/GestioV4.exe` (un seul fichier)
- 🎯 Usage : distribuer aux utilisateurs

## 🧪 Tester en local

1. Build rapide :
   ```bash
   pyinstaller gestio-dev.spec
   ```

2. Lancer :
   ```bash
   dist\GestioV4\GestioV4.exe
   ```

## 📤 Distribution

1. Build final :
   ```bash
   pyinstaller gestio.spec
   ```

2. Distribuer :
   - Fichier : `dist/GestioV4.exe`
   - Taille : ~150-300 MB
   - Autonome : aucune dépendance

## 🔧 GitHub Actions

Pour automatiser la release sur GitHub, créez `.github/workflows/build.yml` (à faire plus tard).
