# Brief du projet : éditeur de documents partagé (journal numérique)

Ce fichier est la référence unique du projet. À lire en entier avant toute action. Il décrit le sujet, les besoins, les décisions déjà prises, l'architecture et le plan de réalisation.

---

## 0. Règles de conduite pour l'assistant

Je suis étudiante en dernière année de génie informatique. Je ne suis pas experte du code. Mon objectif est de **comprendre chaque choix** pour pouvoir le défendre à l'oral : le projet est individuel et le jury interroge sur chaque morceau.

1. **Travaille pas à pas.** Une seule étape à la fois (voir section 17). Ne passe à l'étape suivante que lorsque j'écris « suivant ».
2. **Format de chaque réponse :**
   1. Objectif de l'étape en deux phrases.
   2. Pourquoi on le fait, et ce qui arrive si on l'ignore.
   3. Liste des fichiers créés ou modifiés.
   4. Le code, en petits blocs commentés (commentaires sobres, en français).
   5. Comment le tester, avec la commande exacte et le résultat attendu.
   6. « À retenir » : les notions à comprendre, puis trois questions pour vérifier ma compréhension.
   7. Un message de commit proposé (Conventional Commits).
3. **Ne génère jamais tout le projet d'un coup.** Pas de code mort, pas de fonctionnalité non demandée, pas de dépendance hors de la section 14 sans me demander et sans justifier.
4. **Explique les notions nouvelles au moment où elles apparaissent** (écriture conditionnelle atomique, CRDT, URL présignée, idempotence, moindre privilège, TTL, concurrence Lambda). Utilise des exemples simples.
5. **Sois honnête.** Si ma demande contredit le sujet ou une contrainte, dis-le avant d'agir. Si tu n'es pas sûr d'un détail AWS ou d'une API de bibliothèque (quotas, limites, noms de paramètres, versions), **dis-le et consulte la documentation officielle** au lieu d'inventer.
6. **Sécurité non négociable.** Aucune clé d'accès AWS dans le code, le dépôt, un fichier de configuration versionné ou un message. Ne me demande jamais mes clés et ne lis pas mes fichiers d'identifiants. Si je colle un secret par erreur, préviens-moi immédiatement. Vérifie le `.gitignore` avant chaque premier commit d'un nouveau type de fichier.
7. **Priorité aux deux contraintes éliminatoires (C1 et C2).** Elles se construisent et se prouvent en premier.
8. **Langue.** Réponds en français. Identifiants de code en anglais. Commentaires et documentation en français.
9. **Style de code.** JavaScript (Node.js, modules ES), pas de TypeScript. Simple, lisible, fonctions courtes. Tests avec Vitest.
10. **Les preuves comptent plus que les fonctionnalités.** Chaque contrainte a un test automatisé dont les résultats bruts sont conservés.

---

## 1. Contexte et objectif

Projet d'évaluation individuel « Développement web et cloud », à réaliser en **un week-end** (du vendredi soir au lundi matin) sur **mon propre compte AWS en plan gratuit, dans une seule région**. Je dois concevoir, construire, déployer, puis **prouver par des tests** que l'application tient les contraintes. Le choix de l'architecture, des services et des technologies est libre : c'est l'essentiel de ce qui est évalué. Le sujet précise : « Une application simple, mais dont chaque choix est compris et justifié, vaut mieux qu'une application complexe que vous ne savez pas expliquer. »

**L'application.** Une association étudiante publie chaque année un journal numérique, écrit en commun par plusieurs centaines de rédacteurs qui travaillent sur les mêmes textes, parfois au même endroit. À la parution, un lien de téléchargement est annoncé à une date et une heure précises, limité à 500 exemplaires (dans le scénario du sujet). L'équipe continue de corriger après l'annonce : une partie corrigée après la parution doit se retrouver dans les exemplaires téléchargés ensuite, **sans changer de lien**.

---

## 2. Contraintes du sujet

Les contraintes C1 et C2 sont les plus importantes : une application rapide qui ne les respecte pas est considérée comme non fonctionnelle.

| Réf. | Contrainte |
|---|---|
| **C1** | Un lien permet **exactement** le nombre de téléchargements autorisé à sa création : jamais un de plus, quel que soit le nombre de visiteurs qui cliquent au même instant. |
| **C2** | Quel que soit le nombre de personnes qui écrivent en même temps, y compris au même endroit du texte, **aucune modification acceptée n'est perdue**, et tous les participants finissent par voir le même document. |
| C3 | Un lien créé à l'instant T et utilisé à l'instant T1, après une modification du document, donne le document **tel qu'il est à T1**, complet et cohérent, sans créer de nouveau lien. |
| C4 | Un rédacteur n'écrit jamais plus que son **crédit du jour** (10 000 caractères, rechargé chaque jour), même depuis plusieurs appareils à la fois. |
| C5 | Pic : 15 000 personnes cliquent sur le lien, dont 80 % dans la première minute, pendant que 300 rédacteurs continuent d'écrire. L'application ne doit ni casser ni jeter : **chaque visiteur obtient une réponse** et sait s'il télécharge maintenant, s'il doit patienter ou si le lien est épuisé. |
| C6 | Une fois le dernier exemplaire distribué, les visiteurs encore présents l'apprennent rapidement, sans que l'application continue de délivrer un service qu'elle n'a plus. |

**Règles du sujet.** Compte AWS personnel en plan gratuit, une seule région. Aucune clé d'accès AWS dans le code ou le dépôt ; chaque composant n'a que les droits dont il a besoin. Bonnes pratiques vues en cours (voir section 15). Les fichiers à télécharger sont conservés dans S3. Travail strictement individuel. Délai : un week-end.

**Règles du sujet sur les utilisateurs.** Pas de vrais comptes : un nom et une adresse e-mail saisis à l'entrée identifient un rédacteur. Les visiteurs qui téléchargent n'ont aucune identité à donner. L'association doit pouvoir consulter à tout moment l'état de l'application : documents ouverts, liens actifs avec leurs téléchargements restants, personnes bloquées. Quand un lien arrive à son dernier téléchargement, son créateur est prévenu par e-mail. Une personne qui s'acharne contre les limites est repérée et bloquée pour un temps.

