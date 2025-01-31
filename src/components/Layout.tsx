import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 border-b border-slate-800 backdrop-blur
      ${isScrolled ? 'bg-slate-900/98 shadow-lg' : 'bg-slate-900/95'}`}>
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            CryptoTrade
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-200 hover:text-blue-500 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden
          ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
          <div className="py-2 flex flex-col gap-2">
            <NavLinks mobile />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
  const location = useLocation();
  const links = [
    { to: '/candle', label: 'Candlestick' },
    { to: '/tv', label: 'TV Chart' },
    { to: '/freq', label: 'Frequency' },
    { to: '/table', label: 'Table' },
    { to: '/trade', label: 'Trade' },
    { to: '/rs', label: 'RS' }
  ];

  const baseClasses = "transition-colors relative";
  const mobileClasses = "block w-full text-left px-4 py-2 hover:bg-slate-800 rounded";
  const desktopClasses = "hover:text-blue-500";
  const activeClasses = mobile ? "bg-slate-800 text-blue-500" : "text-blue-500";

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`${baseClasses} ${mobile ? mobileClasses : desktopClasses} 
            ${location.pathname === link.to ? activeClasses : 'text-slate-200'}`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-slate-900 py-12 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          CryptoTrade
        </Link>
        <div className="flex gap-4">
          <a href="#" className="text-2xl text-slate-200 hover:text-blue-500 transition-colors">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="text-2xl text-slate-200 hover:text-blue-500 transition-colors">
            <i className="fab fa-discord"></i>
          </a>
          <a href="#" className="text-2xl text-slate-200 hover:text-blue-500 transition-colors">
            <i className="fab fa-telegram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

// Layout component to wrap your app
export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
      <Header />
      <main className="flex-1 w-full pt-16 md:pt-20">
        {children}
      </main>
    </div>
  );
};