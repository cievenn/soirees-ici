import React, { useState, useEffect } from 'react';
import { Sparkles, Ticket, Image as ImageIcon, ArrowRight, Calendar } from 'lucide-react';
import { DATA } from '../data';
import { THEME } from '../theme';
import Button from '../components/ui/Button';

export default function Home({ navigateTo }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!DATA.upcomingEvents[0]?.targetDateForCountdown) return;
    const targetDate = DATA.upcomingEvents[0].targetDateForCountdown;
    const int = setInterval(() => {
      const now = new Date().getTime();
      const dist = targetDate - now;
      if (dist < 0) return clearInterval(int);
      setTimeLeft({
        days: Math.floor(dist / (1000 * 60 * 60 * 24)),
        hours: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((dist % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className={`animate-fade-in ${THEME.bgLight} min-h-screen text-[#111] relative`}>
      
      {/* NOISE TEXTURE OVERLAY */}
      <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03] mix-blend-multiply" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col justify-center min-h-[90vh] md:min-h-[95vh]">
        
        {/* Background organique */}
        <div className="absolute top-20 right-10 w-[40vw] h-[40vw] bg-[#ff007f] rounded-full blur-[150px] opacity-[0.08] pointer-events-none"></div>
        <div className="absolute bottom-20 left-10 w-[30vw] h-[30vw] bg-[#ff7f00] rounded-full blur-[150px] opacity-[0.08] pointer-events-none"></div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
          
          {/* Contenu Principal */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white border border-gray-200 shadow-sm mb-6 md:mb-10 animate-fade-in-up">
              <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff007f] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-[#ff007f]"></span>
              </span>
              <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-800">
                La référence à Jodoigne
              </span>
            </div>
            
            {/* Titre principal */}
            <h1 className="text-[17vw] sm:text-[13vw] md:text-[10vw] lg:text-[7.5rem] font-display text-[#111] leading-[0.9] tracking-normal mb-6 md:mb-8 animate-fade-in-up drop-shadow-sm" style={{ animationDelay: '0.1s' }}>
              RÉVEILLE <br />
              <span className="flex items-center gap-2 md:gap-4 flex-wrap">
                TES <span className={`${THEME.gradientText} inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-500`}>NUITS.</span>
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-xl mb-8 md:mb-12 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Ne rate plus aucun événement. Rejoins la plus grande communauté de la région pour des concepts 100% inédits.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 md:gap-4 animate-fade-in-up z-20" style={{ animationDelay: '0.3s' }}>
              <Button onClick={() => navigateTo('agenda')} variant="primary" className="w-full sm:w-auto text-sm md:text-base lg:text-lg px-8 md:px-10 py-5 md:py-6 shadow-[0_20px_50px_-10px_rgba(255,0,127,0.3)]">
                <Ticket className="w-5 h-5 md:w-6 md:h-6 animate-pulse" /> SÉCURISER MA PRÉVENTE
              </Button>
              <Button onClick={() => document.getElementById('bento-grid').scrollIntoView({behavior: 'smooth'})} variant="secondary" className="w-full sm:w-auto bg-white/50 backdrop-blur-sm text-sm md:text-base">
                Découvrir l'agenda
              </Button>
            </div>
          </div>

          {/* Image Hero - visible uniquement sur desktop */}
          <div className="lg:col-span-5 relative animate-fade-in-up hidden lg:block mt-12 lg:mt-0" style={{ animationDelay: '0.4s' }}>
            <div className="relative aspect-[3/4] rounded-t-[15rem] rounded-b-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
              <img 
                src="/fonts/event-image/achanger.png" 
                alt="Ambiance Soirée" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              
              {/* Floating Element */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                <p className="font-black text-xs uppercase tracking-widest text-[#ff007f] mb-2">{DATA.upcomingEvents[0]?.tag}</p>
                <p className="font-display text-3xl text-black">{DATA.upcomingEvents[0]?.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="w-full bg-[#111] py-5 md:py-6 overflow-hidden flex items-center border-y border-white/10 shadow-2xl my-10 md:my-12 relative z-20">
        <div className="whitespace-nowrap animate-[scroll_25s_linear_infinite] flex items-center gap-8 md:gap-12">
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-2xl md:text-4xl font-display text-white uppercase tracking-wide">SOIRÉES ICI</span>
              <img src={DATA.config.logoUrl} alt="Logo" className="w-8 h-8 md:w-12 md:h-12 object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              <span className="text-2xl md:text-4xl font-display text-transparent text-stroke-white uppercase tracking-wide">AGENDA 2026</span>
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#ff7f00]" />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. BENTO GRID (Agenda) */}
      <section id="bento-grid" className="py-16 md:py-24 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="mb-12 md:mb-16 lg:mb-24 fade-up-element text-center flex flex-col items-center">
          <span className="font-bold uppercase tracking-[0.2em] text-sm text-[#ff007f] mb-4 block">Notre Agenda</span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-display text-[#111] leading-tight text-center">
            L'ÉVIDENCE DE <br/>TON ANNÉE.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Card 1 : Compte à rebours */}
          <div className={`col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden group border border-black/5 ${THEME.softShadow} min-h-[400px] md:min-h-[450px]`}>
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ff007f] rounded-full blur-[100px] opacity-[0.05] group-hover:opacity-[0.15] transition-opacity duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                <span className="px-3 md:px-5 py-1.5 md:py-2 bg-[#fff0f5] text-[#ff007f] rounded-full font-bold text-xs uppercase tracking-widest">{DATA.upcomingEvents[0]?.date}</span>
                <span className="px-3 md:px-5 py-1.5 md:py-2 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest">{DATA.upcomingEvents[0]?.location}</span>
                {DATA.upcomingEvents[0]?.tag && (
                  <span className="px-3 md:px-5 py-1.5 md:py-2 border border-[#ff007f] text-[#ff007f] rounded-full font-bold text-xs uppercase tracking-widest">{DATA.upcomingEvents[0]?.tag}</span>
                )}
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display text-black leading-[1.1] max-w-lg mb-3 md:mb-4 uppercase">
                {DATA.upcomingEvents[0]?.title.split(' ').map((word, i, arr) => 
                   i >= arr.length - 2 ? <span key={i} className={THEME.gradientText}>{word} </span> : word + ' ' 
                )}
              </h3>
              <p className="text-gray-500 font-medium text-base md:text-lg">{DATA.upcomingEvents[0]?.description}</p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2 md:gap-4 mt-6 md:mt-8">
              {Object.entries({ J: timeLeft.days, H: timeLeft.hours, M: timeLeft.mins, S: timeLeft.secs }).map(([label, value]) => (
                <div key={label} className="bg-[#f7f6f2] border border-black/5 rounded-[1.5rem] md:rounded-[2rem] w-16 h-20 md:w-24 md:h-28 lg:w-28 lg:h-32 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl md:text-4xl lg:text-5xl font-display text-black">{value.toString().padStart(2, '0')}</span>
                  <span className="text-gray-400 font-bold text-xs mt-1">{label}</span>
                </div>
              ))}
            </div>

            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10">
              <button onClick={() => navigateTo('agenda')} className="w-14 h-14 md:w-20 md:h-20 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-gradient-to-r hover:from-[#ff007f] hover:to-[#ff7f00] transition-all duration-500 shadow-2xl group-hover:rotate-[-45deg]">
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>
          </div>

          {/* Card 2 : Photos */}
          <div className={`col-span-1 bg-[#111] rounded-[2rem] md:rounded-[3rem] p-3 md:p-4 relative overflow-hidden group cursor-pointer ${THEME.softShadow} min-h-[300px] md:min-h-[450px]`} onClick={() => navigateTo('photos')}>
            <img src="/galeries.png" alt="Photos" className="w-full h-full object-cover rounded-[1.5rem] md:rounded-[2.5rem] transition-transform duration-1000 group-hover:scale-105 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-[2rem] md:rounded-[3rem]"></div>
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white text-center items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 md:mb-6 border border-white/30 group-hover:bg-[#ff007f] transition-colors duration-500">
                <ImageIcon className="w-6 h-6 md:w-8 md:h-8"/>
              </div>
              <h3 className="text-3xl md:text-4xl font-display">GALERIES</h3>
              <p className="font-bold tracking-widest text-xs uppercase mt-2 opacity-80">Voir les souvenirs</p>
            </div>
          </div>

          {/* Card 3 : Foire */}
          <div className={`col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#111] to-[#222] rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 lg:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 relative overflow-hidden group ${THEME.softShadow}`}>
            {/* Effet abstrait */}
            <div className="absolute right-0 top-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-[100px]"></div>
            
            <div className="flex-1 relative z-10 text-white w-full">
              <span className="px-4 md:px-5 py-1.5 md:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[#ff7f00] font-bold text-xs uppercase tracking-widest mb-6 md:mb-8 inline-block">{DATA.upcomingEvents[1]?.tag}</span>
              <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display mb-4 md:mb-6 leading-[0.9]">
                {DATA.upcomingEvents[1]?.title}
              </h3>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg mb-6 md:mb-10 font-medium">
                {DATA.upcomingEvents[1]?.description}
              </p>
              <Button onClick={() => navigateTo('agenda')} variant="outline" className="border-white/30 text-white hover:border-white hover:bg-white hover:text-black w-full sm:w-auto">
                <Calendar className="w-5 h-5"/> {DATA.upcomingEvents[1]?.date}
              </Button>
            </div>
            
            <div className="flex-1 w-full relative z-10">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <img src={DATA.upcomingEvents[1]?.image1 || "/fonts/event-image/achanger.png"} alt="Foire 1" className="w-full h-40 sm:h-48 md:h-64 lg:h-72 object-cover rounded-[1.5rem] md:rounded-[2rem] transform translate-y-6 md:translate-y-12 border border-white/10 shadow-2xl" />
                <img src={DATA.upcomingEvents[1]?.image2 || "/fonts/event-image/achanger.png"} alt="Foire 2" className="w-full h-40 sm:h-48 md:h-64 lg:h-72 object-cover rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
