import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Ticket, ChevronDown, Music, Users, Info, ExternalLink } from 'lucide-react';
import { DATA } from '../data';
import { THEME } from '../theme';

// ─── Composant Timeline (programme) ────────────────────────────────────────
function ProgramTimeline({ program }) {
  const [openDay, setOpenDay] = useState(0);

  return (
    <div className="space-y-3">
      {program.map((dayBlock, di) => (
        <div key={di} className="rounded-2xl border border-black/8 overflow-hidden bg-white/60 backdrop-blur-sm">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left group"
            onClick={() => setOpenDay(openDay === di ? -1 : di)}
          >
            <span className="font-display text-xl text-[#111]">{dayBlock.day}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openDay === di ? 'rotate-180 text-[#ff007f]' : ''}`}
            />
          </button>
          {openDay === di && (
            <div className="px-5 pb-5 space-y-3">
              {dayBlock.items.map((item, ii) => (
                <div key={ii} className="flex gap-4">
                  {/* Ligne verticale timeline */}
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#ff007f] to-[#ff7f00] mt-1 shrink-0" />
                    {ii < dayBlock.items.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-[#ff007f]/30 to-transparent my-1 min-h-[20px]" />
                    )}
                  </div>
                  <div className="pb-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black text-[#ff007f] bg-[#fff0f5] px-2.5 py-1 rounded-full border border-[#ff007f]/10">
                        {item.time}
                      </span>
                      <span className="font-bold text-[#111] text-sm">{item.title}</span>
                    </div>
                    {item.description && (
                      <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Widget Billetterie (colonne droite sticky) ─────────────────────────────
function TicketWidget({ event }) {
  useEffect(() => {
    // Inject Weezevent script
    if (!document.querySelector('script[src="https://widget.weezevent.com/weez.js"]')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://widget.weezevent.com/weez.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-white rounded-[2rem] border border-black/8 shadow-2xl overflow-hidden">
      {/* Header coloré */}
      <div className="bg-gradient-to-br from-[#ff007f] to-[#ff7f00] p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">Billetterie</span>
        <h3 className="font-display text-3xl leading-tight relative z-10">{event.title}</h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Infos clés */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 text-[#ff007f] mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-[#111]">{event.dateDetail || event.date}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 text-[#ff7f00] mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-[#111]">{event.location}</div>
              {event.locationDetail && event.locationDetail !== event.location && (
                <div className="text-gray-400 text-xs mt-0.5">{event.locationDetail}</div>
              )}
            </div>
          </div>
        </div>

        {/* Tarifs */}
        {event.ticketPrices?.length > 0 && (
          <div className="bg-[#f7f6f2] rounded-2xl p-4 border border-black/5">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 block">Tarifs</span>
            <div className="space-y-2">
              {event.ticketPrices.map((tp, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{tp.label}</span>
                  <span className="text-sm font-black text-[#111]">{tp.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Widget Weezevent intégré */}
        {event.weezeventId ? (
          <div className="bg-[#f7f6f2] rounded-2xl border border-black/5 overflow-hidden w-full min-h-[100px]">
            <a
              title="Logiciel billetterie en ligne"
              href={event.ticketUrl}
              className="weezevent-widget-integration"
              data-src={event.ticketUrl}
              data-id={event.weezeventId}
              data-resize="1"
              data-width_auto="1"
              data-noscroll="0"
              data-use-container="yes"
              data-type="neo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Billetterie Weezevent
            </a>
          </div>
        ) : (
          <div className="bg-[#f7f6f2] rounded-2xl p-4 border border-black/5 min-h-[80px] flex items-center justify-center">
            <div className="text-center">
              <Ticket className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">Billetterie bientôt disponible</p>
            </div>
          </div>
        )}

        {/* Bouton CTA principal */}
        {event.ticketUrl && !event.weezeventId && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-black text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-gradient-to-r hover:from-[#ff007f] hover:to-[#ff7f00] transition-all duration-500 shadow-lg hover:shadow-[0_10px_30px_-5px_rgba(255,0,127,0.4)] group"
          >
            <Ticket className="w-4 h-4" />
            {event.ticketCTA || 'Acheter mon billet'}
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        )}

        {/* Note légale */}
        <p className="text-[10px] text-center text-gray-400 leading-relaxed">
          Places limitées · Paiement sécurisé via Weezevent
        </p>
      </div>
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────────────────────
export default function EventPage({ eventId, navigateTo }) {
  const event = DATA.upcomingEvents.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center pt-32 px-4">
        <h2 className="font-display text-4xl text-[#111] mb-4">Événement introuvable</h2>
        <button onClick={() => navigateTo('agenda')} className="text-[#ff007f] font-bold underline">
          ← Retour à l'agenda
        </button>
      </div>
    );
  }

  const heroImg = event.heroImage || event.image || event.image1 || '/achanger.png';

  return (
    <div className="animate-fade-in">

      {/* ── HERO REDESIGN ── */}
      <section className="pt-28 md:pt-40 px-4 md:px-8 max-w-[1400px] mx-auto">
        <button
          onClick={() => navigateTo('agenda')}
          className="flex items-center gap-3 text-gray-600 hover:text-[#ff007f] transition-colors mb-6 md:mb-8 font-bold text-sm uppercase tracking-widest group"
        >
          <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-black/5 flex items-center justify-center group-hover:bg-[#ff007f] group-hover:text-white transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Retour à l'agenda
        </button>

        <div className="relative w-full h-[50vh] md:h-[60vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
          <div className="absolute inset-0 bg-[#ff007f] mix-blend-color opacity-0 group-hover:opacity-10 transition-opacity duration-1000 z-10" />
          <img
            src={heroImg}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 flex flex-col justify-end">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#ff007f] to-[#ff7f00] text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                {event.tag || 'À venir'}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] tracking-tight mb-6 max-w-5xl">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-3 md:gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg">
                <Calendar className="w-4 h-4 text-[#ff007f]" />
                {event.dateDetail || event.date}
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg">
                <MapPin className="w-4 h-4 text-[#ff7f00]" />
                {event.location}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPLIT-SCREEN ── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* ─ COLONNE GAUCHE (scrollable) ─ */}
          <div className="w-full lg:flex-1 space-y-8 order-1">

            {/* Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-black/5 shadow-sm">
              <h2 className="font-display text-2xl md:text-3xl text-[#111] mb-4">L'événement</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-medium">{event.description}</p>
            </div>

            {/* Programme */}
            {event.program?.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-black/5 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f] to-[#ff7f00] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl text-[#111]">Programme</h2>
                </div>
                <ProgramTimeline program={event.program} />
              </div>
            )}

            {/* Lineup / Artistes */}
            {event.lineup?.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-black/5 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f] to-[#ff7f00] flex items-center justify-center">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl text-[#111]">Line-up</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.lineup.map((artist, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[#f7f6f2] rounded-2xl p-4 border border-black/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff007f] to-[#ff7f00] flex items-center justify-center text-white font-black text-sm shrink-0">
                        {artist.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#111] text-sm">{artist.name}</div>
                        {artist.role && <div className="text-xs text-gray-500">{artist.role}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boissons ALL IN */}
            {event.boissons && (
              <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-white/5 shadow-sm">
                <h2 className="font-display text-2xl md:text-3xl text-white mb-3">
                  {event.boissonsLabel || '🔥 Boissons à volonté'}
                </h2>
                <p className="text-gray-300 text-base leading-relaxed">{event.boissons}</p>
              </div>
            )}

            {/* Infos pratiques */}
            {event.details?.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-black/5 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f] to-[#ff7f00] flex items-center justify-center">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl text-[#111]">Infos pratiques</h2>
                </div>
                <div className="space-y-3">
                  {event.details.map((d, i) => (
                    <div key={i} className="flex gap-4 items-start bg-[#f7f6f2] rounded-2xl p-4 border border-black/5">
                      <span className="font-black text-xs text-gray-500 uppercase tracking-wider min-w-[90px] shrink-0 mt-0.5">{d.label}</span>
                      <span className="text-sm font-medium text-[#111] leading-relaxed">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ─ COLONNE DROITE (sticky billetterie) ─ */}
          <div id="billetterie-section" className="w-full lg:w-[380px] xl:w-[420px] order-2 lg:sticky lg:top-28">
            <TicketWidget event={event} />
          </div>

        </div>
      </section>

      {/* ── Sticky bar mobile (toujours visible en bas) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-white/80 backdrop-blur-xl border-t border-black/5 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium">Prix dès</div>
            <div className="font-black text-[#111] text-base">
              {event.ticketPrices?.[0]?.price || 'Voir tarifs'}
            </div>
          </div>
          {event.ticketUrl || event.weezeventId ? (
            <button
              onClick={() => {
                const el = document.getElementById('billetterie-section');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#ff007f] to-[#ff7f00] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg"
            >
              <Ticket className="w-4 h-4" />
              {event.ticketCTA || 'Réserver ma place'}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-200 text-gray-500 font-bold text-sm uppercase tracking-wider rounded-2xl">
              Bientôt disponible
            </div>
          )}
        </div>
      </div>
      {/* Espace pour la sticky bar mobile */}
      <div className="lg:hidden h-24" />

    </div>
  );
}
