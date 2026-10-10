# AgriMarket — Étape 1 : Analyse & Architecture

> **AgriMarket — Vendez au juste prix**
> Place de marché des produits vivriers · Bénin · FCFA (XOF)
> Paiements : Mobile Money + carte + à la livraison

---

## 1. Vision produit

Mettre en relation directe **producteurs** (agriculteurs, éleveurs, pêcheurs,
transformateurs) et **commerçants** avec des **acheteurs** (particuliers et
professionnels). Zéro intermédiaire : le producteur vend au juste prix,
l'acheteur achète frais, local et traçable.

**Principe structurant : deux espaces totalement isolés** (Acheteur / Vendeur),
chacun avec son dashboard, sa navigation, son accent de couleur et ses
permissions. Un même humain peut posséder les deux, reliés par une même
identité (`User`), mais **les données ne se croisent jamais**.

---

## 2. Décisions techniques (et pourquoi)

| Domaine | Choix | Justification |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/ISR pour le SEO des fiches produit, Server Actions pour les mutations, un seul déploiement front+back. |
| UI | **Tailwind CSS + shadcn/ui** | Design system cohérent, composants accessibles (Radix sous le capot), personnalisation totale. |
| Animations | **Framer Motion** (+ GSAP ponctuel) | Micro-interactions < 400 ms, switch d'espace animé, respect de `prefers-reduced-motion`. |
| ORM / BDD | **Prisma + PostgreSQL** | Typage bout-en-bout, migrations versionnées, transactions. PostGIS pour la géo. |
| Auth | **Auth.js (NextAuth v5)** | Email/mot de passe (argon2), OTP téléphone, Google. Sessions JWT + RBAC serveur. |
| Stockage images | **Cloudinary** (ou Supabase Storage) | Upload signé, transformations WebP/AVIF, responsive `srcset`. |
| Temps réel | **Supabase Realtime** ou WS maison | Messagerie + notifications de statut de commande. |
| Recherche | **Postgres full-text (pg_trgm + tsvector)** → Meilisearch plus tard | Suffisant au démarrage, migrable sans changer l'API interne. |
| Paiements | **Couche d'abstraction `PaymentProvider`** | Adaptateurs interchangeables : MTN MoMo, Moov Money, carte (Stripe/Flutterwave), cash à la livraison. |
| Validation | **Zod** | Schémas partagés client/serveur, typage inféré. |
| Tests | **Vitest** (unitaire) + **Playwright** (parcours critiques : inscription, commande, checkout). |
| Déploiement | **Vercel** + PostgreSQL managé (Neon/Supabase) + CI GitHub Actions | Preview par PR, migrations en CI. |

### Pourquoi PAS « un simple monolithe PHP » ou du statique
Le besoin impose : recherche filtrée, géo, temps réel, RBAC multi-rôles,
paiements multiples, SEO produit. Next.js + Postgres couvre tout avec un seul
langage et une base relationnelle adaptée aux transactions de commande.

---

## 3. Arborescence du projet

```
agrimarket/
├─ app/
│  ├─ (marketing)/            # vitrine publique, SEO
│  │  ├─ page.tsx             # landing
│  │  ├─ catalogue/           # catalogue public + filtres
│  │  ├─ produit/[slug]/      # fiche produit (ISR, JSON-LD)
│  │  └─ vendeur/[slug]/      # fiche vendeur publique
│  ├─ (auth)/
│  │  ├─ connexion/
│  │  ├─ inscription/         # choix du rôle (2 cartes), étapes
│  │  ├─ otp/                 # vérification téléphone
│  │  └─ mot-de-passe-oublie/
│  ├─ (buyer)/espace-acheteur/
│  │  ├─ dashboard/           # accueil connecté
│  │  ├─ commandes/[id]/      # suivi temps réel
│  │  ├─ favoris/  panier/  checkout/  messages/  avis/  profil/
│  │  └─ adresses/
│  ├─ (seller)/espace-vendeur/
│  │  ├─ dashboard/           # CA, graphiques 7j/30j/12m
│  │  ├─ produits/            # CRUD + images + saisonnalité
│  │  ├─ commandes/[id]/      # accept/refus, statuts, bon de livraison
│  │  ├─ messages/  avis/  portefeuille/  parametres/
│  ├─ (admin)/admin/
│  │  ├─ vendeurs/            # validation / KYC
│  │  ├─ produits/  avis/  litiges/  utilisateurs/  finances/
│  ├─ api/
│  │  ├─ auth/[...nextauth]/  # Auth.js
│  │  ├─ payments/webhook/[provider]/
│  │  ├─ search/              # suggestions
│  │  └─ uploads/sign/        # signature Cloudinary
│  ├─ layout.tsx  globals.css  sitemap.ts  robots.ts
├─ components/
│  ├─ ui/                     # shadcn/ui retouchés
│  ├─ product/  cart/  order/  seller/  layout/  motion/
├─ features/                  # architecture par fonctionnalité
│  ├─ auth/                   # schema zod, actions, rbac
│  ├─ products/  orders/  cart/  payments/  messaging/  reviews/  admin/
├─ lib/
│  ├─ db.ts (Prisma)  auth.ts  rbac.ts  payments/  search/  storage/  utils.ts
├─ prisma/
│  ├─ schema.prisma           # ← livrable étape 1
│  ├─ migrations/
│  └─ seed.ts
├─ styles/  public/  tests/  docs/
├─ .env.example  next.config.ts  tailwind.config.ts  package.json
```

