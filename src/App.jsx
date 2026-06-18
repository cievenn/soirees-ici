import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Photos from './pages/Photos';
import EventPage from './pages/EventPage';
import Location from './pages/Location';
import ValidateOrder from './pages/ValidateOrder';

// Mapping entre les IDs de page et les chemins de route
const PAGE_TO_PATH = {
  accueil: '/',
  agenda: '/agenda',
  photos: '/photos',
  location: '/location',
};

const PATH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([k, v]) => [v, k])
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Détermine la page courante à partir du path
  const currentPage = PATH_TO_PAGE[location.pathname] || 
    (location.pathname.startsWith('/event/') ? 'event' : 
    (location.pathname.startsWith('/valider-commande') ? 'admin' : 'accueil'));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction de navigation compatible avec l'ancien système
  const navigateTo = (page, eventId = null) => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
    
    if (page === 'event' && eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate(PAGE_TO_PATH[page] || '/');
    }
  };

  const navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'agenda', label: 'Agenda / Billets' },
    { id: 'photos', label: 'Photos' }
  ];

  // La page admin n'affiche pas la navbar/footer standard
  const isAdminPage = location.pathname === '/valider-commande';

  if (isAdminPage) {
    return (
      <div 
        className="font-sans text-gray-900 selection:bg-[#ff007f] selection:text-white overflow-x-hidden min-h-screen bg-cover bg-center bg-fixed flex flex-col justify-between"
        style={{ backgroundImage: 'url("/background2.png")' }}
      >
        <main className="flex-1">
          <Routes>
            <Route path="/valider-commande" element={<ValidateOrder />} />
          </Routes>
        </main>
      </div>
    );
  }

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
        <Routes>
          <Route path="/" element={<Home navigateTo={navigateTo} />} />
          <Route path="/agenda" element={<Agenda navigateTo={navigateTo} />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/event/:eventId" element={<EventPage navigateTo={navigateTo} />} />
          <Route path="/location" element={<Location navigateTo={navigateTo} />} />
        </Routes>
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
}