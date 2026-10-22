# Vinted Companion — prototype Chrome

Extension Manifest V3 en français, stockage local uniquement.

## Fonctionnalités
- Analyse des annonces présentes dans le DOM de la page Vinted ouverte : nombre, prix moyen et minimum.
- Filtre local par titre, prix ou URL.
- Liste de suivi locale avec raccourcis vers les annonces.
- Historique de prix des articles suivis, enregistré lors des analyses manuelles quand l'annonce réapparaît dans les résultats.
- Signalement d'une baisse entre deux observations, sans alerte en arrière-plan.
- Export CSV des résultats ou de la liste suivie (historique inclus).
- Calculateur de marge de revente.
- Aucun compte externe, mot de passe, serveur, achat ou message automatique.

## Installation
1. Télécharge la branche `feat/vinted-companion-extension`.
2. Ouvre `chrome://extensions`.
3. Active le mode développeur, puis clique sur **Charger l’extension non empaquetée**.
4. Sélectionne le dossier contenant `manifest.json`.
5. Ouvre une recherche Vinted, recharge la page puis utilise l'extension.

## Limites
Prototype bêta : les sélecteurs de la page peuvent changer. L'extension lit seulement les annonces déjà visibles et n'effectue pas de collecte périodique. L'historique se met à jour uniquement lors d'une analyse manuelle et quand une annonce suivie est présente dans les résultats analysés. Le filtre recherche uniquement dans les annonces déjà détectées. Les données restent sur cet appareil.

## Prochaines évolutions
Tests automatisés des parseurs, meilleure détection des cartes d'annonces selon les mises à jour du site, notes personnelles, filtres sauvegardés, alertes locales déclenchées par les visites et analyses autorisées.

## Conditions d'utilisation
Les conditions de Vinted restreignent les outils logiciels externes et le scraping sans autorisation. Cette version évite les actions automatiques et les requêtes périodiques, mais il faut vérifier que l'utilisation prévue est autorisée. Extension indépendante, non affiliée à Vinted.