**Conventions** : architecture *par fonctionnalité* (`features/*`), composants
de présentation purs dans `components/`, toute la logique métier et d'accès
données dans `features/*` ou `lib/`. Un composant serveur par défaut, `"use
client"` seulement quand c'est nécessaire.

---

## 4. Modèle de données — vue d'ensemble

Entités (voir `prisma/schema.prisma` pour le détail complet) :

- **User** — identité unique (email, téléphone, mot de passe argon2, localisation).
- **Account** — *un espace* : `role ∈ {BUYER, SELLER, ADMIN}`, relié au User.
  Un User peut avoir 1 compte Acheteur **et** 1 compte Vendeur (`@@unique(userId, role)`).
- **BuyerProfile / SellerProfile** — extensions d'un Account (type d'acheteur,
  type de vendeur, boutique, KYC, notation).
- **Category** — arborescente (parent/enfant), avec **taux de commission** par catégorie.
- **Product / ProductImage** — annonce, unité, prix, stock, min de commande,
  saisonnalité, géo, statut.
- **Cart / CartItem** — panier local + serveur, multi-vendeurs.
- **Order / OrderItem / OrderStatusHistory** — commande (1 vendeur par commande),
  montants, frais, commission, historique de statut.
- **Payment / Payout / PayoutAccount / DeliveryZone** — encaissement, reversement
  vendeur, zones et frais de livraison.
- **Review** — note 1..5 sur produit et/ou vendeur, avec réponse publique.
- **Conversation / ConversationParticipant / Message** — messagerie acheteur↔vendeur.
- **Notification** — email / push / SMS.
- **Address** — carnet d'adresses, snapshot dans la commande.
- **Favorite** — liste de souhaits.
- **Dispute** — litige lié à une commande.

### Règles d'intégrité clés
- `Account @@unique([userId, role])` → un seul espace par rôle.
- `Product` : `price >= 0`, `stock >= 0`, `minOrderQty >= 1` (CHECK SQL).
- `Review.rating ∈ [1,5]` (CHECK). `OrderItem.qty >= 1`.
- Suppressions : `Cascade` sur les dépendances possédées (images, items),
  `Restrict` sur les références à préserver (produit d'une commande → produit
  historisé via snapshot, pas supprimé).
- Toute commande stocke un **snapshot** adresse + libellés produits (le prix/le
  nom ne changent plus, même si le produit évolue).

### Index (performance)
- **Recherche** : `pg_trgm` + `tsvector` GIN sur `Product.title/description`
  (migration SQL brute), `@@index([categoryId, status])`, `@@index([status, price])`.
- **Géolocalisation** : extension **PostGIS**, colonne `geography(Point)` +
  index **GiST** (migration brute) pour « producteurs près de moi ».
- **Commandes** : `@@index([buyerAccountId, status])`,
  `@@index([sellerAccountId, status])`, `@@index([placedAt])`.
- **Notifs** : `@@index([userId, readAt])`.

> Le schéma Prisma reste **100 % valide** ; les index avancés (GIN/GiST) sont
> ajoutés dans une migration SQL dédiée (Prisma ne génère pas PostGIS/trigram nativement).

---

## 5. RBAC & isolation des données

- Contrôle d'accès **côté serveur** sur chaque route/serveur action, via une
  fonction `authorize(user, accountType, resource)` : un vendeur ne lit/écrit
  **que** ses propres produits/commandes ; un acheteur **que** les siennes.
- Le **scope d'espace actif** est porté par le token (claim `accountId`, `role`).
  Le middleware recharge les permissions à chaque requête — jamais de confiance
  au client.
- Règle d'or : *jamais* de contrôle uniquement dans l'UI.

---

## 6. Comment tester cette étape

```bash
# 1) Valider le schéma Prisma
npx prisma validate --schema prisma/schema.prisma

# 2) Générer le client typé (après avoir une base)
npx prisma generate

# 3) Créer la première migration (nécessite DATABASE_URL)
npx prisma migrate dev --name init
```

Attendu : `prisma validate` → *"The schema is valid"*. Le client Prisma expose
tous les types des entités ci-dessus.

---

## 7. Prochaine étape (à valider)

**Étape 2 — Design system** : tokens (couleurs, typo, espacements, ombres,
rayons), `tailwind.config.ts`, `globals.css`, mode sombre, et les composants de
base (Button, Input, Card, Badge, Skeleton, EmptyState, Toast) en shadcn/ui,
puis l'**inscription avec choix du rôle** (les deux grandes cartes
« Je veux acheter » / « Je veux vendre »).

Dis-moi **« ok »** pour lancer l'étape 2 (ou signale un ajustement d'architecture).
