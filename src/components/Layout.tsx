import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, AlertCircle, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSocialPopup, setShowSocialPopup] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const handleSocialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSocialPopup(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-body text-[var(--color-text-dark)] bg-[var(--color-bg-primary)] selection:bg-[var(--color-accent-orange)] selection:text-[var(--color-bg-dark)]">
      {/* Top Bar Alert */}
      <div className="bg-[var(--color-accent-red)] text-[var(--color-text-light)] py-2 px-4 text-center font-headline font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-2 overflow-hidden relative h-10">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap absolute left-0"
        >
          {[...Array(20)].map((_, i) => (
            <span key={i} className="flex items-center gap-2">
              <AlertCircle size={14} /> STAY VIGILANT • PROTECT YOUR COMMUNITY • NO BORDERS
            </span>
          ))}
        </motion.div>
      </div>

      <nav className="bg-[var(--color-bg-primary)] border-b-4 border-[var(--color-bg-dark)] shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-full mx-auto">
          <Link to="/" className="text-4xl font-black uppercase tracking-tighter text-[var(--color-accent-red)] underline decoration-4 underline-offset-4 font-headline hover:skew-x-[-10deg] transition-transform inline-block">
            FUCK ICE
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/feed" className={`font-headline font-black uppercase tracking-tighter text-xl transition-all hover:text-[var(--color-accent-red)] ${location.pathname === '/feed' ? 'text-[var(--color-accent-red)] border-b-4 border-[var(--color-accent-red)]' : 'text-[var(--color-bg-dark)]'}`}>
              SIGHTINGS FEED
            </Link>
            <Link to="/rights" className={`font-headline font-black uppercase tracking-tighter text-xl transition-all hover:text-[var(--color-accent-red)] ${location.pathname === '/rights' ? 'text-[var(--color-accent-red)] border-b-4 border-[var(--color-accent-red)]' : 'text-[var(--color-bg-dark)]'}`}>
              KNOW YOUR RIGHTS
            </Link>
            <Link to="/report" className="bg-[var(--color-bg-dark)] text-[var(--color-text-light)] px-8 py-3 font-headline font-black uppercase tracking-widest text-lg hover:bg-[var(--color-accent-red)] transition-all active:translate-y-1 active:translate-x-1 active:shadow-none hard-shadow-red">
              REPORT NOW
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-[var(--color-bg-dark)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[var(--color-bg-primary)] border-t-4 border-[var(--color-bg-dark)] overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6">
                <Link to="/feed" className="font-headline font-black text-3xl uppercase tracking-tighter">SIGHTINGS FEED</Link>
                <Link to="/rights" className="font-headline font-black text-3xl uppercase tracking-tighter">KNOW YOUR RIGHTS</Link>
                <Link to="/report" className="bg-[var(--color-accent-red)] text-[var(--color-text-light)] p-6 font-headline font-black text-3xl uppercase text-center hard-shadow">REPORT NOW</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 relative">
        <Outlet />
      </main>

      <footer className="bg-[var(--color-bg-dark)] border-t-8 border-[var(--color-accent-red)] text-[var(--color-text-light)] py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-black text-[var(--color-accent-orange)] font-headline uppercase mb-6 italic tracking-widest">FUCK ICE</h2>
            <p className="font-label font-bold uppercase text-sm tracking-[0.2em] opacity-80 leading-relaxed max-w-md">
              THIS IS AN OPEN-SOURCE AGITATION TOOL. WE DO NOT RECOGNIZE THE AUTHORITY OF BORDERS. WE STAND WITH THE DISPLACED.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-headline font-black uppercase text-[var(--color-accent-orange)] tracking-widest">NETWORK</h4>
              <a href="https://www.nlg.org/" target="_blank" rel="noopener noreferrer" className="font-label font-bold uppercase text-xs hover:text-[var(--color-accent-orange)] transition-all">Legal Aid</a>
              <a href="https://www.communityjusticeexchange.org/nbfn-directory" target="_blank" rel="noopener noreferrer" className="font-label font-bold uppercase text-xs hover:text-[var(--color-accent-orange)] transition-all">Bail Funds</a>
              <Link to="/privacy" className="font-label font-bold uppercase text-xs hover:text-[var(--color-accent-orange)] transition-all">Privacy Policy</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-headline font-black uppercase text-[var(--color-accent-orange)] tracking-widest">FOLLOW</h4>
              <button onClick={handleSocialClick} className="font-label font-bold uppercase text-xs hover:text-[var(--color-accent-orange)] transition-all text-left">Signal Group</button>
              <button onClick={handleSocialClick} className="font-label font-bold uppercase text-xs hover:text-[var(--color-accent-orange)] transition-all text-left">Mastodon</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[var(--color-text-light)]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--color-text-light)]/40">
          <div className="font-label font-bold uppercase text-[10px] tracking-[0.4em]">© {currentTime.getFullYear()} NO BORDERS. NO PRISONS.</div>
          <div className="font-label font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
            <span>EST 2024 • MELT THE MACHINE</span>
            <span className="text-[var(--color-accent-orange)] opacity-100">• {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </footer>

      {/* Social Media Placeholder Popup */}
      <AnimatePresence>
        {showSocialPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--color-bg-dark)]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[var(--color-bg-primary)] border-8 border-[var(--color-bg-dark)] p-8 max-w-md w-full hard-shadow-red relative"
            >
              <button 
                onClick={() => setShowSocialPopup(false)}
                className="absolute -top-6 -right-6 bg-[var(--color-accent-red)] text-[var(--color-text-light)] p-2 border-4 border-[var(--color-bg-dark)] hover:scale-110 transition-transform"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6 text-[var(--color-accent-red)]">
                <Info size={48} strokeWidth={3} />
                <h3 className="font-headline font-black text-3xl uppercase leading-none">NETWORK PENDING</h3>
              </div>
              <p className="font-body font-bold text-lg uppercase leading-relaxed mb-8">
                WE ARE WAITING TO GET MORE TRACTION IN THE SIGHTINGS FEED BEFORE ACTIVATING OUR SOCIAL CHANNELS. 
                <br /><br />
                STAY VIGILANT. KEEP REPORTING.
              </p>
              <button 
                onClick={() => setShowSocialPopup(false)}
                className="w-full bg-[var(--color-bg-dark)] text-[var(--color-text-light)] py-4 font-headline font-black uppercase text-xl hover:bg-[var(--color-accent-red)] transition-colors"
              >
                UNDERSTOOD
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
