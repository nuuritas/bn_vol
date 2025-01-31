import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { landingContent } from '../public/landing-content';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Intercept clicks on navigation links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const path = target.getAttribute('href') || '/';
        navigate(path);
      }
    };

    // Initialize the original HTML's scripts
    const initializeScripts = () => {
      // Navbar scroll effect
      const handleScroll = () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
          nav.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
          nav.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
          nav.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
          nav.style.boxShadow = 'none';
        }
      };

      window.addEventListener('scroll', handleScroll);

      // Feature cards animation
      const observerOptions = {
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);

      document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
      });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    };

    const cleanup = initializeScripts();
    document.addEventListener('click', handleClick);
    
    return () => {
      cleanup();
      document.removeEventListener('click', handleClick);
    };
  }, [navigate]);

  return (
    <div dangerouslySetInnerHTML={{ __html: landingContent }} />
  );
};

export default WelcomePage;