**Livrables.**
1. Dépôt Git : code, description de l'infrastructure, tests, README (déployer, tester, supprimer).
2. Dossier de conception.
3. Rapport de test : méthode, objectifs, résultats bruts, analyse, preuve que C1 et C2 sont respectées.
4. Description de l'API, assez précise pour que le jury écrive son propre test.
5. Preuve du coût du projet.

---

## 3. Acteurs

| Acteur | Description |
|---|---|
| **Rédacteur** | Identifié par nom + e-mail saisis (sans vérification). Par document, il est **propriétaire** (affiché « Proprio ») ou **collaborateur** (« Collab »). |
| **Visiteur** | Télécharge via un lien, sans identité. |
| **Association (administrateur)** | Consulte l'état de l'application, en lecture seule, par un code secret. Une même personne peut aussi être rédacteur par l'entrée normale. |
| Service d'e-mail (SES) | Acteur secondaire : envoie invitations et alertes. |
| Stockage (S3) | Acteur secondaire : conserve les PDF. |
| Temps | Déclencheur : recharge quotidienne du crédit, expiration d'un blocage. Aucune tâche planifiée n'est nécessaire (clé « e-mail + jour », comparaison d'horodatages). |

---

## 4. Besoins fonctionnels

| Réf. | Acteur | Besoin |
|---|---|---|
| BF1 | Rédacteur | S'identifier avec nom et adresse e-mail. |
| BF2 | Rédacteur | Créer un document vide ou à partir de l'un des **3 modèles** (Article d'actualité, Compte rendu d'événement, Interview). Le texte du modèle **ne consomme pas** le crédit. |
| BF3 | Propriétaire | Inviter **une ou plusieurs** personnes par e-mail, dans la limite d'un quota fixé (paramètre). |
| BF4 | Rédacteur | Écrire à plusieurs en même temps dans un même document. |
| BF5 | Rédacteur | Voir les modifications des autres en moins de 2 secondes environ. |
| BF6 | Rédacteur | Voir qui est présent et où il écrit (ligne), avec le badge « Proprio » ou « Collab ». |
| BF7 | Rédacteur | Consulter les versions précédentes (date, auteur). |
| BF8 | Rédacteur | Restaurer une version : cela crée une **nouvelle version** sans effacer l'historique, et ne consomme pas le crédit. |
| BF9 | Rédacteur avec accès | **Publier** : crée un lien stable avec le nombre d'exemplaires choisi (500 par défaut, modifiable, plafond configurable). Un document peut avoir plusieurs liens, chacun avec son compteur. |
| BF10 | Rédacteur | Voir son crédit restant, mis à jour en temps réel. |
| BF11 | Visiteur | Télécharger le document en PDF via le lien. |
| BF12 | Visiteur | Savoir clairement s'il télécharge maintenant, s'il doit patienter, ou si le lien est épuisé. |
| BF13 | Système | Délivrer le document tel qu'il est au moment du clic (jamais une copie figée à la création du lien). |
| BF14 | Système | Crédit de 10 000 caractères **par rédacteur et par jour (UTC)**, tous documents confondus, rechargé chaque jour ; seuls les caractères **insérés** comptent. |
| BF15 | Système | Refuser **en entier** toute modification qui dépasse le crédit restant. |
| BF16 | Système | Bloquer 12 h après **3 refus consécutifs pour crédit insuffisant** (sans modification acceptée entre eux). Seuil et durée sont des paramètres. Pendant le blocage, toute action qui **modifie ou publie** est refusée (écrire, créer un document, inviter, publier, restaurer) ; la **consultation en lecture seule** reste possible. Les tentatives faites pendant le blocage ne comptent pas comme refus et ne le prolongent pas. Le compteur de refus est remis à 0 à la création du blocage. La fin du blocage **ne recharge pas le crédit** : la recharge reste quotidienne et indépendante. |
| BF17 | Système | Prévenir par e-mail le créateur du lien au dernier exemplaire. |
| BF18 | Association | Consulter documents ouverts, liens actifs avec restants, personnes bloquées (code secret). |
| BF19 | Système | Envoyer un e-mail d'invitation aux personnes invitées. |
| BF20 | Système | Conserver pour chaque document son créateur et la liste de ses contributeurs (personnes dont au moins une modification a été acceptée). |
| BF21 | Visiteur | Page publique d'un lien : titre, créateur, contributeurs (**noms seulement**), dernière modification, téléchargements effectués, état, bouton de téléchargement, bannière si le document a changé depuis l'ouverture de la page. |
| BF22 | Visiteur | Page d'accueil publique listant les parutions. |
| BF23 | Rédacteur | Aperçu en lecture seule du document entier (optionnel). |
| BF24 | Rédacteur | « Mes documents » : l'invité y voit les documents où il a un rôle, et n'accède qu'au document partagé. |

---

## 5. Besoins non fonctionnels

| Réf. | Catégorie | Besoin | Critère mesurable |
|---|---|---|---|
| BNF1 | Exactitude (C1) | Jamais un téléchargement de trop. | Lien à 500, 2 000 requêtes simultanées : exactement 500 succès, avec les numéros d'exemplaire 1 à 500 chacun une seule fois. |
| BNF2 | Intégrité (C2) | Aucune modification acceptée perdue ; convergence. | N clients écrivent au même endroit : documents finaux identiques, nombre de caractères égal à la somme attendue. |
| BNF3 | Cohérence (C3) | Le lien donne l'état courant. | Modifier après la création du lien, puis télécharger : le PDF contient la modification. |
| BNF4 | Exactitude (C4) | Crédit jamais dépassé, multi-appareils. | Deux sessions écrivent ensemble : total accepté inférieur ou égal à 10 000. |
| BNF5 | Performance (C5) | Supporter le pic sans casser. | 15 000 requêtes, 80 % en 60 s, avec 300 rédacteurs actifs : zéro erreur 5xx, 100 % des réponses parmi {téléchargement, patienter, épuisé}. |
| BNF6 | Réactivité (C6) | Épuisement connu vite. | Après le dernier exemplaire, toute requête reçoit « épuisé » ; aucune adresse de téléchargement n'est émise. |
| BNF7 | Sécurité | Aucune clé AWS dans le dépôt. | Analyse du dépôt négative. |
| BNF8 | Sécurité | Moindre privilège par fonction. | Un rôle IAM par fonction, sans droits inutiles. |
| BNF9 | Coût | Rester dans le plan gratuit, avec preuve. | Alerte AWS Budgets configurée ; captures de Cost Explorer. |
| BNF10 | Déploiement | Infrastructure décrite en code, une seule région, déploiement et suppression reproductibles. | README exécuté depuis un dossier vide. |
| BNF11 | Stockage | PDF conservés dans S3. | Objets présents dans le bucket. |
| BNF12 | Qualité | Bonnes pratiques du cours (section 15). | Justification dans le dossier. |
| BNF13 | Temps réel | Propagation des modifications. | Moins de 2 s en moyenne dans les tests. |
| BNF14 | Sécurité | Identifiants de liens non devinables ; adresse de téléchargement temporaire (environ 60 s). | Identifiants aléatoires de 128 bits ; expiration vérifiée. |
| BNF15 | Observabilité | Journaliser refus, blocages, erreurs. | Journaux structurés (JSON) dans CloudWatch. |
| BNF16 | Fiabilité | Rejouer une opération ne double ni le crédit ni l'écriture. | Test de rejeu avec le même identifiant d'opération. |
| BNF17 | Maintenabilité | Code en couches, tests unitaires, README testable. | Un tiers déploie en suivant le README. |
| BNF18 | Faisabilité | Réalisable seule en un week-end. | Plan de la section 17 tenu. |

---

## 6. Décisions de conception figées

À ne pas remettre en cause sans me prévenir.

1. **Inviter : propriétaire seul.** Un collaborateur ne peut pas inviter.
2. **Publier (créer un lien) : tout rédacteur ayant accès au document.**
3. **Restaurer une version : tout rédacteur ayant accès** ; cela crée une nouvelle version.
4. **Le crédit compte les caractères insérés** ; supprimer ne consomme rien. Les modèles et la restauration ne consomment rien.
5. **Une modification qui dépasse le crédit restant est rejetée en entier.**
6. **Le compteur d'un lien est décrémenté au moment où l'adresse de téléchargement est délivrée**, pas à la fin réelle du téléchargement. C'est la seule façon de garantir « jamais un de plus ». Conséquence assumée : un visiteur qui n'ouvre pas l'adresse perd son exemplaire.
7. **« Patienter »** signifie : le système n'a pas pu traiter la demande à cet instant (PDF en préparation, forte charge, limitation), le lien n'est pas épuisé, **aucun exemplaire n'est consommé**.
8. **Administrateur : code secret** stocké dans AWS Systems Manager Parameter Store (SecureString), jamais dans le dépôt. Il est créé par moi au déploiement et remis à l'association par un canal sûr. L'espace association est en **lecture seule**.
9. **Un lien épuisé reste visible** avec 0 restant : l'association le voit et les visiteurs reçoivent « épuisé ».
10. **Le lien suit le document (mode A)** : il donne toujours l'état courant. Aucune étape de republication. Le **mode contrôlé** (lien figé sur une version publiée) est une amélioration optionnelle, à ne faire qu'après les tests. La limite (une erreur reste visible tant qu'elle n'est pas corrigée) est documentée ; l'atténuation est l'historique et la restauration.
11. **Crédit par rédacteur et par jour (UTC)**, pas par document.
12. **Publier met immédiatement la parution en ligne** sur la page d'accueil. Le rédacteur clique à l'heure de l'annonce.
13. **Pas de lecture intégrale en ligne pour les visiteurs.** La page publique n'affiche que des informations. L'aperçu complet est réservé aux rédacteurs ayant accès.
14. **Identification déclarative** (nom et e-mail sans vérification), comme l'autorise le sujet. Limite assumée : quelqu'un qui connaît l'adresse d'un rédacteur peut se faire passer pour lui. Pas de jeton d'invitation (il ne protégerait pas réellement).
15. **« Seulement des articles de l'école »** est une règle éditoriale non contrôlable par le système (affichée en en-tête, modèles adaptés, limite documentée).
16. **Le texte de la page publique n'affiche jamais d'adresse e-mail** : seulement des noms.
17. **Portée du blocage.** Bloqué = toutes les actions qui modifient ou publient sont interdites (écrire, créer un document, inviter, publier, restaurer). Restent possibles : consulter « Mes documents » et ouvrir les documents en lecture seule, voir les versions et l'aperçu, voir son crédit et la fin du blocage. **Les téléchargements de visiteurs ne sont jamais bloqués** : un visiteur n'a pas d'identité, donc on ne peut pas reconnaître une personne bloquée, et ajouter ce contrôle alourdirait le chemin critique du pic.
18. **Recharge du crédit et blocage sont indépendants.** Le crédit est rechargé à 00:00 UTC (nouvelle journée = nouvelle ligne), que la personne soit bloquée ou non. À la fin d'un blocage, si la journée n'est pas terminée, la personne retrouve le crédit qui lui reste (éventuellement 0) jusqu'à la prochaine recharge. Un nouveau blocage exige trois nouveaux refus consécutifs.

---

## 7. Workflow de bout en bout

1. Les rédacteurs écrivent ensemble dans l'éditeur (modifications ajoutées, jamais écrasées).
2. Un rédacteur ayant accès clique sur **Publier**, choisit le nombre d'exemplaires (500 par défaut). Le système crée un **lien stable**, qui apparaît sur la page d'accueil.
3. La parution est annoncée. L'équipe continue de corriger dans l'éditeur, sans republier.
4. Un visiteur ouvre la page du journal : informations et état.
5. Il clique sur **Télécharger** : le système vérifie que le lien n'est pas épuisé, s'assure que le PDF correspond à la version courante (génération si nécessaire, une seule fois par version), décrémente le compteur de façon atomique, puis délivre une adresse temporaire vers S3. Le navigateur télécharge directement depuis S3.
6. Si le système ne peut pas servir à cet instant : « patienter » avec un délai conseillé, sans rien consommer.
7. Au dernier exemplaire : e-mail au créateur du lien ; la page indique « épuisé » ; chaque clic suivant affiche un message clair.
8. L'association consulte l'état à tout moment.

---

## 8. Pages

Pages statiques (HTML + JavaScript sans framework) servies par S3 + CloudFront ; elles appellent l'API.

| Réf. | Fichier | Accès | Contenu |
|---|---|---|---|
| P0 | `index.html` | Public | **Accueil** : liste des parutions (titre, auteurs, téléchargements effectués sur total, état), boutons « Espace rédacteur » et « Espace association », en-tête « Journal de l'école ». Cache de quelques secondes. |
| P1 | `entree.html` | Rédacteur | Saisie nom + e-mail. |
| P2 | `documents.html` | Rédacteur identifié | Mes documents (titre, rôle, dernière modification), crédit du jour, bouton « Nouveau document » avec choix : vide ou 3 modèles. |
| P3 | `editeur.html` | Accès au document | Titre, crédit restant en temps réel, boutons Aperçu / Versions / Publier (et Inviter pour le propriétaire), barre des présents avec badges et ligne, zone de texte, bandeau d'état (crédit épuisé, bloqué jusqu'à…). Volets : Inviter (plusieurs e-mails), Versions (restaurer), Publier (nombre d'exemplaires, lien généré à copier). |
| P4 | `journal.html?id=<linkId>` | Public | Titre, créateur, contributeurs (noms), dernière modification, téléchargements effectués / total, état (disponible, à patienter, épuisé), bouton de téléchargement, bannière « une version plus récente existe ». La page rafraîchit l'état toutes les quelques secondes ; la réponse du serveur au clic fait foi. |
| P5 | `admin.html` | Code secret | Trois onglets : documents ouverts (présents, dernière modification), liens actifs (restants, créateur), personnes bloquées (fin du blocage). |

---

## 9. Architecture

### 9.1 Choix retenu : serverless sur AWS

Région unique (ex. eu-west-3, comme dans le cours ; vérifier que SES y est disponible).

```
Navigateur --HTTPS--> CloudFront (un seul domaine)
   |-- /*     --> S3 « site » (pages statiques, privé, accès par CloudFront)
   |-- /api/* --> API Gateway HTTP --> Lambdas REST
                                         |--> DynamoDB
                                         |--> S3 « pdf » (privé)
                                         |--> SQS « courriels » --> Lambda MailConsumer --> SES
Navigateur --WSS--> API Gateway WebSocket --> Lambdas temps réel --> DynamoDB
                                                                  --> envoi aux autres connexions
```

Points de conception clés :
1. Pages statiques et réponses d'état servies par CloudFront (cache de 1 à 2 secondes pour la page d'un journal, 5 secondes pour l'accueil, via l'en-tête `Cache-Control` renvoyé par la fonction). Les routes privées renvoient `Cache-Control: no-store`.
2. Le téléchargement du fichier passe par **S3 (adresse présignée)**, pas par Lambda. L'adresse est calculée localement : elle ne peut pas échouer après la décrémentation.
3. Les e-mails passent par **SQS** : ils ne ralentissent pas le chemin critique, et le débit vers SES (limité en mode sandbox) est maîtrisé.
4. Infrastructure décrite avec **AWS SAM** (`template.yaml`). Empaquetage par esbuild.
5. Tables DynamoDB en facturation à la demande.

