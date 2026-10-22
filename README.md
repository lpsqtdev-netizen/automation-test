# Vinted Companion — extension Chrome

Version 1.0.0 · Manifest V3 · Interface française · traitement local.

## Fonctionnalités
- Analyse manuelle des annonces détectées dans la page Vinted ouverte : nombre, prix moyen et minimum.
- Détection fondée sur plusieurs sélecteurs de cartes, avec un mécanisme de repli sur les liens d'annonces.
- Filtre local par titre, prix ou URL.
- Sélection locale, historique de prix observés et signalement d'une baisse entre deux analyses manuelles.
- Export CSV des résultats et du suivi.
- Calculateur de marge de revente.
- Prise en charge des domaines Vinted France, Belgique, Allemagne, Espagne, Italie, Pays-Bas, Pologne et Portugal, avec ou sans préfixe `www`.
- Aucune connexion externe, aucun achat ou message automatique, aucune collecte périodique en arrière-plan.

## Installation pour test
1. Télécharge le ZIP de la branche ou le paquet `vinted-companion-chrome.zip` depuis les artefacts de validation GitHub Actions.
2. Décompresse le ZIP dans un dossier permanent.
3. Ouvre `chrome://extensions` dans Chrome ou un navigateur Chromium compatible.
4. Active le **mode développeur**, puis sélectionne **Charger l'extension non empaquetée**.
5. Sélectionne le dossier décompressé contenant `manifest.json`.
6. Ouvre une page de résultats Vinted, recharge-la, puis clique sur l'extension et lance l'analyse.

## Développement et tests
Nécessite Node.js 20+ :

```sh
node --check parser.js
node --check content.js
node --check popup.js
node --test tests/parser.test.js
```

GitHub Actions exécute ces vérifications et prépare un ZIP d'installation à chaque push sur la branche de développement ou sur `main`, ainsi qu'à chaque pull request vers `main`.

## Limites connues
- La détection dépend du HTML que Vinted sert à votre compte et peut nécessiter une mise à jour.
- L'extension lit les annonces rendues dans la page ; faire défiler la page peut être nécessaire pour charger plus de résultats.
- L'historique n'est actualisé que lors d'analyses manuelles, et seulement si l'annonce suivie apparaît dans les résultats analysés.
- Le prix moyen porte sur les annonces détectées, pas sur tout le catalogue Vinted.
- Les conditions d'utilisation de Vinted peuvent limiter les outils externes : vérifiez qu'un usage donné est autorisé.

## Confidentialité
Voir [PRIVACY.md](PRIVACY.md). Les données suivies restent dans le stockage local de Chrome et ne sont pas envoyées à un serveur par l'extension.

Extension indépendante, non affiliée à Vinted. Pas encore publiée sur le Chrome Web Store : le chargement non empaqueté est destiné aux tests et à une distribution directe contrôlée.
