# Journal de l'école

Journal numérique écrit à plusieurs, puis distribué par un lien qui délivre un nombre exact d'exemplaires PDF. Projet d'évaluation « Développement web et cloud ».

Les décisions déjà prises sont dans [`docs/BRIEF_CURSOR.md`](docs/BRIEF_CURSOR.md). Ce fichier est la référence unique du projet.

## Prérequis

À installer sur ta machine, avec les pages officielles :

- [Node.js 24](https://nodejs.org/). C'est la branche qui correspond au runtime Lambda `nodejs24.x`, pris en charge jusqu'au 30 avril 2028 selon [le calendrier Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html). Node.js 26 est en préversion sur Lambda : il n'est pas retenu.
- [AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html), dernière version publiée. Le numéro mineur change : on ne le fige pas ici.

Vérification :

```bash
node --version
aws --version
sam --version
```

Résultat attendu : une version `v24.x.x`, une ligne qui commence par `aws-cli/2.`, et une ligne `SAM CLI,` suivie d'un numéro de version.

## Aucune clé dans le dépôt

Les identifiants AWS restent dans `~/.aws/` sur ta machine, hors de ce dossier. La documentation de l'AWS CLI décrit ces fichiers ici : [configuration and credential files](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

Rien de secret ne se commit : pas de clé, pas de `.env`, pas de certificat. Le fichier `samconfig.toml`, lorsqu'il existera, pourra être versionné. Il contiendra le nom de la pile et la région, pas les clés. S'il contenait un secret, il resterait hors du dépôt.

## Compte AWS, de ton côté

Cette partie se fait dans la console AWS, pas dans ce dossier.

1. Région unique : celle affichée dans AWS Settings, rubrique Project, ligne Region. Sur le nouvel essai, AWS l'attribue (Ohio, Stockholm ou Sydney). On déploiera dans celle-là.
2. Travailler avec l'identité du projet. Le compte racine ne sert pas au quotidien. Active le MFA si la console le propose. IAM Identity Center n'est pas disponible sur le nouvel essai.
3. Profil AWS CLI créé avec `aws configure`, fichiers uniquement sous `~/.aws/`.
4. Alerte de coût : un budget AWS Budgets entre 1 et 5 dollars, ou la limite de dépense proposée dans AWS Settings si c'est l'écran de ton compte.

## Déployer

Les commandes seront écrites à l'étape 2, après un essai réel de `sam deploy`.

## Tester

Les commandes seront écrites avec les premiers tests. Les résultats bruts iront dans `tests/results/`. Ce dossier n'est pas ignoré par Git.

## Supprimer

La commande de suppression complète sera écrite quand le déploiement existera, puis reprise dans le README final.
