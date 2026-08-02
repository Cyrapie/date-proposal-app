/**
 * Dictionnaire FR/EN du site vitrine. `fr` est la source de vérité ; le type
 * de `en` est vérifié contre `typeof fr` pour qu'aucune clé ne manque.
 *
 * Le dashboard, l'admin, le parcours destinataire et les emails restent en
 * français pour l'instant — seul le site public (vitrine + pages légales)
 * est couvert ici.
 */

type Faq = { q: string; a: string };

const fr = {
  nav: {
    home: 'Accueil',
    pricing: 'Tarifs',
    partners: 'Devenir partenaire',
    blog: 'Blog',
    about: 'À propos',
    contact: 'Contact',
    cta: 'Créer mon date',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    mainNavLabel: 'Navigation principale',
    mobileNavLabel: 'Navigation mobile',
    homeAria: 'Accueil',
  },

  footer: {
    tagline: 'Proposez un rendez-vous en un lien. La personne choisit, et tout part dans vos agendas.',
    siteHeading: 'Le site',
    accountHeading: 'Votre compte',
    login: 'Se connecter',
    myInvitations: 'Mes invitations',
    confidentiality: 'Confidentialité',
    legalNavLabel: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    community: 'Règles de la communauté',
    terms: 'Conditions générales',
    legal: 'Mentions légales',
  },

  home: {
    badge: 'Pour les invitations qui méritent mieux qu’un SMS',
    heroTitle1: 'Proposez un rendez-vous,',
    heroTitle2: 'joliment.',
    heroBody:
      'Une invitation animée, envoyée en un lien. La personne l’ouvre comme une lettre, choisit le lieu et le créneau qui lui vont, et tout part directement dans vos deux agendas.',
    ctaHow: 'Comment ça marche',
    proof: [
      { label: 'Compte requis côté destinataire', value: 'Aucun' },
      { label: 'Connexion à votre agenda', value: 'Jamais' },
      { label: 'Durée de vie d’un lien', value: '7 à 90 j' },
    ],
    stepsEyebrow: 'Comment ça fonctionne',
    stepsTitle: 'Quatre étapes, deux minutes',
    stepsBody: 'Le temps de choisir deux restaurants et trois créneaux, c’est envoyé.',
    steps: [
      {
        title: 'Vous composez',
        body: "L'occasion, un mot, une photo. Puis vos lieux et vos créneaux : jusqu'à trois adresses et cinq horaires.",
      },
      {
        title: 'Vous envoyez un lien',
        body: 'Un lien unique, à glisser dans un message. Aucun compte à créer pour la personne qui le reçoit.',
      },
      {
        title: 'Elle ouvre, elle choisit',
        body: 'Une enveloppe scellée, une lettre, puis le choix du lieu et du créneau. Vous voyez le moment exact où elle a ouvert.',
      },
      {
        title: 'C’est dans vos agendas',
        body: 'Dès la réponse, vous recevez le récapitulatif par email, avec le fichier .ics prêt à ajouter. Elle aussi.',
      },
    ],
    ctaTitle1: 'Il y a quelqu’un à qui vous pensez',
    ctaTitle2: 'en lisant ça.',
    ctaBody: 'L’invitation se prépare en deux minutes. Le reste, c’est entre vous deux.',
  },

  occasions: {
    ariaLabel: 'Types d’occasion',
    prev: 'Occasion précédente',
    next: 'Occasion suivante',
    chooseAria: 'Choisir une occasion',
    slideAria: (i: number, total: number, label: string) => `${i} sur ${total}, ${label}`,
    slideLive: (label: string, i: number, total: number) => `${label}, diapositive ${i} sur ${total}`,
    labels: {
      cinema: 'Cinéma',
      restaurant: 'Restaurant',
      weekend: 'Weekend ou voyage',
      activity: 'Activité',
      surprise: 'Surprise (lieu caché)',
      birthday: 'Anniversaire',
      just_because: 'Juste comme ça',
    },
    headlines: {
      cinema: 'Une séance de cinéma',
      restaurant: 'Un dîner en tête-à-tête',
      weekend: 'Une escapade à deux',
      activity: 'Une activité ensemble',
      surprise: 'Une surprise',
      birthday: 'Un anniversaire à fêter',
      just_because: 'Juste comme ça',
    },
    pitches: {
      cinema: "Deux séances possibles, elle choisit l'horaire qui l'arrange.",
      restaurant: 'Trois tables repérées, un seul lien à envoyer.',
      weekend: 'Une escapade à deux, avec les dates que vous pouvez vraiment tenir.',
      activity: 'Escalade, expo, atelier poterie. Proposez, laissez trancher.',
      surprise: 'Le lieu reste caché jusqu’à ce que la réponse soit oui.',
      birthday: 'Un anniversaire qui commence par une belle enveloppe.',
      just_because: 'Aucune raison particulière. C’est souvent la meilleure.',
    },
  },

  benefits: {
    eyebrow: 'Pourquoi nous choisir',
    title1: 'Tout ce qu’un SMS',
    title2: 'ne sait pas faire',
    items: [
      {
        icon: '✉️',
        title: 'Un lien, rien de plus',
        body: 'Pas d’application à installer, pas de compte à créer pour la personne qui reçoit. Elle clique, elle découvre.',
      },
      {
        icon: '🎬',
        title: 'Sept types d’occasion',
        body: 'Cinéma, restaurant, weekend, activité, surprise, anniversaire. Ou juste comme ça, sans raison.',
      },
      {
        icon: '🗓️',
        title: 'Direct dans vos agendas',
        body: 'Dès la réponse, chacun reçoit un fichier .ics et un lien Google Calendar déjà rempli.',
      },
      {
        icon: '🔒',
        title: 'Votre agenda reste à vous',
        body: 'Aucune connexion Google, Outlook ou Apple. Nous ne lisons rien, nous n’ajoutons rien sans votre clic.',
      },
      {
        icon: '⏳',
        title: 'Des liens qui expirent',
        body: 'De 7 à 90 jours, à votre choix. Ensuite le contenu disparaît, définitivement.',
      },
      {
        icon: '💌',
        title: 'Une vraie mise en scène',
        body: 'Une enveloppe scellée, une lettre, une photo. L’effet n’a rien à voir avec un message texte.',
      },
    ],
  },

  faqHeading: {
    eyebrow: 'Questions fréquentes',
    title: 'Ce qu’on nous demande',
  },

  homeFaq: [
    {
      q: 'La personne qui reçoit doit-elle créer un compte ?',
      a: 'Non. Elle ouvre le lien, découvre l’invitation, choisit le lieu et le créneau. Aucun compte, aucun mot de passe, aucune application.',
    },
    {
      q: 'Vous connectez-vous à mon agenda ?',
      a: 'Jamais. Nous produisons un fichier .ics et un lien Google Calendar pré-rempli. Rien n’entre dans votre calendrier sans votre clic.',
    },
    {
      q: 'Est-ce un site de rencontre ?',
      a: 'Non. Nous ne mettons personne en relation. L’outil sert à inviter quelqu’un que vous connaissez déjà : un conjoint, un ami, une personne rencontrée ailleurs.',
    },
    {
      q: 'Combien de temps le lien reste-t-il valable ?',
      a: 'Entre 7 et 90 jours, vous choisissez à la création. Passé ce délai le contenu n’est plus consultable, puis il est supprimé de nos serveurs.',
    },
    {
      q: 'Et si la personne dit non ?',
      a: 'Le bouton « Non » se dérobe et finit par ne plus répondre. C’est une plaisanterie assumée. Un vrai refus se dit de vive voix, pas en cliquant.',
    },
  ] satisfies Faq[],

  blogTeaser: {
    eyebrow: 'Conseils et coulisses',
    title: 'À lire avant d’inviter',
    seeAll: 'Tous les articles',
    readMore: 'Lire',
  },

  pricingPage: {
    eyebrow: 'Tarifs',
    title1: 'Un prix qui suit',
    title2: 'votre rythme',
    intro:
      'La plupart des gens invitent quelques fois par an, et la formule gratuite leur suffira toujours. Les formules payantes s’adressent à ceux qui en envoient vraiment beaucoup.',
    note: 'Tous les montants s’entendent par mois, sans engagement. Le franc CFA étant en parité fixe avec l’euro, les deux prix affichés sont équivalents au centime près.',
    faq: [
      {
        q: 'Que se passe-t-il quand j’atteins ma limite ?',
        a: 'Les invitations déjà envoyées continuent de fonctionner normalement. Vous ne pouvez simplement plus en créer de nouvelle avant le mois suivant, ou avant de changer de formule.',
      },
      {
        q: 'Le compteur se remet à zéro quand ?',
        a: 'Le premier de chaque mois. Il compte les invitations créées, pas les réponses reçues : une invitation restée sans réponse compte quand même.',
      },
      {
        q: 'Pourquoi des prix en francs CFA ?',
        a: 'Le produit est né en Afrique de l’Ouest. Le franc CFA est en parité fixe avec l’euro, à 1 € = 655,957 XOF, donc les deux montants correspondent exactement et ne bougeront pas avec le marché.',
      },
      {
        q: 'Puis-je changer de formule ou arrêter ?',
        a: 'À tout moment, sans engagement de durée. En cas d’arrêt, vous repassez simplement sur la formule gratuite au terme du mois payé.',
      },
    ] satisfies Faq[],
  },

  pricingTable: {
    mostChosen: 'Le plus choisi',
    free: 'Gratuit',
    forever: 'pour toujours',
    perMonth: '/ mois',
    alsoPerMonth: (amount: string) => `soit ${amount} par mois`,
    invitationsPerMonth: (n: number) => `${n} invitations par mois`,
    startFree: 'Commencer gratuitement',
    choose: (name: string) => `Choisir ${name}`,
    plans: {
      free: {
        name: 'Gratuit',
        tagline: 'Pour tester, et pour les grandes occasions seulement.',
        features: [
          "Jusqu'à 5 invitations par mois",
          'Les 7 types d’occasion',
          'Les 3 thèmes visuels',
          'Fichier .ics et lien Google Calendar',
          'Contre-proposition de date',
        ],
      },
      premium: {
        name: 'Premium',
        tagline: 'Pour ceux qui invitent vraiment souvent.',
        features: [
          "Jusqu'à 10 invitations par mois",
          'Tout ce que contient la formule gratuite',
          'Durée de validité jusqu’à 90 jours',
          'Photo en pièce jointe des emails',
          'Réponse au support sous 24 h',
        ],
      },
      gold: {
        name: 'Premium Gold',
        tagline: 'Pour un usage intensif ou professionnel.',
        features: [
          "Jusqu'à 50 invitations par mois",
          'Tout ce que contient Premium',
          'Suppression de la mention de bas de page',
          'Statistiques d’ouverture détaillées',
          'Accès anticipé aux nouveautés',
        ],
      },
    },
  },

  blogListPage: {
    eyebrow: 'Blog',
    title1: 'Notes et',
    title2: 'coulisses',
    intro:
      'Comment proposer un rendez-vous sans y passer la semaine, et pourquoi nous avons tranché comme ça plutôt qu’autrement.',
    empty: 'Le premier article arrive bientôt.',
    readingMinutes: (n: number) => `${n} min de lecture`,
    readMore: 'Lire',
  },

  blogArticlePage: {
    draftBadge: 'Brouillon, non publié',
    articleBadge: 'Article',
    backToAll: '← Tous les articles',
    doneReadingTitle: 'Assez lu ?',
    doneReadingBody: 'L’invitation se prépare en deux minutes.',
    readingMinutes: (n: number) => `${n} min de lecture`,
  },

  contactPage: {
    eyebrow: 'Contact',
    title1: 'Dites-nous',
    title2: 'tout',
    intro: 'Une question, un bug, une idée d’amélioration. Nous lisons chaque message et répondons sous deux jours ouvrés.',
    writeUs: 'Écrivez-nous',
    hint: 'Les champs marqués d’une étoile sont nécessaires pour vous répondre.',
    messageLabel: 'Votre message',
    messagePlaceholder: 'Décrivez votre question ou ce que vous avez rencontré…',
    submit: 'Envoyer',
    faq: [
      {
        q: 'La personne qui reçoit doit-elle créer un compte ?',
        a: 'Non. Elle ouvre le lien, elle choisit, c’est tout. Aucun compte, aucun mot de passe, aucune application à installer.',
      },
      {
        q: 'Vous connectez-vous à mon agenda ?',
        a: 'Jamais. Nous générons un fichier .ics et un lien Google Calendar déjà rempli. Vous gardez la main : rien n’est ajouté sans votre clic.',
      },
      {
        q: 'Combien de temps le lien reste-t-il valable ?',
        a: 'Vous le choisissez à la création, entre 7 et 90 jours. Passé ce délai, le contenu n’est plus consultable, puis il est supprimé définitivement.',
      },
      {
        q: 'Puis-je modifier une invitation déjà envoyée ?',
        a: 'Pas encore. Pour l’instant, créez-en une nouvelle et renvoyez le lien. C’est en haut de la liste des améliorations prévues.',
      },
      {
        q: 'Sous quel délai répondez-vous ?',
        a: 'Deux jours ouvrés en général. Si votre message concerne une invitation déjà envoyée, précisez-le : ces demandes passent devant.',
      },
    ] satisfies Faq[],
  },

  partnersPage: {
    eyebrow: 'Devenir partenaire',
    title1: 'Soyez le lieu',
    title2: 'qu’on choisit',
    intro:
      'Nos utilisateurs ne cherchent pas « un restaurant ». Ils préparent une soirée précise, pour une personne précise, et hésitent entre deux ou trois adresses. C’est à ce moment-là que votre lieu a le plus de valeur.',
    whoForTitle: 'À qui ça s’adresse',
    profiles: [
      {
        title: 'Restaurants et bars',
        body: 'Votre table figure parmi les lieux suggérés, au moment précis où le choix se fait.',
      },
      {
        title: 'Cinémas, salles, musées',
        body: 'Vos séances et expositions deviennent des créneaux proposables en deux clics.',
      },
      {
        title: 'Activités et ateliers',
        body: 'Escalade, poterie, dégustation : les sorties à deux se décident souvent le matin même.',
      },
      {
        title: 'Hôtels et maisons d’hôtes',
        body: 'Le format weekend permet de proposer des dates réelles, sans va-et-vient de messages.',
      },
    ],
    howTitle: 'Comment ça se passe',
    steps: [
      'Vous nous écrivez avec le formulaire ci-contre.',
      'Nous échangeons pour comprendre votre lieu et vos disponibilités.',
      'Nous cadrons ensemble le format de présence et les conditions.',
      'Vous apparaissez auprès des personnes qui organisent un rendez-vous près de chez vous.',
    ],
    programNote:
      'Le programme partenaire se construit en ce moment. Les modalités précises (visibilité, tarifs, engagement) se définissent avec les premiers inscrits.',
    letsTalkTitle: 'Parlons-en',
    letsTalkIntro: 'Décrivez votre lieu en quelques lignes. Nous revenons vers vous sous deux jours ouvrés.',
    messageLabel: 'Votre lieu en quelques lignes',
    messagePlaceholder: 'Où vous situez-vous, quel type d’expérience proposez-vous, et qu’attendez-vous d’un partenariat ?',
    submit: 'Envoyer ma demande',
  },

  aboutPage: {
    eyebrow: 'À propos',
    title: '« On se voit',
    accent: 'quand ? »',
    intro:
      'Cette phrase a tué plus de rendez-vous que tous les emplois du temps réunis. Elle demande à l’autre de faire tout le travail : trouver un jour, un lieu, une heure, et deviner ce qui vous ferait plaisir.',
    paragraphs: [
      'L’idée de départ tient en une inversion : proposez, au lieu de demander. Deux ou trois lieux que vous avez choisis, quelques créneaux qui vous vont. L’autre n’a plus qu’à retenir ce qui l’arrange. Un geste, pas une négociation.',
      'Restait la forme. Un message texte fait le travail, mais il ne raconte rien. Alors l’invitation s’ouvre comme une lettre : une enveloppe scellée, un mot, une photo si vous en avez une. Le fond est pratique ; la forme, elle, doit donner envie de dire oui.',
      'Et puisqu’il faut bien qu’un rendez-vous finisse quelque part : dès la réponse, chacun reçoit le récapitulatif et le fichier à glisser dans son agenda. Sans avoir donné le moindre accès à son calendrier.',
    ],
    principlesTitle: 'Ce à quoi nous tenons',
    principles: [
      {
        title: 'Le destinataire ne s’inscrit jamais',
        body: 'Demander un compte à quelqu’un pour lui proposer un dîner, c’est déjà avoir perdu. Un lien, une page, un choix. Rien d’autre.',
      },
      {
        title: 'Nous ne touchons pas à votre agenda',
        body: 'Aucune connexion Google, Outlook ou Apple. Nous produisons un fichier .ics et un lien pré-rempli. Vous décidez de ce qui entre dans votre calendrier.',
      },
      {
        title: 'Les liens expirent',
        body: 'Une invitation n’a pas vocation à rester en ligne indéfiniment. Vous fixez sa durée de vie ; ensuite elle disparaît, pour de bon.',
      },
      {
        title: 'Le strict nécessaire',
        body: 'Nous stockons ce qu’il faut pour que l’invitation fonctionne. Pas de traceur, pas de revente, pas de profilage.',
      },
    ],
    dataTitle: 'Et vos données ?',
    dataBodyBefore: 'Tout est détaillé, sans jargon, dans notre',
    dataLinkLabel: 'politique de confidentialité',
    dataBodyAfter:
      '. En résumé : votre email pour vous connecter et vous prévenir, le contenu de vos invitations pour les afficher, et rien de plus longtemps que nécessaire.',
  },

  inquiryForm: {
    nameLabel: 'Votre nom',
    emailLabel: 'Votre email',
    companyLabel: 'Votre structure',
    companyHint: 'Restaurant, salle, agence…',
    sending: 'Envoi…',
    sentTitle: 'Message reçu',
    sentBody: (firstName: string, email: string) => `Merci ${firstName}. Nous revenons vers vous à l’adresse ${email}.`,
    genericError: "L'envoi a échoué.",
    privacyNote: 'Vos coordonnées servent uniquement à répondre à cette demande. Elles ne sont ni revendues, ni utilisées pour de la prospection.',
    robotTrapLabel: 'Ne pas remplir',
  },

  legalCommon: {
    toc: 'Sommaire',
  },

  privacyPage: {
    eyebrow: 'Confidentialité',
    title: 'Politique de',
    accent: 'confidentialité',
    intro: (days: number) =>
      `Le principe est simple : le strict nécessaire pour que l'invitation fonctionne, rien de plus, et pas plus longtemps que nécessaire. Durée de conservation par défaut d'un lien : ${days} jours.`,
    sections: [
      {
        id: 'qui-traite',
        title: 'Qui traite vos données',
        paragraphs: [
          "Le service est édité par l'éditeur de cette application, responsable du traitement au sens du RGPD. Pour toute question ou demande, écrivez à l'adresse de contact indiquée en bas de page.",
        ],
        note: "Contact : renseignez ici l'adresse email du responsable de traitement avant mise en production, ainsi que la raison sociale et l'adresse de l'éditeur.",
      },
      {
        id: 'donnees-collectees',
        title: 'Ce que nous collectons',
        paragraphs: [
          "Créateur : votre adresse email (connexion et notifications), et le contenu des invitations que vous composez : prénom du destinataire, type d'occasion, message, photo éventuelle, lieux et créneaux proposés, thème choisi.",
          "Destinataire : aucun compte, aucun profil. Nous enregistrons uniquement le lieu et le créneau retenus, le mot facultatif laissé, l'adresse email si elle est volontairement renseignée pour recevoir la confirmation, et l'horodatage de l'ouverture du lien.",
        ],
      },
      {
        id: 'pourquoi',
        title: 'Pourquoi',
        paragraphs: [
          "Fournir le service : afficher l'invitation, enregistrer la réponse, générer le fichier .ics et envoyer les emails de confirmation. Aucune donnée n'est utilisée à des fins publicitaires, n'est vendue, ni cédée à des tiers à des fins commerciales.",
        ],
      },
      {
        id: 'duree',
        title: 'Combien de temps',
        paragraphs: [
          "Chaque invitation porte une date d'expiration choisie à sa création. Passé ce délai, son contenu n'est plus consultable via le lien.",
          "Les invitations expirées sont ensuite purgées définitivement de la base, avec leurs lieux, créneaux et réponses. Vous pouvez à tout moment demander la suppression immédiate de votre compte et de l'ensemble de vos invitations.",
        ],
      },
      {
        id: 'hebergement',
        title: 'Qui héberge',
        paragraphs: [
          "Base de données, authentification et stockage des photos : Supabase. Hébergement de l'application : Vercel. Envoi des emails transactionnels : Resend. Protection anti-robot des formulaires : Cloudflare. Ces prestataires agissent comme sous-traitants et n'utilisent pas vos données pour leur propre compte.",
          "Aucune connexion à Google Calendar, Outlook ou Apple Calendar n'est établie : les rendez-vous sont transmis sous forme de fichier .ics et de lien pré-rempli, sans accès à votre agenda.",
        ],
      },
      {
        id: 'vos-droits',
        title: 'Vos droits',
        paragraphs: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données. Ces droits s'exercent sur simple demande à l'adresse de contact. Vous pouvez également introduire une réclamation auprès de la CNIL.",
        ],
      },
      {
        id: 'anti-robot',
        title: 'Protection anti-robot',
        paragraphs: [
          "Les formulaires Contact et Devenir partenaire sont protégés par Cloudflare Turnstile. Ce service vérifie que la soumission provient d'une personne et non d'un script automatisé.",
          "Turnstile a été retenu précisément parce qu'il ne profile pas les visiteurs : il n'exploite pas votre historique de navigation, ne dépose pas de cookie publicitaire et ne sert à aucun ciblage. Cloudflare traite l'adresse IP et des signaux techniques du navigateur le temps de la vérification, en qualité de sous-traitant.",
          "Le widget n'est chargé que sur les deux pages comportant un formulaire. Le reste du site, y compris les pages d'invitation, n'appelle aucun script Cloudflare.",
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies',
        paragraphs: [
          "Seuls des cookies strictement nécessaires sont déposés : ils maintiennent la session de connexion du créateur, et Cloudflare Turnstile en pose un le temps de valider un envoi de formulaire. Aucun cookie publicitaire, aucun traceur comportemental, aucune mesure d'audience.",
        ],
      },
    ],
  },

  mentionsPage: {
    eyebrow: 'Informations légales',
    title: 'Mentions',
    accent: 'légales',
    intro: 'Qui édite ce service, qui l’héberge, et comment nous contacter.',
    sections: [
      {
        id: 'editeur',
        title: 'Éditeur',
        paragraphs: [
          "Le service « Keerelle » est édité par Otyche. Raison sociale, forme juridique, adresse du siège et numéro d'immatriculation à renseigner ici avant mise en production.",
        ],
      },
      {
        id: 'directeur-publication',
        title: 'Directeur de publication',
        paragraphs: ["Nom et contact du directeur de publication à renseigner ici avant mise en production."],
      },
      {
        id: 'hebergement',
        title: 'Hébergement',
        paragraphs: [
          "L'application est hébergée par Vercel Inc. Base de données et authentification hébergées par Supabase.",
        ],
      },
      {
        id: 'contact',
        title: 'Contact',
        paragraphs: ["Pour toute question relative à ce site, une adresse de contact est à renseigner ici avant mise en production."],
        note: 'En attendant, écrivez-nous depuis la page Contact du site : votre message nous parvient directement.',
      },
    ],
  },

  conditionsPage: {
    eyebrow: "Cadre d'utilisation",
    title: 'Conditions',
    accent: 'générales',
    intro: 'Les règles qui encadrent l’utilisation du service, en clair.',
    sections: [
      {
        id: 'objet',
        title: 'Objet',
        paragraphs: [
          "Les présentes conditions régissent l'utilisation du service « Keerelle », qui permet à un créateur de composer une invitation personnalisée et d'obtenir un lien à transmettre à un destinataire.",
        ],
        note: 'En créant un compte ou en utilisant le service, vous acceptez les termes de ces conditions générales.',
      },
      {
        id: 'compte-createur',
        title: 'Compte créateur',
        paragraphs: [
          "La création d'une invitation nécessite une connexion par lien magique envoyé à votre adresse email. Aucun mot de passe n'est stocké.",
        ],
      },
      {
        id: 'formules-quotas',
        title: 'Formules et quotas',
        paragraphs: [
          "Le service propose des formules gratuites et payantes détaillées sur la page /tarifs, chacune avec un quota mensuel d'invitations. Le changement de formule est aujourd'hui géré manuellement ; l'intégration d'un paiement en ligne n'est pas encore active.",
        ],
      },
      {
        id: 'contenu-invitations',
        title: 'Contenu des invitations',
        paragraphs: [
          "Vous êtes seul responsable du contenu que vous publiez (message, photo, lieux, créneaux). Il doit rester licite et ne porter atteinte à aucun tiers — voir les règles de la communauté.",
        ],
      },
      {
        id: 'disponibilite-resiliation',
        title: 'Disponibilité et résiliation',
        paragraphs: [
          "Le service est fourni en l'état, sans garantie de disponibilité continue. Vous pouvez demander la suppression de votre compte et de vos invitations à tout moment.",
        ],
      },
      {
        id: 'droit-applicable',
        title: 'Droit applicable',
        paragraphs: ["Droit applicable et juridiction compétente à renseigner ici avant mise en production."],
      },
    ],
  },

  communityPage: {
    eyebrow: 'Bon usage',
    title: 'Règles de la',
    accent: 'communauté',
    intro: 'Un rendez-vous se propose avec respect. Voici le cadre.',
    sections: [
      {
        id: 'le-principe',
        title: 'Le principe',
        paragraphs: [
          "Une invitation s'adresse à une personne que vous connaissez, pour lui proposer un rendez-vous réel. Ce n'est ni un canal de démarchage, ni un espace de diffusion publique.",
        ],
      },
      {
        id: 'contenu-interdit',
        title: 'Contenu interdit',
        paragraphs: [
          "Sont interdits : le harcèlement, les menaces, les contenus à caractère haineux, discriminatoire ou sexuel non sollicité, l'usurpation d'identité, et l'envoi d'invitations à des personnes qui n'ont pas consenti à être contactées de cette façon.",
        ],
      },
      {
        id: 'photos-messages',
        title: 'Photos et messages',
        paragraphs: [
          "La photo et le message d'une invitation doivent rester licites et respectueux du destinataire. Le service se réserve le droit de suspendre un compte à l'origine d'un contenu contraire à ces règles.",
        ],
      },
      {
        id: 'signalement',
        title: 'Signalement',
        paragraphs: ["Un destinataire qui reçoit une invitation abusive peut le signaler via la page /contact."],
        note: 'Adresse dédiée au signalement à préciser ici avant mise en production.',
      },
      {
        id: 'sanctions',
        title: 'Sanctions',
        paragraphs: [
          "Selon la gravité, une violation de ces règles peut entraîner un avertissement, la suspension ou la suppression définitive du compte créateur concerné.",
        ],
      },
    ],
  },
};

