export const DATA = {
  // --- ÉVÉNEMENTS À VENIR ---
  upcomingEvents: [
    {
      id: "new-year",
      categorie: "clubbing",
      title: "NEW YEAR ALL IN 2026",
      date: "31 Décembre 2025",
      dateDetail: "31 déc. 2025, 22h00 – 1er janv. 2026, 05h00",
      location: "Salle St-Germain, Éghezée",
      locationDetail: "72 Rue du Libut, 5310 Éghezée, Belgique",
      description: "La seule soirée dont tu as besoin.",
      heroImage: "/fonts/event-image/achanger.png",
      image: "/fonts/event-image/achanger.png",
      tag: "Sold Out Imminent",
      targetDateForCountdown: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).getTime(),

      // Billetterie
      ticketUrl: "https://widget.weezevent.com/ticket/E2129673/?code=45420&locale=fr-FR&width_auto=1&color_primary=0032FA",
      weezeventId: "2129673",
      ticketCTA: "Réserver ma place",
      ticketPrices: [
        { label: "Prévente", price: "30€" },
        { label: "Sur place", price: "35€" },
      ],

      // Programme
      program: [
        {
          day: "Soirée du 31 Décembre",
          items: [
            { time: "22h00", title: "Ouverture des portes", description: "Accueil, bracelets en tissu & goodies" },
            { time: "00h00", title: "🥂 Champagne à minuit", description: "Champagne offert pour fêter la nouvelle année !" },
            { time: "00h00 – 05h00", title: "🎧 DJ Sets & Shows", description: "Surprises, cadeaux & ambiance de folie toute la nuit" },
          ]
        }
      ],

      // Boissons
      boissons: "Eristoff Rouge & Blanche, Capt'ain Morgan, Amaretto, Pisang, Get 27, Bière, Redbull, Softs & Champagne",
      boissonsLabel: "🔥 Boissons à volonté – ALL IN 🔥",

      // Détails pratiques
      details: [
        { label: "📅 Date", value: "31 Décembre 2025, 22h → 05h" },
        { label: "📍 Lieu", value: "72 Rue du Libut, 5310 Éghezée" },
        { label: "👴 Âge minimum", value: "15 ans révolus" },
        { label: "👔 Dress code", value: "Mettez-vous sur votre 31 ! (pas de sportswear)" },
        { label: "🚗 Accès", value: "E411 sortie 12 «Éghezée» – 5 min Namur, 10 min Jodoigne & Wavre" },
        { label: "💫 VIP", value: "Salons & tables hautes – MP : The New Year Namur" },
      ],

      // DJ / Artistes
      lineup: [
        { name: "DJ Momo", role: "Coin 80's-90's" },
        { name: "TBA", role: "Annonce bientôt... 🤫" },
      ],
    },
    {
      id: "foire",
      categorie: "semaine-foire",
      title: "LA SEMAINE FOIRE",
      date: "14 – 21 Juillet 2026",
      dateDetail: "Chaque jour de 12h à 21h (dim. jusqu'à 19h)",
      location: "Terrain de foot, Jodoigne",
      locationDetail: "Terrain de foot de Jodoigne",
      description: "8 jours de folie absolue au cœur de Jodoigne. Fête foraine, Soirée Mousse, et le mythique Blind Test. Le rendez-vous intergénérationnel incontournable.",
      heroImage: "/fonts/event-image/semainefoire1.png",
      image1: "/fonts/event-image/semainefoire1.png",
      image2: "/fonts/event-image/semainefoire2.png",
      tag: "Événement de l'été",

      // Billetterie (événements spéciaux dans la semaine)
      ticketUrl: "https://widget.weezevent.com/ticket/E2129673/?code=45420&locale=fr-FR&width_auto=1&color_primary=0032FA",
      weezeventId: "2129673",
      ticketCTA: "Voir les billets",
      ticketPrices: [
        { label: "Entrée foire", price: "Libre" },
        { label: "Blind Test (prévente)", price: "Sur inscription" },
        { label: "Soirée Mousse (prévente)", price: "8€" },
        { label: "Soirée Mousse (sur place)", price: "12€" },
      ],

      // Programme jour par jour
      program: [
        {
          day: "Lundi 14 Juillet",
          items: [
            { time: "14h00", title: "🎉 Ouverture & Happy Hours", description: "Début de la foire, ambiance garantie !" },
            { time: "19h00", title: "🎧 DJ Set", description: "DJ Alcor aux platines" },
          ]
        },
        {
          day: "Mardi 15 Juillet",
          items: [
            { time: "15h00", title: "🎭 Défilé de mascottes", description: "" },
            { time: "19h00", title: "🎤 Concert", description: "ElectroZickxx" },
          ]
        },
        {
          day: "Mercredi 16 Juillet",
          items: [
            { time: "17h00", title: "🎭 Match d'impro", description: "" },
            { time: "19h00", title: "🎧 DJ Set", description: "Les Zanimos" },
          ]
        },
        {
          day: "Jeudi 17 Juillet",
          items: [
            { time: "17h00 & 20h00", title: "🎧 DJ Sets Jodognois", description: "" },
            { time: "18h00", title: "🎤 Spectacle de Stand Up", description: "" },
          ]
        },
        {
          day: "Vendredi 18 Juillet",
          items: [
            { time: "17h00", title: "🎭 Défilé de mascottes", description: "" },
            { time: "18h00", title: "🎧 DJ Set", description: "Le P'tit Seb" },
            { time: "20h00", title: "🕺 Blind Test 100% interactif", description: "Suivi de la soirée 80's & 90's – réservation recommandée" },
          ]
        },
        {
          day: "Samedi 19 Juillet",
          items: [
            { time: "17h00", title: "🎈 Activités pour enfants", description: "" },
            { time: "19h00", title: "🎧 DJ Set", description: "Léo Carbo" },
            { time: "21h00", title: "🫧 Méga Soirée Mousse", description: "8€ prévente / 12€ sur place – billetterie disponible en ligne" },
          ]
        },
        {
          day: "Dimanche 20 Juillet",
          items: [
            { time: "14h00", title: "🃏 Tournoi de belote", description: "Inscription sur place" },
          ]
        },
        {
          day: "Lundi 21 Juillet 🇧🇪",
          items: [
            { time: "14h00", title: "🎸 Concert", description: "" },
            { time: "17h00", title: "🍻 Apéro Fête Nationale", description: "" },
          ]
        },
      ],

      // Détails pratiques
      details: [
        { label: "📅 Horaires", value: "Chaque jour 12h–21h (lun. 14 à partir de 14h, dim. jusqu'à 19h)" },
        { label: "📍 Lieu", value: "Terrain de foot de Jodoigne" },
        { label: "🎡 Activités", value: "Manèges, bar à cocktails & bières spéciales, stand maquillage enfants, food trucks" },
        { label: "👨‍👩‍👧 Public", value: "Tous les âges" },
      ],
    },
  ],


  // --- GALERIES PHOTOS (Événements Passés) ---
  albums: [
    {
      name: "New Year",
      date: "31/12/2025",
      img: "/fonts/event-image/newyear311225.png",
      link: "https://www.facebook.com/media/set/?set=a.890439447278453&type=3"
    },
    {
      name: "On Fire Party",
      date: "29/11/2025",
      img: "/fonts/event-image/onfire291125.png",
      link: "https://www.facebook.com/media/set/?set=a.867741222881609&type=3"
    },
    {
      name: "Soirée Mousse",
      date: "19/07/25",
      img: "/fonts/event-image/soireemousse190725.png",
      link: "https://www.facebook.com/media/set/?set=a.748321804823552&type=3",
      badge: "Semaine Foire"
    },
    {
      name: "Blind Test",
      date: "18/07/25",
      img: "/fonts/event-image/blindtest180725.png",
      link: "https://www.facebook.com/media/set/?set=a.747326144923118&type=3",
      badge: "Semaine Foire"
    },
    {
      name: "In The Depths",
      date: "26/04/25",
      img: "/fonts/event-image/inthedepths260425.png",
      link: "https://photos.google.com/share/AF1QipNvqz110F_VBG4tIB4KOgUo4M84C-WQMaNGMC_UrFcRzjSluCQNIu3JpCm2rTUl8A?key=OU1fQkdaVVp5Q0hETWVudXNWTVlOelZLZTRoeEpR"
    },
    {
      name: "On Fire Party",
      date: "30/11/2024",
      img: "/fonts/event-image/onfireparty301124.png",
      link: "https://photos.google.com/share/AF1QipPa-lojtW8VRwpJzmfoNrIHJEH0XrvYesWGGG1L2Ed_odz9mUPoShceV8rQ9vGRPw?key=S2pFNVpjeHVYYVZqek1NdnM4Sk96RHYxaHd1UC1R"
    },
    {
      name: "In Another Universe",
      date: "27/04/24",
      img: "/fonts/event-image/inanotheruniverse270424.png",
      link: "https://photos.google.com/share/AF1QipOtzdB5yvp-5Bc5gATO-kvU3ne1qTj5VRJaCMAVjSnWzHmYDuV3-ByOsq-UxyP5rw?key=T0J1aDIzYmxiZHJRZ3BoQ082bFNPTExCSVA5UjFB"
    },
    {
      name: "Soirée Des 1k",
      date: "01/12/2023",
      img: "/fonts/event-image/soireedes1k011223.png",
      link: "https://photos.google.com/share/AF1QipPIvPKoQIt-XR-0yzj-Fx3JEhZiNfjBuAIVqLCiAwkKp-qZTcPrTS16dJ95mXFPvg?key=THdNUDdTdWlHWFR1TGlKeUJYeEhwRVRabFB3S2ZR"
    }
  ],

  equipments: [
    {
      name: "Tonnelle PopUp - 3x3",
      price: "25€",
      caution: "50€ de caution par tonnelle",
      image: "/fonts/location/tonnelle-popup-3x3.jpeg"
    },
    {
      name: "Tonnelle PopUp - 3x6",
      price: "45€",
      caution: "50€ de caution par tonnelle",
      image: "/fonts/location/tonnelle-popup-3x6.jpeg"
    },
    {
      name: "Gobelets 25cl",
      price: "Sur devis",
      caution: "",
      image: "/fonts/location/gobelet-reutilisable-25cl.png"
    },
    {
      name: "Gobelets 30cl",
      price: "Sur devis",
      caution: "",
      image: "/fonts/location/gobelet-reutilisable-30cl.png"
    },
    {
      name: "Canon à chaleur (capacité 250m²)",
      price: "75€",
      caution: "100€ de caution par canon (sans combustible)",
      image: "/fonts/location/canon-a-chaleur-250m2.png"
    },
    {
      name: "Mange debout",
      price: "5€",
      caution: "10€ de caution. Nappe noire: 2€ par pièce",
      image: "/fonts/location/mange-debout-nappe-noire.png"
    },
    {
      name: "Verre à Vin réutilisable",
      price: "Sur devis",
      caution: "",
      image: "/fonts/location/verre-a-vin-reutilisable.png"
    },
    {
      name: "Verre à cocktail réutilisable",
      price: "Sur devis",
      caution: "",
      image: "/fonts/location/verre-a-cocktail-reutilisable.png"
    },
    {
      name: "Bar en Palette modulable",
      price: "150€",
      caution: "25€ de caution par palette",
      image: "/fonts/location/bar-en-palette-modulable.png"
    },
    {
      name: "Congélateur Bahut grand",
      price: "50€",
      caution: "100€ de caution",
      image: "/fonts/location/congelateur-bahut-grand.png"
    },
    {
      name: "Congélateur Bahut petit",
      price: "25€",
      caution: "50€ de caution",
      image: "/fonts/location/congelateur-bahut-petit.png"
    },
    {
      name: "Kicker",
      price: "30€",
      caution: "50€ de caution",
      image: "/fonts/location/kicker-baby-foot.png"
    },
    {
      name: "Contrôleur FLX 6 GT PIONEER",
      price: "250€",
      caution: "250€ de caution",
      image: "/fonts/location/controleur-pioneer-flx6-gt.png"
    }
  ],

  config: {
    logoUrl: "/soireesicilogo.png",
    instagramUrl: "https://www.instagram.com/soirees_ici/",
    facebookUrl: "https://www.facebook.com/soireesici",
    tiktokUrl: "https://www.tiktok.com/@soirees_ici"
  }
};
