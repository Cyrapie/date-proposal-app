# Une invitation pour toi

Application de proposition de rendez-vous personnalisée. Le créateur compose une
invitation (occasion, message, photo, lieux, créneaux, thème) et obtient un lien
unique. Le destinataire — sans compte — ouvre le lien, traverse une expérience
animée, choisit son lieu et son créneau, et accepte. Les deux reçoivent un
fichier `.ics` et un lien Google Calendar pré-rempli ; le créateur est notifié
par email avec le récapitulatif complet.

## Stack

| Rôle | Choix |
| --- | --- |
| Framework | Next.js 16 (App Router), TypeScript |
| Styles | Tailwind CSS v4 |
| Animations | Framer Motion |
| Base / Auth / Stockage | Supabase (Postgres, magic link, Storage) |
| Emails | Resend |
| Calendrier | Fichier `.ics` (librairie `ics`) + lien Google pré-rempli |
| Cible de déploiement | Vercel |

Aucune intégration OAuth calendrier : rien ne se connecte à Google, Outlook ou
Apple Calendar.

## Démarrage en local

### 1. Dépendances

```bash
npm install
```

### 2. Projet Supabase

Créez un projet sur [supabase.com](https://supabase.com), puis appliquez les
trois migrations de `supabase/migrations/` **dans l'ordre**. Le plus simple est
de les coller dans le SQL Editor du tableau de bord :

1. `20260730120000_init.sql` — tables, contraintes, trigger d'inscription, fonction de purge
2. `20260730120100_rls.sql` — Row Level Security
3. `20260730120200_storage.sql` — bucket `proposal-photos` et ses policies

Avec la CLI Supabase, depuis un projet lié :

```bash
npx supabase db push
```

Activez ensuite l'authentification par email (magic link) dans
**Authentication → Providers → Email**, et ajoutez
`http://localhost:3000/auth/callback` dans **Authentication → URL
Configuration → Redirect URLs**.

### 3. Variables d'environnement

```bash
cp .env.example .env.local
```

Renseignez au minimum les trois clés Supabase (`Project Settings → API`) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — clé serveur, jamais exposée au navigateur

`RESEND_API_KEY` est **facultative en local** : sans elle, les emails sont
journalisés dans la console au lieu d'être envoyés, et le reste du parcours
fonctionne normalement.

### 4. Lancer

```bash
npm run dev
```

L'application démarre sur [http://localhost:3000](http://localhost:3000).

### Autres commandes

```bash
npm run build
```

```bash
npm run lint
```

## Parcours

**Créateur** — `/login` (magic link) → `/dashboard` (liste des invitations avec
statut créée / vue / répondue) → `/dashboard/new` (formulaire) → lien
`/d/[slug]` à copier.

**Destinataire** — `/d/[slug]` : enveloppe scellée → lettre → écran de décision
→ sélection du lieu et du créneau → confirmation avec `.ics` et lien Google
Calendar. Aucun compte, aucune connexion.

Le statut passe à **vue** (avec horodatage) dès la première ouverture du lien,
avant toute interaction.

### Aperçu des thèmes sans base

En développement uniquement, `/preview/classic`, `/preview/fun` et
`/preview/midnight` rendent le parcours complet avec des données factices et
sans appel réseau. Pratique pour itérer sur les animations et les couleurs. Ces
routes renvoient un 404 en production.

## Le bouton « Non »

Implémenté dans [`src/components/recipient/NoButton.tsx`](src/components/recipient/NoButton.tsx),
conformément à la spécification :

- position en `offset` x/y et compteur de tentatives ;
- au tap/clic (et au survol), fuite vers une position aléatoire tirée dans une
  ellipse bornée à sa zone de jeu — il ne peut jamais sortir du cadre visible ;
- transition spring d'environ 250 ms ;
- un message différent à chaque tentative, parcouru cycliquement : « Essaie
  encore », « Tu es sûr ? », « Non non », « Pas cette fois », « Vraiment ? » ;
- après 3 ou 4 tentatives — nombre tiré au hasard au chargement de la page —
  il passe en `pointer-events: none` et **continue de dériver seul** toutes les
  1,4 s pour l'effet comique ;
- le bouton « Oui » reste immobile et cliquable à tout moment.

Le composant n'expose **aucun** callback de refus. Il ne peut donc pas, par
construction, déclencher une réponse « Non » — quel que soit le nombre de clics,
y compris au clavier ou par script.

## Modèle de données

`users` · `proposals` · `proposal_locations` · `proposal_slots` · `responses`

Deux écarts assumés par rapport au brief, tous deux additifs :

- **`proposals.viewed_at`** — le brief demande un horodatage du passage au
  statut « vue » ; il lui fallait une colonne.
- **`responses.recipient_email`** — le brief prévoit un email de confirmation au
  destinataire, mais celui-ci n'a pas de compte et son adresse n'était donc
  stockée nulle part. Le champ est facultatif : il est proposé sur l'écran de
  sélection, et l'email n'est envoyé que s'il est renseigné.

Le champ `users.plan` existe dès maintenant. Sa contrainte accepte déjà
`free`, `pro` et `lifetime`, afin qu'activer un modèle payant ne demande
**aucune migration de schéma**. Seul `free` est utilisé aujourd'hui.

## Sécurité

RLS est activé sur toutes les tables : avec la clé anon, un créateur ne voit que
ses propres données. Le parcours destinataire est rendu entièrement côté serveur
avec la clé `service_role`, qui ne quitte jamais le serveur (le garde
`server-only` fait échouer le build en cas d'import client). La connaissance du
slug — 12 caractères, ~62 bits d'entropie — fait office d'autorisation, et le
serveur vérifie systématiquement que le lieu et le créneau soumis appartiennent
bien à l'invitation concernée.

## RGPD

- Politique de confidentialité : `/privacy`.
- Chaque lien porte une date d'expiration choisie à la création (7 à 90 jours).
  Passé ce délai, le contenu n'est plus servi.
- `GET /api/cron/purge` supprime définitivement les invitations expirées depuis
  plus de `PURGE_GRACE_DAYS` jours. La route est protégée par `CRON_SECRET` et
  câblée sur un Cron Vercel quotidien dans `vercel.json`.
- Seuls des cookies de session sont déposés. Aucun traceur.

## Prêt pour Stripe

[`src/lib/billing/plans.ts`](src/lib/billing/plans.ts) définit les plans et
leurs limites, avec les emplacements des `priceId` et la marche à suivre en
commentaire d'en-tête. Aucune dépendance Stripe n'est installée : il reste à
ajouter les routes checkout et webhook, et à mettre à jour `users.plan`.

## Déploiement Vercel

Importez le dépôt, reportez les variables de `.env.example` dans les
**Environment Variables** du projet, et ajustez :

- `NEXT_PUBLIC_SITE_URL` sur le domaine de production ;
- les **Redirect URLs** Supabase pour y ajouter
  `https://votre-domaine/auth/callback` ;
- `EMAIL_FROM` sur un domaine vérifié dans Resend.

Le Cron de purge défini dans `vercel.json` s'active automatiquement.

## Structure

```
src/
├─ app/
│  ├─ d/[slug]/            parcours destinataire
│  ├─ dashboard/           liste + formulaire de création
│  ├─ login/, auth/        magic link et callback
│  ├─ preview/[theme]/     aperçu dev sans base
│  ├─ privacy/             politique de confidentialité
│  └─ api/                 proposals, view, respond, ics, cron
├─ components/
│  ├─ recipient/           écrans animés, dont NoButton
│  ├─ dashboard/           formulaire, badge de statut, copie du lien
│  └─ ui/
├─ lib/
│  ├─ calendar/            génération .ics et lien Google
│  ├─ data/                accès aux propositions
│  ├─ domain/              types d'occasion, thèmes, slugs
│  ├─ email/               templates et envoi Resend
│  ├─ supabase/            clients navigateur / serveur / service_role
│  ├─ validation/          schémas Zod
│  └─ billing/             plans (préparé pour Stripe)
└─ proxy.ts                rafraîchissement de session, protection /dashboard
```

`proxy.ts` remplace `middleware.ts` : Next.js 16 a renommé cette convention.
