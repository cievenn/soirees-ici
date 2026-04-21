export const DATA = {
  // --- ÉVÉNEMENTS À VENIR ---
  upcomingEvents: [
    {
      id: "new-year",
      title: "NEW YEAR ALL IN 2026",
      date: "31 Décembre 2025",
      location: "Salle St-Germain, Éghezée",
      description: "La seule soirée dont tu as besoin.",
      image: "/achanger.png", // Image à mettre à jour
      tag: "Sold Out Imminent",
      targetDateForCountdown: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).getTime() // 31 Décembre, 23:59:59
    },
    {
      id: "foire",
      title: "LA SEMAINE FOIRE",
      date: "Été 2026",
      location: "Jodoigne",
      description: "8 jours de folie absolue au cœur de Jodoigne. Fête foraine, Soirée Mousse, et le mythique Blind Test. Le rendez-vous intergénérationnel incontournable.",
      image1: "/achanger.png",
      image2: "/achanger.png",
      tag: "Événement de l'été"
    }
  ],

  // --- GALERIES PHOTOS (Événements Passés) ---
  albums: [
    { 
      name: "Soirée des 1k", 
      date: "01/12/2023",
      img: "/soireedes1k.png", 
      link: "https://photos.google.com/share/AF1QipPIvPKoQIt-XR-0yzj-Fx3JEhZiNfjBuAIVqLCiAwkKp-qZTcPrTS16dJ95mXFPvg?key=THdNUDdTdWlHWFR1TGlKeUJYeEhwRVRabFB3S2ZR" 
    },
    { 
      name: "In Another Universe", 
      date: "27/04/24",
      img: "/inanotheruniverse.png", 
      link: "https://photos.google.com/share/AF1QipOtzdB5yvp-5Bc5gATO-kvU3ne1qTj5VRJaCMAVjSnWzHmYDuV3-ByOsq-UxyP5rw?key=T0J1aDIzYmxiZHJRZ3BoQ082bFNPTExCSVA5UjFB" 
    },
    { 
      name: "On Fire Party", 
      date: "30/11/2024",
      img: "/onfireparty.png", 
      link: "https://photos.google.com/share/AF1QipPa-lojtW8VRwpJzmfoNrIHJEH0XrvYesWGGG1L2Ed_odz9mUPoShceV8rQ9vGRPw?key=S2pFNVpjeHVYYVZqek1NdnM4Sk96RHYxaHd1UC1R" 
    },
    { 
      name: "In The Depths", 
      date: "26/04/25",
      img: "/inthedepths.png", 
      link: "https://photos.google.com/share/AF1QipNvqz110F_VBG4tIB4KOgUo4M84C-WQMaNGMC_UrFcRzjSluCQNIu3JpCm2rTUl8A?key=OU1fQkdaVVp5Q0hETWVudXNWTVlOelZLZTRoeEpR" 
    },
    { 
      name: "Soirée Mousse", 
      date: "19/07/25",
      img: "/soireemousse.png", 
      link: "https://www.facebook.com/media/set/?set=a.748321804823552&type=3" 
    }
  ],
  
  // --- CONFIGURATION GENERALE ---
  config: {
    logoUrl: "/soireesicilogo.png",
    instagramUrl: "#",
    facebookUrl: "#"
  }
};
