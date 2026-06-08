import React, { useState } from 'react';
import { MapPin, Calendar, CalendarX, RefreshCw } from 'lucide-react';
import { DATA } from '../data';
import { THEME } from '../theme';
import Button from '../components/ui/Button';

// ─── Définition des filtres ─────────────────────────────────────────────────
const FILTERS = [
  { id: 'tous',          label: 'Tous' },
  { id: 'semaine-foire', label: 'La Semaine Foire' },
  { id: 'clubbing',      label: 'Soirées & Clubbing' },
  { id: 'special',       label: 'Éditions Spéciales' },
];

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 md:py-40 text-center px-4">
      {/* Icône */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff007f]/10 to-[#ff7f00]/10 border border-[#ff007f]/15 flex items-center justify-center mx-auto">
          <CalendarX className="w-10 h-10 text-[#ff007f]/60" strokeWidth={1.5} />
        </div>
        {/* Glow */}
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-[#ff007f] to-[#ff7f00] blur-2xl opacity-10 mx-auto" />
      </div>

      {/* Texte */}
      <h3 className="font-display text-3xl md:text-4xl text-[#111] mb-3">
        Aucun événement pour le moment
      </h3>
      <p className="text-gray-500 text-base md:text-lg font-medium max-w-md leading-relaxed mb-10">
        Revenez plus tard ou inscrivez-vous à notre newsletter pour ne rien manquer !
      </p>

      {/* CTA reset */}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2.5 px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-gradient-to-r hover:from-[#ff007f] hover:to-[#ff7f00] transition-all duration-500 shadow-lg hover:shadow-[0_10px_30px_-5px_rgba(255,0,127,0.4)]"
      >
        <RefreshCw className="w-4 h-4" />
        Voir tous les événements
      </button>
    </div>
  );
}

// ─── Page Agenda ─────────────────────────────────────────────────────────────
export default function Agenda({ navigateTo }) {
  const [activeFilter, setActiveFilter] = useState('tous');

  const filteredEvents =
    activeFilter === 'tous'
      ? DATA.upcomingEvents
      : DATA.upcomingEvents.filter((e) => e.categorie === activeFilter);

  return (
    <div className="animate-fade-in bg-transparent min-h-screen pt-28 md:pt-40 pb-20 md:pb-32">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">

        {/* ── Titre ── */}
        <div className="text-center mb-10 md:mb-16">
          <span className="font-bold uppercase tracking-[0.2em] text-sm text-[#ff007f] mb-4 block">
            Notre Agenda
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display text-[#111]">
            ÉVÉNEMENTS<br />À VENIR
          </h2>
        </div>

        {/* ── Barre de filtres ── */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 md:mb-20">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={[
                  'px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#ff7f00] text-white shadow-lg shadow-[#ff007f]/30 scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-black/8 hover:border-[#ff007f]/40 hover:text-[#ff007f] hover:scale-105',
                ].join(' ')}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* ── Grille d'événements ou Empty State ── */}
        {filteredEvents.length === 0 ? (
          <EmptyState onReset={() => setActiveFilter('tous')} />
        ) : (
          <div className="flex flex-col gap-12 md:gap-24">
            {filteredEvents.map((event, i) => (
              <div
                key={event.id}
                className="bg-white/90 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 lg:p-16 shadow-2xl border border-black/5 flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center group relative"
              >
                {/* Glow */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff007f] rounded-full blur-[150px] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700" />

                {/* Contenu texte */}
                <div className={`flex-1 order-2 w-full ${i % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
                    {event.tag || 'À venir'}
                  </div>

                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-display text-[#111] leading-tight mb-4 md:mb-6 uppercase">
                    {event.title.split(' ').map((word, wIndex, arr) =>
                      wIndex >= arr.length - 2
                        ? <span key={wIndex} className={THEME.gradientText}>{word} </span>
                        : word + ' '
                    )}
                  </h3>

                  <p className="text-base md:text-xl text-gray-700 mb-6 md:mb-8 leading-relaxed font-medium">
                    {event.description}
                  </p>

                  <ul className="space-y-3 md:space-y-4 mb-8 md:mb-12 text-sm md:text-base font-bold text-gray-600">
                    <li className="flex items-center gap-3 md:gap-4 bg-[#F7F6F2] p-3 md:p-5 rounded-xl md:rounded-2xl border border-black/5">
                      <MapPin className="text-[#ff7f00] w-5 h-5 md:w-6 md:h-6 shrink-0" />
                      {event.location}
                    </li>
                    <li className="flex items-center gap-3 md:gap-4 bg-[#F7F6F2] p-3 md:p-5 rounded-xl md:rounded-2xl border border-black/5">
                      <Calendar className="text-[#ff007f] w-5 h-5 md:w-6 md:h-6 shrink-0" />
                      {event.date}
                    </li>
                  </ul>

                  <Button
                    onClick={() => navigateTo('event', event.id)}
                    variant="primary"
                    className="w-full sm:w-auto py-4 md:py-6 px-8 md:px-12 text-base md:text-lg shadow-[0_20px_50px_-10px_rgba(255,0,127,0.3)]"
                  >
                    Billetterie
                  </Button>
                </div>

                {/* Image */}
                <div className={`flex-1 w-full relative order-1 ${i % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${
                      i % 2 === 0 ? 'from-[#ff007f] to-[#ff7f00]' : 'from-[#ff7f00] to-[#ff007f]'
                    } rounded-[1.5rem] md:rounded-[2.5rem] transform rotate-3 scale-105 opacity-20 blur-xl group-hover:rotate-6 transition-transform duration-700`}
                  />
                  <img
                    src={event.image || event.image1 || '/achanger.png'}
                    alt={event.title}
                    className="rounded-[1.5rem] md:rounded-[2.5rem] w-full h-52 sm:h-64 md:h-80 lg:h-[500px] object-cover relative z-10 shadow-xl border-4 border-white transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
