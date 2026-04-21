import React from 'react';
import { Menu, X } from 'lucide-react';
import { DATA } from '../../data';
import { THEME } from '../../theme';
import Button from '../ui/Button';

export default function Navbar({ currentPage, navigateTo, isScrolled, isMobileMenuOpen, setIsMobileMenuOpen, navItems }) {
  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/10 backdrop-blur-2xl shadow-sm py-4 border-b border-black/5' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('accueil')}>
          <img 
            src={DATA.config.logoUrl} 
            alt="Logo Soirées Ici" 
            className="w-16 h-16 object-contain transition-transform duration-700 group-hover:rotate-[360deg]"
          />
          <span className="font-display text-2xl tracking-tight hidden sm:block text-[#111]">
            Soirées<span className={THEME.gradientText}>Ici</span>
          </span>
        </div>

        {/* Desktop Nav - Pill menu */}
        <nav className="hidden md:flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-black/5 rounded-full p-2 shadow-sm">
          {navItems.map(link => (
            <button
              key={link.id}
              onClick={() => navigateTo(link.id)}
              className={`font-display text-xl px-6 py-2 rounded-full transition-all duration-300 ${
                currentPage === link.id 
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-gray-500 hover:text-black hover:bg-black/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action */}
        <div className="hidden md:block">
          <Button onClick={() => navigateTo('agenda')} variant="outline" className="!py-3 !px-6 !text-xs border-black/10 bg-white">
            Espace Partenaire
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-3 text-black bg-white rounded-full shadow-lg border border-black/5" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full h-screen bg-white/30 backdrop-blur-3xl z-50 px-4 py-8 flex flex-col border-t border-white/20">
          <div className="flex flex-col gap-6">
            {navItems.map(link => (
              <button
                key={link.id}
                onClick={() => navigateTo(link.id)}
                className={`font-display text-5xl text-left py-4 border-b border-black/5 ${
                  currentPage === link.id ? THEME.gradientText : 'text-[#111]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
