# Une invitation pour toi

Application de proposition de rendez-vous personnalisée. Le créateur compose une
invitation (occasion, message, photo, lieux, créneaux, thème) et obtient un lien
unique. Le destinataire — sans compte — ouvre le lien, traverse une expérience
animée, choisit son lieu et son créneau, et accepte. Les deux reçoivent un
fichier `.ics` et un lien Google Calendar pré-rempli ; le créateur est notifié
par email avec le récapitulatif complet.

## État actuel

Au-delà du parcours créateur/destinataire décrit plus bas, le dépôt contient
aussi :

- **Site vitrine** (`src/app/(marketing)/`) — accueil, `/tarifs` (formules
  free/premium/gold, XOF et EUR), blog en Markdown (`content/blog/`),
  `/contact` et `/partenaires` (formulaires protégés par Cloudflare Turnstile),
  `/a-propos`.
- **Géolocalisation des lieux** — un créateur peut relever la position d'un
  lieu depuis son navigateur (`src/components/dashboard/LocationPicker.tsx`),
  transmise au destinataire sous forme de lien Maps.
- **Contre-proposition de date** — si aucun créneau proposé ne convient, le
  destinataire peut en soumettre un autre (statut `countered`).
- **Quotas et tableau de bord Super Admin** (`/admin`) — KPIs, croissance,
  liste des créateurs, changement manuel de formule. Réservé aux comptes avec
  `users.is_super_admin = true` (attribué en base, jamais via l'interface).
- **Console d'administration indépendante** (`/console`) — voir plus bas.
- **Site vitrine bilingue FR/EN** — un bouton `FR`/`EN` dans l'en-tête, à côté
  de la bascule clair/sombre. La préférence est retenue dans `localStorage` et
  posée sur `<html>` avant le premier rendu, sans rechargement de page.
  Couverture : vitrine, blog (articles traduits) et pages légales. Le
  dashboard, l'admin, le parcours destinataire et les emails restent en
  français.

Pas encore fait : intégration de paiement réelle (voir « Prêt pour Stripe »
plus bas).

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
migrations de `supabase/migrations/` **dans l'ordre** (le fichier
`supabase/migrations-combined.sql` les concatène déjà dans le bon ordre, pour
un simple copier-coller dans le SQL Editor) :

1. `20260730120000_init.sql` — tables, contraintes, trigger d'inscription, fonction de purge
2. `20260730120100_rls.sql` — Row Level Security
3. `20260730120200_storage.sql` — bucket `proposal-photos` et ses policies
4. `20260730120300_harden_rpc_grants_and_storage.sql` — durcissement des RPC et du bucket
5. `20260731090000_counter_proposal_and_geolocation.sql` — contre-proposition de date, coordonnées de lieu
6. `20260731100000_align_plan_names_and_quota.sql` — formules `free`/`premium`/`gold`, quota mensuel
7. `20260801090000_super_admin_and_stats.sql` — drapeau super-admin, agrégats du tableau de bord

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

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` et `TURNSTILE_SECRET_KEY` sont également
facultatives : sans elles, la vérification anti-robot des formulaires Contact
et Devenir partenaire est neutralisée plutôt que de bloquer l'envoi.

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

Le champ `users.plan` accepte `free`, `premium` et `gold` — les trois formules
de `/tarifs`. Un quota mensuel d'invitations est appliqué côté serveur selon
la formule (voir `src/lib/data/quota.ts`) ; son dépassement renvoie une 402.
Le changement de formule est aujourd'hui **manuel**, via le tableau de bord
Super Admin (`/admin`) — aucun paiement réel n'est branché.

## Console d'administration (`/console`)

Espace d'exploitation séparé du produit : aucun lien depuis la vitrine ni
depuis l'espace créateur, et **sa propre session**.

Cette indépendance tient au préfixe de cookie. Le client créateur utilise le
préfixe `sb-` par défaut, la console écrit sous `otyche-console`
(`src/lib/supabase/console.ts`). Les deux sessions cohabitent sur le même
domaine sans se voir : se connecter à la console ne connecte pas à
`/dashboard`, et se déconnecter de l'une laisse l'autre intacte.

**Trois barrières cumulatives** pour entrer (`src/lib/console/guard.ts`) :

1. une session valide sur le cookie console ;
2. l'adresse figure dans l'allowlist de `src/lib/console/access.ts`
   (`bcyrapie.mail@gmail.com` par défaut, surchargeable par
   `CONSOLE_ADMIN_EMAILS`) ;
3. `users.is_super_admin` est vrai en base.

Aucune ne suffit seule — un accès en écriture à la table `users` ne permet pas
de s'auto-promouvoir, l'allowlist vivant dans le code. La connexion se fait par
**email + mot de passe** sur `/console/login` — volontairement différent du
lien magique utilisé partout ailleurs dans l'app, pour un opérateur unique qui
se reconnecte souvent depuis un poste fixe. Le même message d'erreur sert pour
« email non autorisé » et « mot de passe incorrect », pour ne pas transformer
le formulaire en oracle. Le mot de passe se gère depuis le tableau de bord
Supabase (Authentication → Users → sélectionner le compte → « Reset
password ») ; il n'existe pas d'écran « mot de passe oublié » dans la console
elle-même.

| Page | Contenu |
| --- | --- |
| `/console` | KPIs, croissance, revenu estimé, dernières actions |
| `/console/utilisateurs` | Formule, suspension, suppression définitive |
| `/console/invitations` | Toutes les invitations, détail, désactivation, suppression |
| `/console/journal` | Trace horodatée de chaque action d'administration |
| `/console/systeme` | Santé de la base, purges en attente, présence des variables d'env |

**Suspension** — `users.suspended_at`. Un compte suspendu conserve ses données
et ses invitations déjà envoyées restent consultables par leurs destinataires,
mais la création est refusée côté serveur (403 dans `POST /api/proposals`).

**Journal** — chaque action écrit dans `admin_audit_log`. Aucune route de
l'application ne met à jour ni ne supprime ces lignes.

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
│  ├─ i18n/                dictionnaire FR/EN et contexte de langue
│  ├─ email/               templates et envoi Resend
│  ├─ supabase/            clients navigateur / serveur / service_role
│  ├─ validation/          schémas Zod
│  └─ billing/             plans (préparé pour Stripe)
└─ proxy.ts                rafraîchissement de session, protection /dashboard
```

`proxy.ts` remplace `middleware.ts` : Next.js 16 a renommé cette convention.
