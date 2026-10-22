# Vinted Companion — audit produit et benchmark concurrentiel

Dernière vérification documentaire : 22 octobre 2026. Ce document compare les fonctions annoncées publiquement, pas des tests indépendants des produits. Les prix et plans changent fréquemment; vérifier les pages officielles avant toute décision.

## État du dépôt avant la branche 1.2.0

Le produit initial était une popup Manifest V3 avec analyse manuelle des annonces rendues dans la page, nombre/prix moyen/minimum, filtre, watchlist locale et historique des prix observés lors d'analyses manuelles, export CSV et calculateur de marge. Il n'y avait pas de gestion d'inventaire, de workflow article, de sauvegarde/import des données ni d'interface de tableau de bord. Les tests couvraient surtout le parsing de prix/URL et la compatibilité d'API navigateur. Les sélecteurs du DOM Vinted restent fragiles et aucune donnée de ventes clôturées n'est disponible automatiquement.

## Benchmark fonctionnel

Les comparatifs ci-dessous sont édités par des acteurs du secteur, parfois directement par un concurrent : leurs descriptions sont utiles pour découvrir les catégories de fonctions, mais ne constituent pas une évaluation neutre.

| Produit | Orientation annoncée | Fonctions à retenir comme exigences de benchmark |
|---|---|---|
| [Bleam](https://bleam.app/en/blog/business/comparatif-extensions-vinted-2026) | Extension, cloud et mobile | Suivi d'activité, gestion des ventes, assistant, workflow d'expédition |
| [DotB](https://dotb.io/) | Automatisation et assistant de vente | Aide à la rédaction, modifications en masse, exports et règles |
| [Clemz](https://clemz.app/) | Extension d'actions sur dressing | Gestion groupée et outils de visibilité |
| [VintedCRM](https://vintedcrm.com/) | CRM et comptabilité | Stock, références/SKU, ventes, factures, exports comptables |
| [Revendor](https://revendor.app/compare/best-vinted-seller-tools) | Tableau de bord + extension | Coût d'achat, marge réelle, suivi du stock et assistant |
| [ResellTrack](https://reselltrack.io/fr/comparatif) | Analyse de marché/niches | Comparaison de prix et aide au sourcing |
| [Jarvis](https://www.jarvisforvinted.com/blog/comparatif-outils-automatisation-vinted) | Création et gestion d'annonces | Brouillons IA, édition en masse et statistiques |
| [DressKare](https://dresskare.com/) | Dépôt-vente | Gestion des articles confiés, commissions et inventaire |

Sources comparatives complémentaires :
- https://revendor.app/fr/compare/best-vinted-seller-tools
- https://www.vinteer.io/blog/meilleur-outil-vinted
- https://reselltrack.io/en/blog/vinted-extension

## Écart fonctionnel et stratégie

| Domaine | État initial | V1.2.0 dans cette branche | Étape suivante |
|---|---|---|---|
| Analyse des annonces visibles | Basique, manuelle | Conservée | Robustesse DOM, qualité de parsing, tests de fixtures |
| Historique et alertes | Historique local lors d'une analyse | Conservé | Seuils d'alerte configurables, toujours sur observations explicites |
| Stock et références | Absent | Inventaire local avec SKU, état, taille et statut | Filtres avancés, édition groupée, catégories et photos optionnelles |
| Coûts et rentabilité | Calculateur isolé | Coût d'achat, frais, prix cible, bénéfice estimé par article et total stock | Coûts réels par vente, frais variables et rapports par période |
| Préparation d'annonce | Absent | Brouillon de titre/description à partir des données saisies | Modèles personnalisables et contrôle qualité du texte |
| Sauvegarde | CSV pour annonces/suivi | Import/export JSON explicite pour l'inventaire | Migration de schéma et déduplication plus poussée |
| Comptabilité | Absent | Pas encore de ventes/factures fiscales | Journal des ventes, exports comptables, validation des exigences françaises |
| Actions Vinted | Manuelles | Aucune publication/message automatique | Garder une confirmation explicite avant toute action |
| Distribution | Chrome/Firefox, paquet CI | Les fichiers dashboard sont intégrés au paquet CI | Tests manuels sur Chrome et Firefox, puis signature AMO |

## Principes produit

1. Prioriser les outils de décision et de gestion plutôt que les bots d'achat ou de messagerie.
2. Distinguer clairement les prix observés, les estimations et les prix réellement vendus : une annonce affichée n'est pas une vente conclue.
3. Ne pas promettre une « vitesse de vente » ou des données de ventes si nous ne possédons pas de données fiables.
4. Ne pas contourner les protections, les limites ou les conditions d'utilisation de Vinted.
5. Stocker les données localement par défaut; demander confirmation avant import, suppression ou action externe.
6. Ne pas copier le code, la marque ou l'interface d'un concurrent : comparer les besoins fonctionnels et concevoir notre propre expérience.

## Prochaines étapes priorisées

- **P0 — fiabilité :** passer les tests CI, tester les imports invalides, protéger l'export et valider les sélecteurs sur des fixtures HTML anonymisées.
- **P1 — gestion :** dates d'achat/vente, frais réels, coût net, filtres et rapports mensuels.
- **P2 — recherche :** comparaisons de prix sur les seules annonces visibles, critères de suivi configurables et alertes lors d'une analyse manuelle.
- **P3 — rédaction :** modèles personnalisés, génération assistée et vérification avant copie.
- **P4 — distribution :** tests manuels sur deux navigateurs, revue des permissions et procédure de signature Firefox.

