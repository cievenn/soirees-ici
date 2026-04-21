import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { DATA } from '../data';

export default function Photos() {
  return (
    <div className="animate-fade-in bg-transparent min-h-screen pt-40 pb-32">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-[0.2em] text-sm text-[#ff007f] mb-4 block">Souvenirs</span>
          <h2 className="text-5xl md:text-8xl font-display text-[#111]">GALERIES</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DATA.albums.map((event, i) => (
            <a href={event.link} target="_blank" rel="noopener noreferrer" key={i} className="group relative rounded-[3rem] overflow-hidden aspect-square cursor-pointer shadow-xl border border-white/10 bg-black/50 hover:shadow-2xl transition-all duration-500">
              <img src={event.img} alt={event.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10 text-white">
                <span className="text-[#ff007f] font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-widest mb-2">{event.date}</span>
                <h3 className="text-4xl font-display">{event.name}</h3>
                <span className="mt-4 flex items-center gap-3 font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest font-bold group-hover:text-[#ff007f] transition-colors duration-300"><ImageIcon className="w-5 h-5"/> Voir l'album</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
