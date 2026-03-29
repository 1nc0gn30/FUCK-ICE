import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Megaphone, ShieldAlert, Users, Handshake, ArrowRight, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-[var(--color-bg-primary)]">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden bg-[var(--color-bg-dark)]">
        {/* Animated SVG Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.svg 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="diagonal-lines" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke="var(--color-accent-orange)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
          </motion.svg>
          
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -right-1/4 w-full h-full bg-gradient-to-br from-[var(--color-accent-red)] to-transparent rounded-full blur-[120px] opacity-30"
          />
        </div>

        <div className="relative z-10 text-center max-w-6xl">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-headline font-black text-7xl md:text-[14rem] text-[var(--color-text-light)] leading-[0.85] uppercase tracking-tighter italic drop-shadow-[15px_15px_0px_#591200] mb-12">
              MELT THE<br />MACHINE.
            </h1>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="inline-block"
          >
            <p className="font-body font-black text-xl md:text-4xl text-[var(--color-text-light)] bg-[var(--color-accent-red)] px-8 py-4 uppercase tracking-[0.2em] hard-shadow-red border-4 border-[var(--color-bg-dark)]">
              UNTIL EVERY CAGE IS EMPTY.
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[var(--color-accent-orange)]"
        >
          <Zap size={48} />
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="w-full bg-[var(--color-accent-red)] py-6 overflow-hidden whitespace-nowrap border-y-8 border-[var(--color-bg-dark)] relative z-20 flex items-center h-24">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 font-headline font-black text-[var(--color-accent-orange)] text-5xl uppercase tracking-widest italic absolute left-0"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center gap-8">
              NO BORDERS NO NATIONS <span className="text-[var(--color-bg-dark)]">/</span> STOP DEPORTATIONS NOW <span className="text-[var(--color-bg-dark)]">/</span> ABOLISH DETENTION
            </span>
          ))}
        </motion.div>
      </div>

      {/* Action Grid */}
      <section className="relative py-32 px-6 md:px-12 bg-[var(--color-bg-primary)] overflow-hidden">
        {/* Decorative SVG */}
        <div className="absolute top-0 right-0 w-64 h-64 text-[var(--color-accent-red)] opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M0,0 L100,0 L100,100 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-headline font-black text-6xl md:text-8xl text-[var(--color-bg-dark)] uppercase tracking-tighter leading-none mb-6">
                IMMEDIATE<br />ACTION.
              </h2>
              <p className="font-body text-2xl font-bold text-[var(--color-accent-red)] uppercase tracking-widest">
                THE MACHINE WON'T STOP UNLESS WE MAKE IT.
              </p>
            </div>
            <Link to="/rights" className="group flex items-center gap-4 font-headline font-black text-2xl uppercase underline underline-offset-8 decoration-8 decoration-[var(--color-accent-orange)] hover:text-[var(--color-accent-red)] transition-colors">
              VIEW ALL RESOURCES <ArrowRight className="group-hover:translate-x-4 transition-transform" size={32} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { to: "/report", icon: Megaphone, title: "REPORT SIGHTING", desc: "ANONYMOUS TIP LINE", color: "bg-[var(--color-bg-primary)]", textColor: "text-[var(--color-bg-dark)]" },
              { to: "/feed", icon: ShieldAlert, title: "SIGHTINGS FEED", desc: "COMMUNITY ALERTS", color: "bg-[var(--color-accent-red)]", textColor: "text-[var(--color-text-light)]" },
              { href: "https://www.nlg.org/", icon: Users, title: "LEGAL AID", desc: "NATIONAL LAWYERS GUILD", color: "bg-[var(--color-bg-primary)]", textColor: "text-[var(--color-bg-dark)]" },
              { href: "https://www.communityjusticeexchange.org/nbfn-directory", icon: Handshake, title: "BOND FUND", desc: "BAIL ASSISTANCE", color: "bg-[var(--color-accent-orange)]", textColor: "text-[var(--color-bg-dark)]" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="h-full"
              >
                {item.to ? (
                  <Link to={item.to} className={`group relative ${item.color} border-8 border-[var(--color-bg-dark)] p-10 text-left hard-shadow transition-all flex flex-col items-start gap-8 h-full`}>
                    <item.icon className={`w-20 h-20 ${item.textColor === 'text-[var(--color-bg-dark)]' ? 'text-[var(--color-accent-red)]' : 'text-[var(--color-accent-orange)]'}`} />
                    <div className="mt-auto">
                      <h3 className={`font-headline font-black text-3xl uppercase leading-none ${item.textColor}`}>{item.title}</h3>
                      <p className={`font-body font-black text-sm mt-4 tracking-widest opacity-70 ${item.textColor}`}>{item.desc}</p>
                    </div>
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className={item.textColor} />
                    </div>
                  </Link>
                ) : (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={`group relative ${item.color} border-8 border-[var(--color-bg-dark)] p-10 text-left hard-shadow transition-all flex flex-col items-start gap-8 h-full`}>
                    <item.icon className={`w-20 h-20 ${item.textColor === 'text-[var(--color-bg-dark)]' ? 'text-[var(--color-accent-red)]' : 'text-[var(--color-accent-orange)]'}`} />
                    <div className="mt-auto">
                      <h3 className={`font-headline font-black text-3xl uppercase leading-none ${item.textColor}`}>{item.title}</h3>
                      <p className={`font-body font-black text-sm mt-4 tracking-widest opacity-70 ${item.textColor}`}>{item.desc}</p>
                    </div>
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className={item.textColor} />
                    </div>
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="bg-[var(--color-bg-dark)] py-32 px-6 md:px-12 text-[var(--color-text-light)]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-headline font-black text-5xl md:text-7xl uppercase tracking-tighter mb-12 italic">
            "WE DO NOT RECOGNIZE THE AUTHORITY OF BORDERS."
          </h2>
          <div className="h-2 w-48 bg-[var(--color-accent-orange)] mx-auto mb-12"></div>
          <p className="font-body text-2xl md:text-3xl font-bold leading-relaxed opacity-90">
            EVERY DAY, THE MACHINE GRINDS DOWN OUR COMMUNITIES. WE ARE THE SAND IN THE GEARS. 
            THROUGH RADICAL SOLIDARITY AND UNCOMPROMISING ACTION, WE WILL MELT THE MACHINE.
          </p>
        </div>
      </section>
    </div>
  );
}