### 9.2 Justification pour le dossier (piliers du Well-Architected)

Sécurité (un rôle par fonction, pas de serveur à corriger), fiabilité (services managés multi-zones), performance (mise à l'échelle automatique), coûts (paiement à l'usage, proche de zéro hors usage), excellence opérationnelle (infrastructure en code, journaux CloudWatch), durabilité (pas de ressource inactive).

### 9.3 Alternatives écartées (à documenter)

1. **EC2, une instance** (la plus proche du cours) : le volume du pic est modeste (environ 200 requêtes par seconde) donc un serveur suffirait en volume, mais c'est un **point de défaillance unique** : une panne ou un redémarrage pendant l'annonce ou le test du jury fait échouer toutes les contraintes à la fois ; processeur burstable à crédits ; état en mémoire perdu au redémarrage ; mise à l'échelle manuelle ; chaque déploiement coupe les connexions.
2. **EC2, deux instances + load balancer** : meilleure disponibilité, mais l'édition collaborative exige alors une synchronisation entre instances (diffusion des modifications d'une instance à l'autre), difficile à garantir pour C2.
3. **Hybride** (serverless pour le pic, EC2 pour l'édition) : possible, mais deux piles à déployer, un certificat TLS à gérer pour la connexion WebSocket de l'instance, et un dossier plus lourd à justifier.
4. **Un serveur Yjs prêt à l'emploi** : il applique les modifications à son document avant qu'on puisse les refuser ; or il faut refuser une modification qui dépasse le crédit, numéroter, persister et diffuser selon nos règles. Du code personnalisé est donc nécessaire dans tous les cas.

### 9.4 Plan B pour l'édition collaborative

Si le relais WebSocket n'est pas fonctionnel à une échéance fixée (samedi midi), remplacer **uniquement** le transport par une synchronisation par requêtes REST toutes les 1 à 2 secondes (envoi des modifications, récupération des modifications depuis le dernier numéro `seq`). Le moteur Yjs, les tables et les règles métier restent identiques. Limite : consomme de la concurrence Lambda ; à documenter.

### 9.5 Risques à lever dès le premier soir

1. **Quota de concurrence Lambda.** La documentation AWS indique que les nouveaux comptes ont des quotas de concurrence réduits (des utilisateurs signalent une limite de 10), relevés automatiquement selon l'usage ou sur demande. Vérifier la valeur réelle dans Service Quotas et demander une augmentation immédiatement si elle est basse.
2. **SES en mode sandbox** : n'envoie qu'à des adresses vérifiées. Vérifier l'expéditeur et quelques adresses de test.
3. **PDF avec accents** : produire un PDF en français avec une police intégrée.
4. **Relais temps réel minimal** : deux navigateurs échangent une mise à jour Yjs via API Gateway WebSocket et une Lambda.
5. **Limites WebSocket d'API Gateway** (durée de connexion, délai d'inactivité, taille des messages) : à vérifier dans la documentation ; le client envoie un signal périodique et se reconnecte automatiquement.

