# Vinted Companion — Chrome et Firefox

Version 1.2.0 · Manifest V3 · Interface française · traitement local.

## Fonctionnalités
- Analyse manuelle des annonces visibles : nombre, prix moyen et minimum.
- Détection par plusieurs sélecteurs et solution de repli.
- Filtre local par titre, prix ou URL.
- Suivi local, historique des prix observés et signalement d'une baisse entre deux analyses manuelles.
- Export CSV et calculateur de marge.
- Tableau de bord complet : inventaire local, statuts (à préparer/en ligne/vendu), prix d’achat, frais, prix cible, bénéfice estimé et recherche.
- Préparation manuelle de brouillons de titre/description, avec validation avant publication.
- Sauvegarde JSON de l’inventaire et import explicite avec confirmation.
- Domaines Vinted FR, BE, DE, ES, IT, NL, PL et PT, avec ou sans `www`.
- API de navigateur compatible avec `browser` (Firefox) et `chrome` (Chrome/Chromium).
- Pas d'achat ou de message automatique, pas de serveur, pas de collecte périodique en arrière-plan.

## Audit produit\nLe benchmark des outils concurrents, l'état initial et la feuille de route sont documentés dans [docs/COMPETITOR-AUDIT.md](docs/COMPETITOR-AUDIT.md).\n\n## Tableau de bord
Depuis la popup, clique sur **Ouvrir le tableau de bord complet** pour gérer ton inventaire. Les articles sont conservés dans le stockage local du navigateur. L’import/export JSON sert à sauvegarder ou transférer tes données. Les brouillons de titres et descriptions sont des suggestions locales et ne sont jamais publiés automatiquement.

## Installation dans Chrome
1. Télécharge l'artefact `vinted-companion-chrome.zip` depuis GitHub Actions et décompresse-le.
2. Ouvre `chrome://extensions`.
3. Active le mode développeur, puis clique sur **Charger l'extension non empaquetée**.
4. Sélectionne le dossier décompressé contenant `manifest.json`.
5. Ouvre une page de résultats Vinted, recharge-la puis lance l'analyse.

## Installation dans Firefox
1. Télécharge l'artefact `vinted-companion-firefox.zip` depuis GitHub Actions et décompresse-le.
2. Ouvre `about:debugging#/runtime/this-firefox`.
3. Clique sur **Charger un module complémentaire temporaire…**.
4. Sélectionne le fichier `manifest.json` dans le dossier décompressé.
5. Ouvre une page Vinted prise en charge, recharge-la et lance l'analyse.

**Note Firefox :** le chargement via `about:debugging` est temporaire et peut disparaître au redémarrage. Pour une installation permanente, il faut soumettre le module à Mozilla Add-ons (AMO) pour signature et distribution, puis tester le paquet signé.

## Tests locaux
Nécessite Node.js 20+ :
```sh
node --check parser.js
node --check content.js
node --check popup.js
node --test tests/parser.test.js
```
GitHub Actions exécute les tests et construit les paquets distincts Chrome et Firefox à chaque push sur `main) ou la branche de développement, ainsi qu'à chaque pull request vers `main`.

## Limites
- La détection dépend du HTML servi par Vinted et doit être vérifiée sur de vraies pages.
- Seules les annonces rendues dans la page sont analysées ; faire défiler peut charger plus de résultats.
- L'historique n'est actualisé qu'au lancement manuel d'une analyse.
- Les conditions d'utilisation de Vinted peuvent limiter certains usages : vérifiez-les avant usage.

## Confidentialité
Voir [PRIVACY.md](PRIVACY.md). Les annonces suivies et l'historique restent dans le stockage local du navigateur et ne sont pas envoyés à un serveur par l'extension.

Extension indépendante, non affiliée à Vinted.
