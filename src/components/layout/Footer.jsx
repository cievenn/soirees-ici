import React from 'react';
import { Instagram, Facebook, ArrowRight } from 'lucide-react';
import { DATA } from '../../data';
import { THEME } from '../../theme';
import Button from '../ui/Button';

export default function Footer({ navigateTo }) {
  return (
    <footer className="relative mx-4 md:mx-8 mb-4 mt-20 rounded-[2rem] overflow-hidden bg-[#050505]/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] py-12 group">
      
      {/* Glow Effects */}
      <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-[#ff007f]/30 to-transparent blur-[120px] opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
      <div className="absolute -bottom-[100px] -right-[100px] w-[400px] h-[400px] bg-[#ff7f00] rounded-full blur-[150px] opacity-10 group-hover:scale-125 transition-transform duration-1000"></div>

      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-screen" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")'}}></div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 mb-12 border-b border-white/5 pb-12">
          <div className="text-center lg:text-left flex-1">
            <span className="font-['Plus_Jakarta_Sans'] font-semibold uppercase tracking-[0.2em] text-[#ff007f] text-xs mb-4 inline-block py-1 px-4 rounded-full border border-[#ff007f]/20 bg-[#ff007f]/5 shadow-[0_0_15px_rgba(255,0,127,0.1)]">L'aventure continue</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-[1] tracking-tight mb-8 hover:skew-x-[-1deg] transition-transform duration-500 cursor-default">
              PRÊT POUR LA <span className={THEME.gradientText}>PROCHAINE ?</span>
            </h2>
            <div className="inline-block group/btn">
              <Button onClick={() => navigateTo('agenda')} className="w-full sm:w-auto bg-white text-black hover:bg-transparent hover:text-white border border-transparent hover:border-[#ff007f] px-10 py-5 text-sm group-hover/btn:shadow-[0_0_30px_rgba(255,0,127,0.3)] !rounded-2xl">
                SÉCURISER MA PLACE 
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300"/>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-12 flex-1 lg:justify-end">
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-[30px] opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700"></div>
              <img src={DATA.config.logoUrl} alt="Soirées Ici Logo" className="w-24 h-24 sm:w-32 sm:h-32 object-contain relative z-10 hover:rotate-6 hover:scale-105 transition-all duration-700 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            </div>
            
            <div className="flex gap-3">
              <a href={DATA.config.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white backdrop-blur-md hover:bg-[#ff007f] hover:border-[#ff007f] hover:scale-105 transition-all duration-300 shadow-lg group/icon">
                <Instagram className="w-5 h-5 group-hover/icon:animate-bounce" />
              </a>
              <a href={DATA.config.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white backdrop-blur-md hover:bg-[#1877F2] hover:border-[#1877F2] hover:scale-105 transition-all duration-300 shadow-lg group/icon">
                <Facebook className="w-5 h-5 group-hover/icon:animate-bounce" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs font-['Plus_Jakarta_Sans'] font-medium text-gray-400 gap-6">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <a href="#" className="hover:text-white transition-colors">Nous Contacter</a>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <a href="#" className="hover:text-white transition-colors">Devenir Partenaire</a>
          </div>
          
          <div className="text-center tracking-[0.1em] text-white/30 uppercase">
            © 2026 SOIRÉES ICI
          </div>
        </div>
      </div>
    </footer>
  );
}
