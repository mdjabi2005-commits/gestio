---
description: Travailler avec les GitHub Issues - conventions de commits, branches et workflow
---

# Workflow GitHub Issues

## 1. Créer une branche liée à une issue

Toujours créer une branche depuis l'issue GitHub elle-même :
- Sur GitHub : Issue → **"Create a branch"** (cela crée automatiquement `{numero}-{titre-issue}`)
- Exemple : issue #7 → branche `7-finir-la-conception`

## 2. Convention de commits

Chaque commit doit référencer l'issue avec `#{numéro}` dans le message.

```
git commit -m "feat: description de la fonctionnalité #7"
git commit -m "fix: correction du bug #7"
git commit -m "chore: mise à jour de la config #7"
```

### Préfixes recommandés (Conventional Commits)
- `feat:` → nouvelle fonctionnalité
- `fix:` → correction de bug
- `chore:` → tâche technique (config, deps...)
- `docs:` → documentation
- `refactor:` → refactoring sans changement de comportement
- `style:` → mise en forme, CSS

## 3. Pousser et créer la Pull Request

```bash
git push origin {nom-de-la-branche}
```

Sur GitHub → **"Compare & pull request"** → titre au format :
```
feat: titre de la fonctionnalité (#numéro)
```

Dans la description de la PR, utilise `Closes #7` ou `Fixes #7` pour fermer l'issue automatiquement au merge.

## 4. Au merge de la PR

GitHub fermera automatiquement l'issue si la PR contient `Closes #7`.
La branche peut alors être supprimée.

## 5. Référencer l'issue dans les messages de l'agent

Lors de chaque session de travail sur une issue, indiquer le numéro d'issue à l'agent en début de session :
> "On travaille sur l'issue #7, rappelle-toi de référencer #7 dans chaque commit."
