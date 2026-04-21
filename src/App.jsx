import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Photos from './pages/Photos';

export default function App() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'agenda', label: 'Agenda / Billets' },
    { id: 'photos', label: 'Photos' }
  ];

  return (
    <div 
      className="font-sans text-gray-900 selection:bg-[#ff007f] selection:text-white overflow-x-hidden min-h-screen bg-cover bg-center bg-fixed flex flex-col justify-between"
      style={{ backgroundImage: 'url("/background1.png")' }}
    >
      <Navbar 
        currentPage={currentPage}
        navigateTo={navigateTo}
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navItems={navItems}
      />

      <main className="flex-1">
        {currentPage === 'accueil' && <Home navigateTo={navigateTo} />}
        {currentPage === 'agenda' && <Agenda />}
        {currentPage === 'photos' && <Photos />}
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
}