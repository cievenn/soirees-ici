import React from 'react';
import { Menu, X } from 'lucide-react';
import { DATA } from '../../data';
import { THEME } from '../../theme';
import Button from '../ui/Button';

export default function Navbar({ currentPage, navigateTo, isScrolled, isMobileMenuOpen, setIsMobileMenuOpen, navItems }) {
  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/10 backdrop-blur-2xl shadow-sm py-3 md:py-4 border-b border-black/5' : 'bg-transparent py-4 md:py-8'
    }`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => navigateTo('accueil')}>
          <img 
            src={DATA.config.logoUrl} 
            alt="Logo Soirées Ici" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform duration-700 group-hover:rotate-[360deg]"
          />
          <span className="font-display text-xl md:text-2xl tracking-tight hidden sm:block text-[#111]">
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
        <button 
          className="md:hidden p-2.5 text-black bg-white rounded-full shadow-lg border border-black/5" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 top-0 bg-black/30 z-40" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="md:hidden absolute top-full left-0 w-full max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-3xl z-50 px-6 py-8 flex flex-col border-t border-black/5 shadow-2xl">
            <div className="flex flex-col gap-2">
              {navItems.map(link => (
                <button
                  key={link.id}
                  onClick={() => navigateTo(link.id)}
                  className={`font-display text-3xl sm:text-4xl text-left py-4 px-4 rounded-2xl transition-all duration-200 ${
                    currentPage === link.id 
                      ? `${THEME.gradientText} bg-black/5` 
                      : 'text-[#111] hover:bg-black/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-black/5">
              <Button onClick={() => navigateTo('agenda')} variant="outline" className="w-full !py-4 !text-sm border-black/10">
                Espace Partenaire
              </Button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