const en: typeof fr = {
  nav: {
    home: 'Home',
    pricing: 'Pricing',
    partners: 'Become a partner',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    cta: 'Create my date',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNavLabel: 'Main navigation',
    mobileNavLabel: 'Mobile navigation',
    homeAria: 'Home',
  },

  footer: {
    tagline: 'Propose a date with a single link. They choose, and it lands straight in both your calendars.',
    siteHeading: 'Site',
    accountHeading: 'Your account',
    login: 'Log in',
    myInvitations: 'My invitations',
    confidentiality: 'Privacy',
    legalNavLabel: 'Legal',
    privacy: 'Privacy policy',
    community: 'Community guidelines',
    terms: 'Terms of service',
    legal: 'Legal notice',
  },

  home: {
    badge: 'For invitations that deserve better than a text message',
    heroTitle1: 'Propose a date,',
    heroTitle2: 'beautifully.',
    heroBody:
      'An animated invitation, sent as a single link. They open it like a letter, pick the place and time that suit them, and it lands straight in both your calendars.',
    ctaHow: 'How it works',
    proof: [
      { label: 'Account required on their side', value: 'None' },
      { label: 'Access to your calendar', value: 'Never' },
      { label: 'How long a link stays valid', value: '7–90 days' },
    ],
    stepsEyebrow: 'How it works',
    stepsTitle: 'Four steps, two minutes',
    stepsBody: 'About as long as it takes to pick two restaurants and three time slots.',
    steps: [
      {
        title: 'You compose it',
        body: 'The occasion, a note, a photo. Then your places and time slots: up to three addresses and five times.',
      },
      {
        title: 'You send a link',
        body: 'One unique link, ready to drop into a message. No account needed for the person receiving it.',
      },
      {
        title: 'They open it, they choose',
        body: 'A sealed envelope, a letter, then the choice of place and time. You see the exact moment they opened it.',
      },
      {
        title: 'It’s on both calendars',
        body: 'As soon as they answer, you get the recap by email with a ready-to-add .ics file. So do they.',
      },
    ],
    ctaTitle1: 'There’s someone you’re thinking of',
    ctaTitle2: 'while reading this.',
    ctaBody: 'The invitation takes two minutes to put together. The rest is between the two of you.',
  },

  occasions: {
    ariaLabel: 'Occasion types',
    prev: 'Previous occasion',
    next: 'Next occasion',
    chooseAria: 'Choose an occasion',
    slideAria: (i: number, total: number, label: string) => `${i} of ${total}, ${label}`,
    slideLive: (label: string, i: number, total: number) => `${label}, slide ${i} of ${total}`,
    labels: {
      cinema: 'Cinema',
      restaurant: 'Restaurant',
      weekend: 'Weekend or trip',
      activity: 'Activity',
      surprise: 'Surprise (hidden venue)',
      birthday: 'Birthday',
      just_because: 'Just because',
    },
    headlines: {
      cinema: 'A movie showing',
      restaurant: 'A dinner for two',
      weekend: 'A getaway for two',
      activity: 'An activity together',
      surprise: 'A surprise',
      birthday: 'A birthday to celebrate',
      just_because: 'Just because',
    },
    pitches: {
      cinema: 'Two showings to choose from — they pick the time that suits them.',
      restaurant: 'Three tables scouted, one link to send.',
      weekend: 'A getaway for two, with dates you can actually keep.',
      activity: 'Climbing, an exhibit, a pottery class. Propose it, let them decide.',
      surprise: 'The venue stays hidden until the answer is yes.',
      birthday: 'A birthday that starts with a beautiful envelope.',
      just_because: 'No particular reason. Often the best kind.',
    },
  },

  benefits: {
    eyebrow: 'Why choose us',
    title1: 'Everything a text message',
    title2: 'can’t do',
    items: [
      {
        icon: '✉️',
        title: 'Just a link, nothing else',
        body: 'No app to install, no account for the person receiving it to create. They click, they discover.',
      },
      {
        icon: '🎬',
        title: 'Seven kinds of occasion',
        body: 'Cinema, restaurant, weekend, activity, surprise, birthday. Or just because, no reason at all.',
      },
      {
        icon: '🗓️',
        title: 'Straight into both calendars',
        body: 'As soon as they reply, each of you gets an .ics file and a ready-filled Google Calendar link.',
      },
      {
        icon: '🔒',
        title: 'Your calendar stays yours',
        body: 'No connection to Google, Outlook or Apple. We read nothing, we add nothing without your click.',
      },
      {
        icon: '⏳',
        title: 'Links that expire',
        body: 'From 7 to 90 days, your choice. After that, the content disappears — for good.',
      },
      {
        icon: '💌',
        title: 'A real bit of staging',
        body: 'A sealed envelope, a letter, a photo. Nothing like a plain text message.',
      },
    ],
  },

  faqHeading: {
    eyebrow: 'Frequently asked',
    title: 'What people ask us',
  },

  homeFaq: [
    {
      q: 'Does the person receiving it need to create an account?',
      a: 'No. They open the link, discover the invitation, choose the place and time. No account, no password, no app.',
    },
    {
      q: 'Do you connect to my calendar?',
      a: 'Never. We produce an .ics file and a pre-filled Google Calendar link. Nothing enters your calendar without your click.',
    },
    {
      q: 'Is this a dating site?',
      a: 'No. We don’t introduce anyone to anyone. The tool is for inviting someone you already know: a partner, a friend, someone you met elsewhere.',
    },
    {
      q: 'How long does the link stay valid?',
      a: 'Between 7 and 90 days, your choice at creation. After that the content is no longer viewable, then it’s deleted from our servers.',
    },
    {
      q: 'What if they say no?',
      a: 'The “No” button dodges away and eventually stops responding. It’s a deliberate joke. A real refusal is said out loud, not clicked.',
    },
  ] satisfies Faq[],

  blogTeaser: {
    eyebrow: 'Tips and behind the scenes',
    title: 'Worth reading before you invite',
    seeAll: 'All articles',
    readMore: 'Read',
  },

  pricingPage: {
    eyebrow: 'Pricing',
    title1: 'A price that fits',
    title2: 'your pace',
    intro:
      'Most people send a handful of invitations a year, and the free plan will always cover that. The paid plans are for people who send a lot, for real.',
    note: 'All amounts are per month, no commitment. The CFA franc is pegged to the euro, so both prices shown are equivalent to the cent.',
    faq: [
      {
        q: 'What happens once I hit my limit?',
        a: 'Invitations already sent keep working normally. You simply can’t create a new one until next month, or until you switch plans.',
      },
      {
        q: 'When does the counter reset?',
        a: 'On the first of each month. It counts invitations created, not answers received — an invitation with no reply still counts.',
      },
      {
        q: 'Why prices in CFA francs?',
        a: 'The product was born in West Africa. The CFA franc is pegged to the euro at a fixed rate of €1 = 655.957 XOF, so both amounts match exactly and won’t move with the market.',
      },
      {
        q: 'Can I change plans or cancel?',
        a: 'Any time, no minimum commitment. If you cancel, you simply drop back to the free plan once the paid month ends.',
      },
    ] satisfies Faq[],
  },

  pricingTable: {
    mostChosen: 'Most popular',
    free: 'Free',
    forever: 'forever',
    perMonth: '/ month',
    alsoPerMonth: (amount: string) => `that’s ${amount} per month`,
    invitationsPerMonth: (n: number) => `${n} invitations per month`,
    startFree: 'Start for free',
    choose: (name: string) => `Choose ${name}`,
    plans: {
      free: {
        name: 'Free',
        tagline: 'To try it out, and for big occasions only.',
        features: [
          'Up to 5 invitations per month',
          'All 7 occasion types',
          'All 3 visual themes',
          '.ics file and Google Calendar link',
          'Date counter-proposal',
        ],
      },
      premium: {
        name: 'Premium',
        tagline: 'For people who invite really often.',
        features: [
          'Up to 10 invitations per month',
          'Everything in the free plan',
          'Link validity up to 90 days',
          'Photo attached to emails',
          'Support replies within 24 h',
        ],
      },
      gold: {
        name: 'Premium Gold',
        tagline: 'For heavy or professional use.',
        features: [
          'Up to 50 invitations per month',
          'Everything in Premium',
          'Group invitations, with a waitlist',
          'Footer mention removed',
          'Detailed open-rate statistics',
          'Early access to new features',
        ],
      },
    },
  },

  blogListPage: {
    eyebrow: 'Blog',
    title1: 'Notes and',
    title2: 'behind the scenes',
    intro: 'How to propose a date without spending a week on it, and why we made the calls we made.',
    empty: 'The first article is coming soon.',
    readingMinutes: (n: number) => `${n} min read`,
    readMore: 'Read',
  },

  blogArticlePage: {
    draftBadge: 'Draft, unpublished',
    articleBadge: 'Article',
    backToAll: '← All articles',
    doneReadingTitle: 'Read enough?',
    doneReadingBody: 'The invitation takes two minutes to put together.',
    readingMinutes: (n: number) => `${n} min read`,
  },

  contactPage: {
    eyebrow: 'Contact',
    title1: 'Tell us',
    title2: 'everything',
    intro: 'A question, a bug, an idea for improvement. We read every message and reply within two business days.',
    writeUs: 'Write to us',
    hint: 'Fields marked with a star are needed for us to reply.',
    messageLabel: 'Your message',
    messagePlaceholder: 'Describe your question or what you ran into…',
    submit: 'Send',
    faq: [
      {
        q: 'Does the person receiving it need to create an account?',
        a: 'No. They open the link, they choose, that’s it. No account, no password, no app to install.',
      },
      {
        q: 'Do you connect to my calendar?',
        a: 'Never. We generate an .ics file and a pre-filled Google Calendar link. You stay in control: nothing is added without your click.',
      },
      {
        q: 'How long does the link stay valid?',
        a: 'You choose at creation, between 7 and 90 days. After that the content is no longer viewable, then it’s permanently deleted.',
      },
      {
        q: 'Can I edit an invitation I already sent?',
        a: 'Not yet. For now, create a new one and resend the link. It’s at the top of our planned improvements.',
      },
      {
        q: 'How quickly do you reply?',
        a: 'Usually within two business days. If your message is about an invitation you already sent, say so — those go first.',
      },
    ] satisfies Faq[],
  },

  partnersPage: {
    eyebrow: 'Become a partner',
    title1: 'Be the place',
    title2: 'people choose',
    intro:
      'Our users aren’t looking for “a restaurant”. They’re planning a specific evening, for a specific person, weighing two or three addresses. That’s the moment your venue matters most.',
    whoForTitle: 'Who this is for',
    profiles: [
      {
        title: 'Restaurants and bars',
        body: 'Your table shows up among the suggested venues, right at the moment the choice is made.',
      },
      {
        title: 'Cinemas, venues, museums',
        body: 'Your screenings and exhibits become bookable time slots in two clicks.',
      },
      {
        title: 'Activities and workshops',
        body: 'Climbing, pottery, tastings: outings for two are often decided that same morning.',
      },
      {
        title: 'Hotels and guesthouses',
        body: 'The weekend format lets people propose real dates, without endless back-and-forth messages.',
      },
    ],
    howTitle: 'How it works',
    steps: [
      'You write to us using the form alongside.',
      'We talk to understand your venue and your availability.',
      'We work out together the format of your presence and the terms.',
      'You appear to people planning a date near you.',
    ],
    programNote:
      'The partner program is being built right now. Exact terms (visibility, pricing, commitment) are shaped together with the first partners who sign up.',
    letsTalkTitle: 'Let’s talk',
    letsTalkIntro: 'Describe your venue in a few lines. We’ll get back to you within two business days.',
    messageLabel: 'Your venue, in a few lines',
    messagePlaceholder: 'Where are you, what kind of experience do you offer, and what are you hoping for from a partnership?',
    submit: 'Send my request',
  },

  aboutPage: {
    eyebrow: 'About',
    title: '“So, when are',
    accent: 'we meeting?”',
    intro:
      'That question has killed more dates than every busy schedule combined. It leaves the other person to do all the work: pick a day, a place, a time, and guess what would make you happy.',
    paragraphs: [
      'The starting idea is a simple inversion: propose, instead of asking. Two or three places you’ve picked, a few time slots that work for you. The other person just has to keep whichever suits them. A gesture, not a negotiation.',
      'Then came the form. A text message gets the job done, but it doesn’t say anything. So the invitation opens like a letter instead: a sealed envelope, a note, a photo if you have one. The substance is practical; the form is meant to make someone want to say yes.',
      'And since a date has to end up somewhere: as soon as they answer, each of you gets the recap and a file to drop into your calendar. Without ever giving access to it.',
    ],
    principlesTitle: 'What we care about',
    principles: [
      {
        title: 'The recipient never signs up',
        body: 'Asking someone to create an account just to invite them to dinner is already a lost cause. A link, a page, a choice. Nothing else.',
      },
      {
        title: 'We don’t touch your calendar',
        body: 'No connection to Google, Outlook or Apple. We produce an .ics file and a pre-filled link. You decide what goes into your calendar.',
      },
      {
        title: 'Links expire',
        body: 'An invitation isn’t meant to stay online forever. You set its lifespan; after that it disappears, for good.',
      },
      {
        title: 'Only the strict minimum',
        body: 'We store what’s needed for the invitation to work. No tracker, no reselling, no profiling.',
      },
    ],
    dataTitle: 'What about your data?',
    dataBodyBefore: 'It’s all spelled out, jargon-free, in our',
    dataLinkLabel: 'privacy policy',
    dataBodyAfter:
      '. In short: your email to sign you in and notify you, the content of your invitations to display them, and nothing kept longer than necessary.',
  },

  inquiryForm: {
    nameLabel: 'Your name',
    emailLabel: 'Your email',
    companyLabel: 'Your venue or business',
    companyHint: 'Restaurant, venue, agency…',
    sending: 'Sending…',
    sentTitle: 'Message received',
    sentBody: (firstName: string, email: string) => `Thanks ${firstName}. We’ll get back to you at ${email}.`,
    genericError: 'Sending failed.',
    privacyNote: 'Your details are only used to reply to this request. They are never resold or used for outreach.',
    robotTrapLabel: 'Leave blank',
  },

  legalCommon: {
    toc: 'Contents',
  },

  privacyPage: {
    eyebrow: 'Privacy',
    title: 'Privacy',
    accent: 'policy',
    intro: (days: number) =>
      `The principle is simple: the strict minimum for the invitation to work, nothing more, and never kept longer than necessary. Default link retention: ${days} days.`,
    sections: [
      {
        id: 'qui-traite',
        title: 'Who processes your data',
        paragraphs: [
          'The service is published by this application’s publisher, the data controller within the meaning of the GDPR. For any question or request, write to the contact address shown at the bottom of the page.',
        ],
        note: 'Contact: fill in the data controller’s email address here before going to production, along with the publisher’s legal name and address.',
      },
      {
        id: 'donnees-collectees',
        title: 'What we collect',
        paragraphs: [
          'Creator: your email address (login and notifications), and the content of the invitations you compose — the recipient’s first name, occasion type, message, optional photo, proposed places and time slots, chosen theme.',
          'Recipient: no account, no profile. We only record the chosen place and time, the optional note left, the email address if voluntarily provided to receive confirmation, and the timestamp the link was opened.',
        ],
      },
      {
        id: 'pourquoi',
        title: 'Why',
        paragraphs: [
          'To provide the service: display the invitation, record the reply, generate the .ics file and send confirmation emails. No data is used for advertising, sold, or shared with third parties for commercial purposes.',
        ],
      },
      {
        id: 'duree',
        title: 'How long',
        paragraphs: [
          'Each invitation carries an expiry date chosen at creation. Past that date, its content is no longer accessible via the link.',
          'Expired invitations are then permanently purged from the database, along with their places, time slots and replies. You can request the immediate deletion of your account and all your invitations at any time.',
        ],
      },
      {
        id: 'hebergement',
        title: 'Who hosts it',
        paragraphs: [
          'Database, authentication and photo storage: Supabase. Application hosting: Vercel. Transactional emails: Resend. Anti-bot protection for forms: Cloudflare. These providers act as processors and do not use your data for their own purposes.',
          'No connection is made to Google Calendar, Outlook or Apple Calendar: dates are handed over as an .ics file and a pre-filled link, with no access to your calendar.',
        ],
      },
      {
        id: 'vos-droits',
        title: 'Your rights',
        paragraphs: [
          'You have the right to access, rectify, erase, restrict, object to, and port your data. These rights can be exercised by simply contacting us at the address above. You may also lodge a complaint with your local data protection authority.',
        ],
      },
      {
        id: 'anti-robot',
        title: 'Anti-bot protection',
        paragraphs: [
          'The Contact and Become-a-partner forms are protected by Cloudflare Turnstile. This service checks that a submission comes from a person rather than an automated script.',
          'Turnstile was chosen specifically because it doesn’t profile visitors: it doesn’t use your browsing history, doesn’t set an advertising cookie, and isn’t used for any targeting. Cloudflare processes the IP address and some technical browser signals for the duration of the check, acting as a processor.',
          'The widget only loads on the two pages that have a form. The rest of the site, including invitation pages, never calls any Cloudflare script.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies',
        paragraphs: [
          'Only strictly necessary cookies are set: they keep the creator’s login session, and Cloudflare Turnstile sets one while validating a form submission. No advertising cookie, no behavioural tracker, no audience measurement.',
        ],
      },
    ],
  },

  mentionsPage: {
    eyebrow: 'Legal information',
    title: 'Legal',
    accent: 'notice',
    intro: 'Who publishes this service, who hosts it, and how to reach us.',
    sections: [
      {
        id: 'editeur',
        title: 'Publisher',
        paragraphs: [
          'The “Keerelle” service is published by Otyche. Legal name, company form, registered address and registration number to be filled in here before going to production.',
        ],
      },
      {
        id: 'directeur-publication',
        title: 'Publication director',
        paragraphs: ['Name and contact details of the publication director to be filled in here before going to production.'],
      },
      {
        id: 'hebergement',
        title: 'Hosting',
        paragraphs: ['The application is hosted by Vercel Inc. Database and authentication are hosted by Supabase.'],
      },
      {
        id: 'contact',
        title: 'Contact',
        paragraphs: ['For any question about this site, a contact address is to be filled in here before going to production.'],
        note: 'In the meantime, reach us through the site’s Contact page: your message comes straight to us.',
      },
    ],
  },

  conditionsPage: {
    eyebrow: 'Terms of use',
    title: 'Terms of',
    accent: 'service',
    intro: 'The rules that govern the use of the service, in plain language.',
    sections: [
      {
        id: 'objet',
        title: 'Purpose',
        paragraphs: [
          'These terms govern the use of the “Keerelle” service, which lets a creator compose a personalised invitation and obtain a link to send to a recipient.',
        ],
        note: 'By creating an account or using the service, you accept the terms of this agreement.',
      },
      {
        id: 'compte-createur',
        title: 'Creator account',
        paragraphs: ['Creating an invitation requires signing in via a magic link sent to your email address. No password is ever stored.'],
      },
      {
        id: 'formules-quotas',
        title: 'Plans and quotas',
        paragraphs: [
          'The service offers free and paid plans detailed on the /pricing page, each with a monthly invitation quota. Plan changes are currently handled manually; online payment isn’t active yet.',
        ],
      },
      {
        id: 'contenu-invitations',
        title: 'Invitation content',
        paragraphs: [
          'You are solely responsible for the content you publish (message, photo, places, time slots). It must remain lawful and must not infringe on any third party — see the community guidelines.',
        ],
      },
      {
        id: 'disponibilite-resiliation',
        title: 'Availability and termination',
        paragraphs: [
          'The service is provided as-is, with no guarantee of continuous availability. You may request deletion of your account and your invitations at any time.',
        ],
      },
      {
        id: 'droit-applicable',
        title: 'Governing law',
        paragraphs: ['Governing law and competent jurisdiction to be filled in here before going to production.'],
      },
    ],
  },

  communityPage: {
    eyebrow: 'Fair use',
    title: 'Community',
    accent: 'guidelines',
    intro: 'A date should be proposed with respect. Here’s the framework.',
    sections: [
      {
        id: 'le-principe',
        title: 'The principle',
        paragraphs: [
          'An invitation is meant for someone you know, to propose a real date. It is neither a marketing channel nor a public broadcast space.',
        ],
      },
      {
        id: 'contenu-interdit',
        title: 'Prohibited content',
        paragraphs: [
          'Prohibited: harassment, threats, hateful, discriminatory or unsolicited sexual content, impersonation, and sending invitations to people who haven’t consented to being contacted this way.',
        ],
      },
      {
        id: 'photos-messages',
        title: 'Photos and messages',
        paragraphs: [
          'The photo and message of an invitation must remain lawful and respectful of the recipient. The service reserves the right to suspend an account behind content that violates these rules.',
        ],
      },
      {
        id: 'signalement',
        title: 'Reporting',
        paragraphs: ['A recipient who gets an abusive invitation can report it via the /contact page.'],
        note: 'A dedicated reporting address is to be specified here before going to production.',
      },
      {
        id: 'sanctions',
        title: 'Sanctions',
        paragraphs: [
          'Depending on severity, a violation of these rules can lead to a warning, suspension, or permanent deletion of the creator account involved.',
        ],
      },
    ],
  },
};

export const dictionaries = { fr, en };
export type Dictionary = typeof fr;