---

## 10. Données (DynamoDB)

| Table | Clé | Attributs et rôle |
|---|---|---|
| **Documents** | `docId` | `title`, `ownerEmail`, `ownerName`, `seq` (numéro de la dernière modification acceptée), `contributors` (table adresse vers nom, **initialisée à vide à la création**), `pdfSeq` (version du dernier PDF généré), `createdAt`, `updatedAt`. |
| **Memberships** | `email` + `docId` | `role` (`proprio` ou `collab`). Sert à « Mes documents » et au contrôle d'accès. Index par `docId` pour lister les membres. |
| **DocUpdates** | `docId` + `seq` | Mise à jour Yjs (binaire), `authorEmail`, `chars` (caractères insérés), `createdAt`. **Ajout seulement.** |
| **Versions** | `docId` + `versionNo` | `upToSeq`, date, auteur, **état complet** du texte (Yjs) à cet instant. Points de sauvegarde créés automatiquement (au plus toutes les 5 minutes d'activité, avant une restauration, à la publication). |
| **Links** | `linkId` | `docId`, `creatorEmail`, `creatorName`, `total`, `remaining`, `createdAt`. `linkId` = 128 bits aléatoires encodés (non devinable). |
| **Credits** | `email` + `day` (UTC) | `used`, `refusals` (refus consécutifs du jour). Nouvelle journée = nouvelle ligne : recharge automatique. |
| **Blocks** | `email` | `blockedUntil`. |
| **Connections** | `connectionId` | `docId`, `email`, `name`, couleur, `ttl`. Index par `docId` (diffusion, présence) et par `email` (crédit sur plusieurs appareils). |
| **Locks** | `lockKey` | Verrou de génération de PDF et marqueurs d'idempotence, avec `ttl`. |

Points d'attention :
1. **Le TTL de DynamoDB nettoie mais n'est pas instantané** : une ligne expirée peut rester présente. Toujours comparer `blockedUntil` et les dates à l'heure courante ; ne jamais déduire l'état de la présence ou de l'absence de la ligne.
2. **Limite d'environ 400 Ko par ligne** : un état de version très long ne tiendrait pas. Limite connue à documenter (textes de quelques dizaines de milliers de caractères).
3. **Ligne chaude.** Toutes les décrémentations d'un lien visent une seule ligne ; DynamoDB limite les écritures par ligne (de l'ordre de 1 000 par seconde, à vérifier dans la documentation, et les écritures conditionnelles refusées consomment aussi de la capacité). Le **chemin rapide** (lire d'abord ; si `remaining` vaut 0, répondre « épuisé » sans écrire) évite de saturer la ligne après l'épuisement. Toute limitation DynamoDB doit être traduite en **« patienter » (429)**, jamais en erreur 5xx. À vérifier par le test BNF1.

Paramètres de configuration (variables d'environnement, jamais de valeur en dur) : `MAX_CREDIT=10000`, `REFUSAL_THRESHOLD=3`, `BLOCK_SECONDS=43200`, `DEFAULT_COPIES=500`, `MAX_COPIES`, `MAX_INVITES_PER_REQUEST`, `MAX_INVITES_PER_DAY`, `PRESIGN_SECONDS=60`, `CHECKPOINT_SECONDS=300`, `PDF_LOCK_SECONDS=30`. Pour les tests, on règle le seuil de blocage et sa durée à des valeurs courtes (par exemple 3 refus et 30 secondes).

---

## 11. Organisation du code

```
/
  README.md
  template.yaml            (SAM : ressources, rôles, API)
  package.json
  .gitignore               (node_modules, .aws-sam, .env, *.pem, credentials…)
  docs/                    (BRIEF_CURSOR.md, conception.md, api.md, rapport-test.md, cout.md)
  src/
    handlers/              (points d'entrée Lambda, minces : http/*, ws/*, mail-consumer)
    services/              (logique métier)
    repositories/          (accès DynamoDB, un par table)
    adapters/              (S3, SES, SQS, SSM, envoi WebSocket)
    domain/                (yjs-text, pdf-builder, validation, templates)
    config.js
  web/                     (pages statiques P0 à P5, js/, css/)
  tests/                   (unit/, integration/, load/ pour k6, results/ pour les résultats bruts)
```

**Couches.** Handlers (minces) vers Services (règles du sujet) vers Repositories et Adaptateurs vers Domaine (fonctions pures). Chaque couche ne parle qu'à celle d'en dessous. Les règles métier sont testables sans AWS.

| Classe | Responsabilité | Méthodes principales | Appelle |
|---|---|---|---|
| `IdentityService` | Valider nom et e-mail, normaliser l'adresse en minuscules, vérifier le code administrateur (comparaison à temps constant). | `identify`, `isAdmin` | `SecretProvider` |
| `DocumentService` | Créer (vide ou modèle), lister, contrôler l'accès, inviter. | `create`, `listFor`, `assertAccess`, `invite` | `DocumentRepository`, `MembershipRepository`, `NotificationService` |
| `CollaborationService` | Traiter les messages temps réel. | `join`, `onUpdate`, `onAwareness`, `leave` | `BlockService`, `CreditService`, `UpdateRepository`, `ConnectionRepository`, `Broadcaster` |
| `CreditService` | Débiter sans jamais dépasser le crédit. | `consume`, `refund`, `remaining` | `CreditRepository`, `BlockService` |
| `BlockService` | Compter les refus et bloquer. | `isBlocked`, `registerRefusal`, `listBlocked` | `CreditRepository`, `BlockRepository` |
| `VersionService` | Points de sauvegarde, liste, restauration. | `maybeCheckpoint`, `list`, `restore`, `stateAt` | `VersionRepository`, `UpdateRepository` |
| `LinkService` | Publier, informer, délivrer un téléchargement. | `publish`, `publicInfo`, `requestDownload` | `LinkRepository`, `PdfService`, `NotificationService` |
| `PdfService` | Garantir un PDF à jour, le générer, signer l'adresse. | `ensure`, `presign` | `LockRepository`, `S3Storage`, `VersionService` |
| `NotificationService` | Mettre les e-mails en file. | `enqueueInvitation`, `enqueueLastCopy` | `QueueAdapter` |
| `AdminService` | État de l'application. | `overview` | repositories |

Modules purs du domaine : `YjsText` (appliquer une mise à jour, **compter les caractères insérés d'une mise à jour**, extraire le texte à un état donné) et `PdfBuilder` (texte vers PDF, avec retour à la ligne et pagination).

---

## 12. Interactions critiques

### 12.1 Écrire (C2 et C4)

1. Le navigateur applique la frappe localement (Yjs), vérifie le crédit connu, puis envoie `{action:"update", docId, update, opId}`.
2. `CollaborationService.onUpdate` retrouve la connexion (document, adresse).
3. Contrôle d'accès et `BlockService.isBlocked`. Si bloqué : réponse « refus : bloqué jusqu'à… ». Ces tentatives ne comptent pas comme refus et ne prolongent pas le blocage.
4. **Idempotence** : réserver `opId` (écriture conditionnelle dans `Locks`). S'il existe déjà, renvoyer l'accusé précédent sans rien refaire.
5. `YjsText` décode la mise à jour et compte les caractères **insérés** (n). Le serveur ne croit jamais un nombre envoyé par le client. Yjs expose une fonction de décodage des mises à jour (`decodeUpdate`) ; à vérifier dans la version installée. À défaut, appliquer la mise à jour à une copie de l'état courant et mesurer. Dans tous les cas, test unitaire dédié.
6. `CreditService.consume(email, n)` : **une seule** mise à jour conditionnelle sur la ligne (email, jour) : `used = used + n` avec la condition « la ligne n'existe pas encore, ou `used` est inférieur ou égal à `MAX_CREDIT − n` ». Cette mise à jour remet aussi `refusals` à 0. (Dans une expression de condition on ne peut pas utiliser `if_not_exists`, d'où la forme avec `attribute_not_exists`.)
7. En cas de refus pour crédit : `BlockService.registerRefusal` ajoute 1 à `refusals` ; à `REFUSAL_THRESHOLD`, écrit `blockedUntil = maintenant + BLOCK_SECONDS` et remet `refusals` à 0. La réponse indique le motif et le crédit restant. Le client **rejette** la modification locale et resynchronise l'état du serveur.
8. Si accepté : **une seule** mise à jour de la ligne du document : `ADD seq 1`, `SET updatedAt`, `SET contributors.#email = :name`, avec renvoi des nouvelles valeurs (condition : le document existe). Le `seq` obtenu fixe l'ordre total.
9. `UpdateRepository.append(docId, seq, …)` (condition : la clé n'existe pas). En cas d'échec : `CreditService.refund`.
10. `VersionService.maybeCheckpoint`.
11. `Broadcaster` envoie la mise à jour aux autres connexions du document ; les connexions mortes (410) sont supprimées de la table.
12. Accusé à l'expéditeur : `{type:"ack", seq, creditRemaining}`. C'est la notification de crédit en temps réel (envoyée aussi aux autres appareils de la même adresse).

Pourquoi débiter avant d'enregistrer : l'inverse pourrait dépasser le crédit. Un échec après débit est compensé par le remboursement.

**Synchronisation.** À la (re)connexion, le client envoie `{action:"join", docId, lastSeq}` et reçoit l'état depuis le dernier point de sauvegarde puis les modifications au-delà de `lastSeq`. Il renvoie ses modifications non accusées (identifiées par `opId`). Yjs garantit la convergence quel que soit l'ordre d'arrivée.

**Présence.** Les messages de présence (curseur, ligne) sont relayés sans être enregistrés. Éditeur : `<textarea>` avec une liaison à Yjs écrite par moi (comparaison ancien/nouveau texte pour déduire insertion ou suppression, environ 60 lignes). La présence s'affiche dans la barre (« Marc, ligne 12 »).

**Pendant un blocage.** L'éditeur s'ouvre en lecture seule avec un bandeau « Vous êtes bloqué jusqu'à HH:MM » ; la connexion WebSocket reste ouverte pour recevoir les modifications des autres. Les boutons Inviter, Publier et Restaurer sont désactivés côté page, et refusés côté serveur (le serveur fait foi). « Mes documents » reste consultable.

### 12.2 Télécharger (C1, C3, C5, C6)

1. `LinkService.requestDownload(linkId)` lit le lien (lecture simple). Introuvable : 404 « introuvable ». `remaining` à 0 : **410 « épuisé » immédiatement**, sans toucher S3 ni le PDF (chemin rapide).
2. Lire le document (lecture cohérente) pour connaître `seq`.
3. Si `pdfSeq` est différent de `seq` : `PdfService.ensure` tente d'obtenir le verrou de génération (écriture conditionnelle dans `Locks`, avec TTL). Verrou obtenu : générer le PDF à partir de l'état `seq` (jamais en pleine écriture), le déposer dans S3 sous `pdf/{docId}/{seq}.pdf`, mettre à jour `pdfSeq`, libérer. Verrou pris par un autre : **429 « patienter »** avec `Retry-After`, sans rien consommer.
4. `LinkRepository.consumeOne` : **une seule** mise à jour atomique « retirer 1 à `remaining` **si** `remaining > 0` » avec renvoi de la nouvelle valeur. Condition refusée : 410 « épuisé ». Sinon, **numéro d'exemplaire = `total − remaining`**.
5. Si la nouvelle valeur est 0 : **une seule** requête le voit ; elle met l'e-mail « dernier exemplaire » en file.
6. `PdfService.presign` : adresse temporaire (`PRESIGN_SECONDS`) avec `Content-Disposition: attachment`.
7. 200 : `{etat:"telechargement", url, numero, restants}`.

Règle : **jamais de lire puis écrire** pour le compteur. Toute exception inattendue renvoie 503 avec `Retry-After` et un journal d'erreur ; toute limitation (DynamoDB, API Gateway) est présentée comme « patienter ».

### 12.3 Publier

Contrôle d'accès et de blocage, validation du nombre (entier de 1 à `MAX_COPIES`, 500 par défaut), identifiant aléatoire (`crypto.randomBytes(16)` encodé), écriture conditionnelle (la clé n'existe pas), point de sauvegarde, réponse avec le lien à copier. Optionnel : préparer le PDF à l'avance (préchauffage) pour la première vague de visiteurs.

### 12.4 Inviter

Propriétaire seulement ; blocage respecté. Valider les adresses (au plus `MAX_INVITES_PER_REQUEST` par demande, `MAX_INVITES_PER_DAY` par jour), créer un `Membership` par adresse, mettre un e-mail en file par personne. `MailConsumer` envoie via SES un message à la fois (concurrence limitée) pour respecter le débit du mode sandbox, avec file de messages en échec (DLQ).

### 12.5 Restaurer une version

Contrôle d'accès et de blocage. Créer un point de sauvegarde de l'état courant, reconstruire le texte de la version choisie, produire une modification qui remplace le contenu (suppression puis insertion), l'ajouter comme une modification acceptée **sans débiter le crédit**, diffuser. L'historique n'est jamais effacé.

### 12.6 Vue association

Code secret lu depuis SSM (mis en cache quelques minutes dans la fonction). Comparaison à temps constant. Lecture : documents avec connexions actives, liens avec `remaining`, blocages avec `blockedUntil` supérieur à maintenant. Le balayage des tables est acceptable à cette échelle (limite à documenter).

---

## 13. API

Identification du rédacteur : en-têtes `X-User-Email` et `X-User-Name` (déclaratif). Administrateur : en-tête `X-Admin-Code`. Réponses d'erreur au format `{ "erreur": "code", "message": "…" }`. Un rédacteur bloqué qui tente une action de modification reçoit **403** avec `erreur: "bloque"` et `jusqua` (horodatage de fin).

| Route | Accès | Rôle |
|---|---|---|
| `GET /api/publications` | Public (cache 5 s) | Accueil. |
| `GET /api/links/{id}` | Public (cache 1 à 2 s) | Page du journal. |
| `POST /api/links/{id}/download` | Public | Téléchargement : **200** (url, numero, restants), **429** (patienter, `Retry-After`), **410** (épuisé), **404** (introuvable). |
| `GET /api/documents` · `POST /api/documents` | Rédacteur | Mes documents ; création (vide ou modèle). |
| `GET /api/documents/{id}` | Accès | Détails, rôle, contributeurs. |
| `POST /api/documents/{id}/invitations` | Propriétaire | Inviter. |
| `POST /api/documents/{id}/links` | Accès | Publier. |
| `GET /api/documents/{id}/versions` · `POST /api/documents/{id}/versions/{n}/restore` | Accès | Historique, restauration. |
| `GET /api/documents/{id}/preview` | Accès | Aperçu en lecture seule. |
| `GET /api/me/credit` | Rédacteur | Crédit restant. |
| `GET /api/admin/state` | Code administrateur | Tableau de bord. |
| WebSocket : `join`, `update`, `awareness` | Accès | Édition collaborative. |

Le document final `docs/api.md` doit être assez précis (exemples de requêtes et de réponses, codes d'erreur) pour que le jury écrive son propre test.

---

## 14. Bibliothèques autorisées

**Serveur (Node.js sur Lambda, version LTS prise en charge ; vérifier)**

| Bibliothèque | Rôle |
|---|---|
| `yjs`, `lib0`, `y-protocols` | CRDT, encodage, présence. |
| `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb` | DynamoDB. |
| `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | PDF et adresses présignées. |
| `@aws-sdk/client-sqs`, `@aws-sdk/client-sesv2` | File d'e-mails, envoi. |
| `@aws-sdk/client-apigatewaymanagementapi` | Envoi aux connexions WebSocket. |
| `@aws-sdk/client-ssm` | Code administrateur. |
| `pdf-lib`, `@pdf-lib/fontkit` | Génération du PDF avec police intégrée (accents). Retour à la ligne et pagination écrits à la main. Alternative à tester : `pdfkit`. |
| `zod` | Validation des entrées. |
| `crypto` (intégré) | Identifiants aléatoires. |

**Navigateur (JavaScript sans framework)** : `yjs`, `y-protocols`, empaquetés avec `esbuild` en un seul fichier (pas de CDN) ; `fetch` et `WebSocket` natifs ; reconnexion automatique écrite à la main (environ 20 lignes).

**Outils** : AWS CLI, AWS SAM CLI, `esbuild`, `vitest`, `aws-sdk-client-mock`, `ws` (clients WebSocket scriptés pour les tests), `k6` (test de charge).

---

## 15. Sécurité et bonnes pratiques (cours « Introduction à AWS » et sujet)

1. **Moindre privilège** : un rôle IAM par fonction, uniquement les actions et ressources nécessaires. Aucune fonction ne peut supprimer d'objet S3.
2. **Rôles et identifiants temporaires plutôt que clés d'accès.** Aucune clé dans le code, le dépôt ou les variables versionnées.
3. **Jamais de clé dans Git** ; `.gitignore` soigné ; vérification avant chaque commit.
4. **Compte racine jamais utilisé au quotidien.** MFA activé. Utilisateur avec droits limités ou IAM Identity Center pour travailler.
5. **S3** : buckets privés, blocage de tout accès public, chiffrement par défaut, site servi uniquement par CloudFront.
6. **Pas de ports ouverts inutilement** (aucun serveur à administrer dans cette architecture).
7. **Budget** : alerte AWS Budgets dès le début (1 à 5 dollars) ; captures de Cost Explorer à la fin ; suppression complète à la fin par la commande du README.
8. **Journalisation** : journaux structurés sans données personnelles inutiles.
9. **Six piliers du Well-Architected** : à citer dans le dossier.

Droits par fonction (à affiner) :

| Fonction | Droits nécessaires (exemple) |
|---|---|
| Téléchargement | Lire Links et Documents ; mettre à jour Links et Locks ; lire et écrire dans `pdf/*` du bucket PDF ; envoyer dans la file ; lire Versions et DocUpdates (génération). |
| Publier | Écrire dans Links ; lire Documents et Memberships. |
| Temps réel | Lire et écrire Documents, DocUpdates, Credits, Blocks, Connections, Locks, Versions ; envoyer aux connexions. |
| Inviter | Lire Documents ; écrire Memberships ; envoyer dans la file. |
| MailConsumer | Lire la file ; envoyer via SES. |
| Administration | Lecture des tables ; lire le paramètre du code. |

---

## 16. Tests et preuves

Tous les résultats bruts sont conservés dans `tests/results/` (horodatés).

| Test | Contrainte | Méthode | Résultat attendu |
|---|---|---|---|
| T1 Concurrence des liens | C1 | Lien à 500 ; 2 000 requêtes simultanées. | Exactement 500 réponses 200 avec des numéros 1 à 500 **tous distincts** ; 1 500 réponses 410 ou 429 ; compteur final à 0 ; aucune réponse 5xx. |
| T2 Écritures simultanées | C2 | N clients scriptés (`ws`) écrivent au même endroit. | Tous les documents finaux sont identiques ; le nombre de caractères correspond à la somme des insertions acceptées ; aucune modification acceptée perdue. |
| T3 Lien à jour | C3 | Créer un lien, modifier le document, télécharger. | Le PDF contient la modification. Un second téléchargement sans changement réutilise le PDF. |
| T4 Crédit multi-appareils | C4 | Deux sessions épuisent le crédit ensemble. | Total accepté inférieur ou égal à 10 000. |
| T5 Pic | C5 | k6 : 15 000 requêtes, 80 % en 60 s, avec 300 rédacteurs actifs. | Zéro 5xx ; toutes les réponses parmi {200, 429, 410} ; temps de réponse mesurés. |
| T6 Épuisement | C6 | Après le dernier exemplaire, nouvelles requêtes. | Toutes « épuisé » ; aucune adresse émise. |
| T7 Blocage | BF16 | Épuiser le crédit puis 3 refus (paramètres réduits). | Écriture, création, invitation, publication et restauration refusées pendant le blocage ; lecture possible ; compteur remis à 0 ; fin à l'heure prévue ; crédit non rechargé à la fin du blocage ; recharge à minuit UTC. |
| T8 Idempotence | BNF16 | Rejouer une opération avec le même `opId`. | Crédit et document inchangés. |
| Unitaires | Tous | Services avec AWS simulé ; `YjsText` ; `PdfBuilder`. | Règles métier vérifiées sans AWS. |

Le rapport de test présente : méthode, objectifs fixés, résultats bruts, analyse, et la preuve explicite du respect de C1 et C2.

---

## 17. Plan d'exécution (étapes à suivre une par une)

À chaque étape : expliquer, coder petit, tester, commiter. Ne pas passer à la suivante sans mon « suivant ».

| Étape | Contenu | Preuve ou livrable |
|---|---|---|
| 0 | Dépôt Git (`.gitignore` d'abord), README squelette, outils (AWS CLI, SAM, Node), profil AWS sans clé dans le dépôt, MFA, alerte Budgets. | Premier commit propre. |
| 1 | **Les cinq vérifications de la section 9.5** (quota Lambda, SES, PDF avec accents, relais minimal, limites WebSocket). | Notes de résultats. |
| 2 | Squelette SAM : une table, une fonction, une route « hello », déploiement et suppression. | `sam deploy` et `sam delete` fonctionnent. |
| 3 | `config.js`, repositories de base, `domain/validation`. | Tests unitaires. |
| 4 | **Liens : publier et télécharger de façon atomique** (sans PDF réel au début), puis test T1. | Résultats bruts de T1. |
| 5 | `PdfService`, S3, verrou, adresse présignée, lien à jour (T3). | PDF français correct ; T3. |
| 6 | Crédit et blocage (`CreditService`, `BlockService`) avec tests, puis T4 et T7. | T4, T7. |
| 7 | Documents, modèles, memberships, invitations, SQS et SES. | Invitation reçue. |
| 8 | Édition collaborative : relais WebSocket, persistance, synchronisation, présence, versions et restauration, puis T2 et T8. | T2, T8. |
| 9 | Pages P0 à P5. | Parcours complet manuel. |
| 10 | Espace association (P5, API d'administration). | Écran de contrôle. |
| 11 | Préparation du pic : CloudFront, cache, limitation de débit, puis T5 et T6. | T5, T6. |
| 12 | Livrables : README testable, dossier de conception (avec alternatives écartées et limites), rapport de test, `docs/api.md`, preuve de coût. | Documents complets. |
| 13 | Nettoyage : suppression de toutes les ressources. | Compte propre. |

Échéance du plan B pour l'édition collaborative : voir section 9.4. Réserver **au moins 4 heures** pour l'étape 12.

---

## 18. Limites assumées et perspectives (à reprendre dans le dossier)

**Limites.** Identification déclarative (usurpation possible par quelqu'un qui connaît l'adresse). Un rédacteur bloqué peut toujours télécharger comme visiteur anonyme. Une modification erronée est visible des téléchargements suivants tant qu'elle n'est pas corrigée. Pas de modération du contenu. Taille de version limitée par la taille maximale d'une ligne DynamoDB. Balayage des tables pour la vue association. Un exemplaire est consommé dès la délivrance de l'adresse, même si le visiteur ne l'ouvre pas. Quota de concurrence Lambda à relever sur un compte récent.

**Perspectives.** Mode contrôlé (lien figé sur une version publiée). Code administrateur à usage unique envoyé par e-mail. Éditeur CodeMirror avec curseurs distants. Vérification de l'adresse e-mail des rédacteurs. Aperçu identique au PDF. Débloquer ou fermer un lien depuis l'espace association. Mode de blocage strict (aucune consultation des documents pendant le blocage). Blocages progressifs en cas de récidive.

---

## 19. Premier message attendu de l'assistant

1. Résume en dix lignes ce que tu as compris du projet, de l'architecture et de ta façon de travailler avec moi.
2. Liste les points qui te semblent ambigus ou risqués (au plus cinq).
3. Propose le plan détaillé de l'étape 0, sans écrire de code, et attends mon « suivant ».
