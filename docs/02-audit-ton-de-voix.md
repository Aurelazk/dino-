# Étape 1 — Audit du ton de voix (existant → réécritures)

## Hypothèses de départ (à confirmer)
- **Plateforme** : AgriMarket — « Vendez au juste prix ».
- **Pays / devise** : Bénin — FCFA (XOF).
- **Ton** : vouvoiement poli par défaut (configurable via i18n).
- **Langue** : français.

## Objectif
Repérer tous les textes qui « sonnent » froids, techniques ou génériques, et proposer une
version humaine : ce qui s'est passé, pourquoi, et quoi faire ensuite.

## 1. Messages d'erreur (API / serveur)

| Emplacement | Texte actuel | Problème | Réécriture proposée |
|---|---|---|---|
| `app/api/auth/signup/route.ts` | « Données invalides. » | froid, abstrait | « Il manque quelques informations pour créer votre compte. Vérifiez les champs surlignés. » |
| `app/api/auth/signup/route.ts` | « Un compte existe déjà avec cet e-mail. » | correct mais sec | « Un compte existe déjà avec cet e-mail. Connectez-vous, ou utilisez un autre e-mail. » |
| `app/api/auth/signup/route.ts` | « Une erreur est survenue. Réessayez. » | robotique | « Oups, on n'a pas pu créer votre compte. Vérifiez votre connexion et réessayez. » |
| `app/api/auth/signup/route.ts` | « Requête invalide. » | technique | « On n'a pas bien reçu votre demande. Réessayez. » |
| `app/api/auth/verify-email/route.ts` | « lien-invalide / lien-expire » (param brut) | technique | message affiché : « Ce lien de confirmation n'est plus valable. Demandez-en un nouveau. » |
| `components/auth/login-form.tsx` | « E-mail ou mot de passe incorrect. » | neutre | « L'e-mail ou le mot de passe ne correspond pas. Réessayez tranquillement. » |
| `components/auth/signup-flow.tsx` | « Veuillez corriger les champs en rouge. » | donneur d'ordre | « Presque terminé ! Corrigez les champs surlignés puis réessayez. » |
| `components/auth/signup-flow.tsx` | « Impossible de contacter le serveur. Réessayez. » | technique | « On n'arrive pas à joindre AgriMarket. Vérifiez votre connexion internet et réessayez. » |

## 2. Validations de formulaire (Zod)

| Champ | Texte actuel | Réécriture proposée |
|---|---|---|
| Prénom / Nom | « Prénom trop court » | « Votre prénom est trop court. » |
| E-mail | « Adresse e-mail invalide » | « Cette adresse e-mail ne semble pas correcte. » |
| Téléphone | « Numéro de téléphone invalide » | « Ce numéro ne semble pas valide (ex. +229 01 97 00 00 00). » |
| Mot de passe | « 8 caractères minimum » | « Votre mot de passe doit contenir au moins 8 caractères, dont un chiffre. » |
| Ville | « Ville requise » | « Indiquez votre ville. » |
| CGU | « Vous devez accepter les conditions » | « Pour continuer, merci d'accepter les conditions d'utilisation. » |
| Vendeur | « Choisissez un type de vendeur » | « Dites-nous quel type de vendeur vous êtes. » |

## 3. États vides (à humaniser + illustrer)

| Écran | Texte actuel | Réécriture proposée |
|---|---|---|
| Catalogue vide | « Aucun produit trouvé » | « On n'a rien trouvé pour cette recherche. Essayez un autre mot, ou découvrez nos catégories. » |
| Boutique vide | « Aucun produit » | « Votre boutique attend son premier produit. Ajoutez-le en 3 étapes, avec une photo. » |
| Espace vendeur absent | « Vous n'avez pas encore d'espace vendeur » | « Pas encore de boutique ? Ouvrez la vôtre en quelques minutes et vendez au juste prix. » |

## 4. Messages de succès

| Emplacement | Texte actuel | Réécriture proposée |
|---|---|---|
| Inscription acheteur | « Compte créé ! Vérifiez votre e-mail… » | « Bienvenue chez AgriMarket ! Un e-mail vient de partir pour confirmer votre adresse. » |
| Inscription vendeur | « Boutique créée ! … » | « Votre boutique est prête. Confirmons votre e-mail, et vous pourrez publier votre premier produit. » |
| Connexion | « Connexion réussie. Bienvenue ! » | « Rebonjour, content de vous revoir ! » |

## 5. Ce qui manque (à créer)
- Page **404** chaleureuse (« Cette page s'est perdue en chemin… ») avec liens utiles.
- **Skeletons** de chargement sur toutes les listes (catalogue, commandes, messages).
- **Réassurance** : paiement sécurisé, séquestre jusqu'à réception, retours, support WhatsApp.
- **Onboarding** progressif et **assistant d'aide** contextuel (bulle fermable).
- **i18n** : centraliser tous les textes dans `messages/fr.json` (voir étape 2).

## Suites
- **Étape 2** : guide de ton de voix + fichiers de traduction centralisés + composants `EmptyState`/`ErrorState`/réassurance.
- Puis pages humaines, micro-interactions, infrastructure de démo, et les 3 démos.
