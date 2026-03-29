import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, Shield, Home, Car, Briefcase, UserX, Info, AlertTriangle, FileText, Phone, Heart, Scale, Globe, Lock, EyeOff, Megaphone } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: any;
  content: string;
  details: string[];
  category: string;
}

const SECTIONS: Section[] = [
  {
    id: 'at-the-door',
    category: 'ENCOUNTERS',
    title: 'IF THEY COME TO YOUR DOOR',
    icon: Home,
    content: 'Do not open the door. You have the right to remain silent. ICE cannot enter without a warrant signed by a judge.',
    details: [
      'DO NOT OPEN THE DOOR. Opening the door can be considered "consent" for them to enter.',
      'Ask them to slide the warrant under the door or hold it up to a window so you can read it.',
      'Check for a signature by a judge/court. An administrative warrant (signed by ICE) does not give them the right to enter your home without your consent.',
      'Look for your correct name and address on the warrant. If it is incorrect, point it out through the closed door.',
      'If they do not have a judicial warrant, state clearly: "I do not consent to your entry. I will not open the door."',
      'If they force their way in, do not resist. Say: "I do not consent to this search. I am exercising my right to remain silent."',
      'Keep your hands visible at all times. Do not run or make sudden movements.'
    ]
  },
  {
    id: 'in-the-street',
    category: 'ENCOUNTERS',
    title: 'IF STOPPED IN THE STREET',
    icon: UserX,
    content: 'You have the right to remain silent. You do not have to discuss your immigration status or where you were born.',
    details: [
      'Ask: "Am I free to go?" If they say yes, walk away calmly. If they say no, you are being detained.',
      'If you are being detained, ask: "Why am I being detained?"',
      'You have the right to remain silent. You do not have to answer questions about your immigration status, birthplace, or how you entered the country.',
      'You do not have to show ID or any documents unless you are being arrested. If you have a "Red Card," show it to them.',
      'Never carry false documents or documents from another country. This can be used against you.',
      'Do not run. Running can be used as "reasonable suspicion" to detain or arrest you.'
    ]
  },
  {
    id: 'in-a-car',
    category: 'ENCOUNTERS',
    title: 'IF STOPPED IN A VEHICLE',
    icon: Car,
    content: 'The driver must show a license and registration, but passengers do not have to provide ID or answer questions.',
    details: [
      'Pull over safely and keep your hands where the officer can see them (on the steering wheel).',
      'The driver should provide required documents (license, registration, insurance) if asked.',
      'Both driver and passengers have the right to remain silent. Passengers do not have to provide ID or answer questions.',
      'ICE/Police cannot search your car without a warrant or probable cause. Say: "I do not consent to a search."',
      'If you are a passenger, ask: "Am I free to go?" If yes, walk away calmly.'
    ]
  },
  {
    id: 'at-work',
    category: 'ENCOUNTERS',
    title: 'IF THEY COME TO YOUR WORK',
    icon: Briefcase,
    content: 'ICE needs a warrant or the employer\'s consent to enter non-public areas of a workplace.',
    details: [
      'Stay calm. Do not run. Running can be used as a reason to arrest you.',
      'If ICE enters, you have the right to remain silent. You do not have to answer questions about your status.',
      'Ask if you are free to leave. If yes, go to the breakroom or leave the premises calmly.',
      'Employers should be encouraged to refuse entry to non-public areas (like kitchens or back offices) without a judicial warrant.',
      'If you are arrested at work, do not sign anything without a lawyer.'
    ]
  },
  {
    id: 'if-arrested',
    category: 'EMERGENCY',
    title: 'IF YOU ARE ARRESTED',
    icon: Shield,
    content: 'Do not sign anything without talking to a lawyer first. You have the right to a phone call.',
    details: [
      'Say: "I need to speak to my lawyer. I will not sign anything until I do."',
      'Do not answer questions about where you were born or how you entered the US. This information can be used to deport you.',
      'Memorize the phone number of a lawyer or a local rapid response network. You have the right to one phone call.',
      'Ask for a hearing before an immigration judge. Do not agree to "voluntary departure" without legal advice.',
      'If you have a medical condition or need medication, inform the officers immediately.'
    ]
  },
  {
    id: 'family-plan',
    category: 'PREPARATION',
    title: 'EMERGENCY FAMILY PLAN',
    icon: Heart,
    content: 'Prepare your family for the worst-case scenario. Knowledge is your best defense.',
    details: [
      'Designate a trusted person to have Power of Attorney for your children and finances.',
      'Keep all important documents (passports, birth certificates, medical records) in a safe, accessible place.',
      'Make sure your family knows your "A-Number" (Alien Registration Number) if you have one.',
      'Memorize the numbers of a lawyer, a local community organization, and a trusted friend.',
      'Teach your children what to do if ICE comes to the door (e.g., do not open it, call a specific person).'
    ]
  },
  {
    id: 'red-cards',
    category: 'TOOLS',
    title: 'THE "RED CARD" PROTOCOL',
    icon: FileText,
    content: 'A Red Card explains your rights to ICE officers in English and Spanish. Carry it at all times.',
    details: [
      'The card states that you are exercising your right to remain silent and your right to a lawyer.',
      'It informs the officer that you do not consent to a search of your person, belongings, or home.',
      'If stopped, slide the card under the door or hand it to the officer without saying a word.',
      'You can get these cards from local immigrant rights organizations (like ILRC).',
      'Keep a digital copy on your phone as a backup.'
    ]
  },
  {
    id: 'border-zone',
    category: 'ENCOUNTERS',
    title: 'THE 100-MILE BORDER ZONE',
    icon: Globe,
    content: 'ICE and Border Patrol have expanded powers within 100 miles of any US border or coastline.',
    details: [
      'Within this zone, Border Patrol can set up checkpoints and board buses/trains without a warrant.',
      'However, your 4th Amendment rights still apply. They cannot search your bags or vehicle without probable cause or consent.',
      'You still have the right to remain silent. You do not have to answer questions about your citizenship status.',
      'At checkpoints, you are only required to stop. You do not have to answer questions. Ask: "Am I free to go?"',
      'Be aware that almost all of Florida, Michigan, and the Northeast fall within this 100-mile zone.'
    ]
  },
  {
    id: 'rights-lgbtq',
    category: 'SPECIALIZED',
    title: 'LGBTQ+ IMMIGRANT RIGHTS',
    icon: Scale,
    content: 'LGBTQ+ individuals face unique risks in detention and have specific rights to safety and medical care.',
    details: [
      'You have the right to be free from harassment and abuse based on your sexual orientation or gender identity.',
      'Transgender individuals have the right to be housed in facilities that match their gender identity (though this is often violated).',
      'You have the right to access necessary medical care, including hormone therapy.',
      'If you are being abused or threatened in detention, report it immediately and contact an LGBTQ+ legal advocacy group.',
      'You may be eligible for asylum based on persecution in your home country due to your LGBTQ+ status.'
    ]
  },
  {
    id: 'rights-disability',
    category: 'SPECIALIZED',
    title: 'RIGHTS WITH DISABILITIES',
    icon: Info,
    content: 'The Americans with Disabilities Act (ADA) applies to everyone, including those in ICE custody.',
    details: [
      'You have the right to "reasonable accommodations" for your disability while in custody.',
      'This includes access to mobility aids (wheelchairs, canes), sign language interpreters, or modified communication.',
      'ICE cannot discriminate against you or deny you services based on your disability.',
      'If you have a mental health condition, you have the right to appropriate care and evaluation.',
      'Ensure your lawyer is aware of your disability as it may be a factor in your case or release.'
    ]
  }
];

const CATEGORIES = ['ALL', 'ENCOUNTERS', 'EMERGENCY', 'PREPARATION', 'TOOLS', 'SPECIALIZED'];

const MYTHS = [
  {
    myth: "ICE can enter my home if they have a paper signed by an ICE official.",
    fact: "FALSE. Only a warrant signed by a judge or court (a judicial warrant) gives them the right to enter your home without your consent."
  },
  {
    myth: "I have to show my ID if ICE stops me in the street.",
    fact: "FALSE. You have the right to remain silent and do not have to show ID unless you are being arrested."
  },
  {
    myth: "If I am undocumented, I don't have Constitutional rights.",
    fact: "FALSE. The US Constitution protects everyone within the borders of the United States, regardless of their immigration status."
  },
  {
    myth: "ICE cannot arrest me if I am with my children.",
    fact: "FALSE. ICE can and does arrest parents in front of their children. This is why having an emergency family plan is critical."
  }
];

export default function KnowYourRights() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showRedCard, setShowRedCard] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredSections = useMemo(() => {
    let results = SECTIONS;
    
    if (activeCategory !== 'ALL') {
      results = results.filter(s => s.category === activeCategory);
    }

    if (searchQuery) {
      results = results.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return results;
  }, [searchQuery, activeCategory]);

  const searchPreviews = useMemo(() => {
    if (!searchQuery) return [];
    return SECTIONS.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);
  }, [searchQuery]);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 160; // Account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setSearchQuery('');
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] selection:bg-[var(--color-accent-red)] selection:text-white">
      {/* Search Header */}
      <div className="sticky top-[84px] z-40 bg-[var(--color-bg-dark)] border-b-4 border-[var(--color-bg-dark)] p-4 shadow-[8px_8px_0px_0px_rgba(242,125,38,0.2)]">
        <div className="max-w-5xl mx-auto relative">
          <div className="relative flex items-center group">
            <Search className="absolute left-4 text-[var(--color-accent-orange)] group-focus-within:scale-125 transition-transform" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH PROTOCOLS (CMD+K)..."
              className="w-full bg-[var(--color-bg-dark)] border-4 border-[var(--color-accent-orange)] text-[var(--color-text-light)] font-headline font-black p-4 pl-12 focus:outline-none focus:border-[var(--color-accent-red)] uppercase tracking-widest transition-all placeholder:opacity-30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 bg-[var(--color-bg-primary)] border-8 border-[var(--color-bg-dark)] mt-4 hard-shadow-red z-50 max-h-[70vh] overflow-y-auto"
              >
                {searchPreviews.length > 0 ? (
                  searchPreviews.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className="w-full text-left p-8 hover:bg-[var(--color-accent-red)] hover:text-white border-b-4 border-[var(--color-bg-dark)] last:border-0 transition-all group flex items-start gap-6"
                    >
                      <div className="bg-[var(--color-bg-dark)] text-[var(--color-accent-orange)] p-3 group-hover:bg-white group-hover:text-[var(--color-accent-red)] transition-colors">
                        <s.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-headline font-black text-2xl uppercase leading-none">{s.title}</h4>
                          <ArrowRight className="group-hover:translate-x-4 transition-transform" />
                        </div>
                        <p className="font-body text-sm font-bold opacity-70 group-hover:opacity-100 line-clamp-2">{s.content}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-12 font-headline font-black uppercase text-center text-3xl italic text-[var(--color-accent-red)]">
                    NO RESULTS FOUND. STAY VIGILANT.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-32 px-6">
        <div className="relative mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            <h1 className="font-headline font-black text-7xl md:text-[12rem] uppercase tracking-tighter text-[var(--color-bg-dark)] italic leading-[0.8] mb-12 drop-shadow-[10px_10px_0px_var(--color-accent-red)]">
              KNOW YOUR<br />RIGHTS.
            </h1>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-[var(--color-bg-dark)] text-[var(--color-text-light)] px-10 py-5 font-headline font-black text-3xl uppercase tracking-[0.2em] hard-shadow-red transform -rotate-2">
                SILENCE IS A SHIELD.
              </div>
              <div className="bg-[var(--color-accent-orange)] text-[var(--color-bg-dark)] px-10 py-5 font-headline font-black text-3xl uppercase tracking-[0.2em] hard-shadow transform rotate-1">
                KNOWLEDGE IS POWER.
              </div>
            </div>
          </motion.div>

          {/* Insane SVG Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none z-0">
            <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_60s_linear_infinite]">
              <path d="M100,10 L110,90 L190,100 L110,110 L100,190 L90,110 L10,100 L90,90 Z" fill="var(--color-accent-red)" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 font-headline font-black uppercase text-xl border-4 border-[var(--color-bg-dark)] transition-all ${
                activeCategory === cat 
                  ? 'bg-[var(--color-bg-dark)] text-[var(--color-text-light)] hard-shadow-red' 
                  : 'bg-white text-[var(--color-bg-dark)] hover:bg-[var(--color-accent-orange)]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-32 max-w-4xl mx-auto">
          {SECTIONS.map(s => (
            <button 
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className="font-headline font-black uppercase text-sm tracking-widest text-[var(--color-bg-dark)] hover:text-[var(--color-accent-red)] transition-colors flex items-center gap-2 group"
            >
              <div className="w-2 h-2 bg-[var(--color-accent-orange)] group-hover:bg-[var(--color-accent-red)] transition-colors" />
              {s.title}
            </button>
          ))}
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="mb-12 text-center">
            <div className="inline-block bg-[var(--color-bg-dark)] text-white px-6 py-2 font-headline font-black text-xl uppercase tracking-widest hard-shadow-red">
              FOUND {filteredSections.length} MATCHING PROTOCOLS
            </div>
          </div>
        )}

        {/* Red Card Visualizer */}
        <div className="mb-48">
          <div className="bg-[var(--color-bg-dark)] p-12 md:p-24 hard-shadow-red relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
              <FileText size={500} />
            </div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="font-headline font-black text-6xl md:text-8xl text-white uppercase tracking-tighter mb-8 italic">
                THE RED CARD.
              </h2>
              <p className="font-body text-xl md:text-2xl text-white/80 font-bold mb-16 leading-relaxed">
                EVERYONE SHOULD CARRY A RED CARD. IT EXPLAINS YOUR CONSTITUTIONAL RIGHTS TO ICE OFFICERS WITHOUT YOU HAVING TO SAY A WORD.
              </p>
              
              <button 
                onClick={() => setShowRedCard(!showRedCard)}
                className="bg-[var(--color-accent-red)] text-white px-12 py-6 font-headline font-black text-3xl uppercase hard-shadow hover:scale-105 transition-transform"
              >
                {showRedCard ? 'HIDE CARD' : 'VIEW CARD'}
              </button>

              <AnimatePresence>
                {showRedCard && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    className="mt-16 max-w-2xl mx-auto"
                  >
                    <div className="bg-[#ff0000] text-white p-12 border-8 border-black hard-shadow-red text-left relative">
                      <div className="absolute top-4 right-4 opacity-20">
                        <Shield size={100} />
                      </div>
                      <h3 className="font-headline font-black text-4xl mb-8 border-b-4 border-white pb-4">I HAVE CONSTITUTIONAL RIGHTS.</h3>
                      <div className="space-y-6 font-body text-xl font-black uppercase leading-tight">
                        <p>I do not wish to speak with you, answer your questions, or provide you with any information.</p>
                        <p>I do not consent to a search of my person, papers, or property.</p>
                        <p>I will not sign anything without a lawyer present.</p>
                        <p>I am exercising my right to remain silent and my right to an attorney.</p>
                      </div>
                      <div className="mt-12 pt-8 border-t-4 border-white flex justify-between items-end">
                        <div className="font-headline font-black text-2xl">FUCK ICE.</div>
                        <div className="font-label text-sm opacity-70">MELT THE MACHINE</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Common Myths Section */}
        <div className="mb-48">
          <h2 className="font-headline font-black text-6xl md:text-8xl uppercase tracking-tighter text-[var(--color-bg-dark)] mb-16 text-center italic">
            COMMON MYTHS.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {MYTHS.map((m, i) => (
              <div key={i} className="bg-white border-8 border-[var(--color-bg-dark)] p-10 hard-shadow group hover:-translate-y-2 transition-transform">
                <div className="bg-[var(--color-accent-red)] text-white inline-block px-4 py-1 font-headline font-black text-xl mb-6">
                  MYTH
                </div>
                <h3 className="font-headline font-black text-3xl mb-8 text-[var(--color-bg-dark)] leading-tight italic">
                  "{m.myth}"
                </h3>
                <div className="bg-[var(--color-accent-orange)] text-[var(--color-bg-dark)] inline-block px-4 py-1 font-headline font-black text-xl mb-6">
                  FACT
                </div>
                <p className="font-body text-xl font-bold text-[var(--color-bg-dark)]/80 leading-relaxed">
                  {m.fact}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-48">
          {filteredSections.map((section, idx) => (
            <motion.section 
              key={section.id}
              id={section.id}
              ref={el => sectionRefs.current[section.id] = el}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group"
            >
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                {/* Section Header */}
                <div className="lg:w-2/5 lg:sticky lg:top-64">
                  <div className="relative mb-12">
                    <div className="bg-[var(--color-bg-dark)] text-[var(--color-accent-orange)] p-12 hard-shadow-red inline-block relative z-10">
                      <section.icon size={80} strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-full h-full border-8 border-[var(--color-accent-red)] z-0 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform" />
                  </div>
                  
                  <div className="font-label font-black text-[var(--color-accent-red)] uppercase tracking-[0.3em] text-sm mb-4">
                    CATEGORY: {section.category}
                  </div>
                  <h2 className="font-headline font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.85] text-[var(--color-bg-dark)] mb-8">
                    {section.title}
                  </h2>
                  <div className="h-4 w-32 bg-[var(--color-accent-orange)] mb-8" />
                </div>

                {/* Section Details */}
                <div className="lg:w-3/5">
                  <div className="bg-white border-8 border-[var(--color-bg-dark)] p-10 md:p-20 hard-shadow relative overflow-hidden">
                    {/* Decorative Background SVG */}
                    <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
                      <section.icon size={400} />
                    </div>

                    <div className="absolute -top-6 -right-6 bg-[var(--color-accent-red)] text-white px-8 py-3 font-headline font-black text-3xl border-4 border-[var(--color-bg-dark)] transform rotate-3">
                      PROTOCOL {idx + 1}
                    </div>

                    <p className="font-headline font-black text-4xl mb-16 text-[var(--color-bg-dark)] leading-tight italic relative">
                      <span className="text-[var(--color-accent-red)] text-6xl absolute -left-8 -top-4 opacity-20">"</span>
                      {section.content}
                      <span className="text-[var(--color-accent-red)] text-6xl absolute -right-4 bottom-0 opacity-20">"</span>
                    </p>

                    <div className="space-y-12">
                      {section.details.map((detail, dIdx) => (
                        <motion.div 
                          key={dIdx}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: dIdx * 0.1 }}
                          className="flex gap-8 items-start group/item"
                        >
                          <div className="bg-[var(--color-bg-dark)] text-white w-14 h-14 flex-shrink-0 flex items-center justify-center font-headline font-black text-2xl group-hover/item:bg-[var(--color-accent-red)] transition-colors">
                            {dIdx + 1}
                          </div>
                          <p className="font-body text-2xl font-bold leading-relaxed pt-2 text-[var(--color-bg-dark)]/90">
                            {detail}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Footer */}
                    <div className="mt-20 pt-12 border-t-4 border-[var(--color-bg-dark)] flex flex-wrap gap-6">
                      <div className="flex items-center gap-3 text-[var(--color-accent-red)] font-headline font-black uppercase text-xl">
                        <AlertTriangle />
                        STAY CALM
                      </div>
                      <div className="flex items-center gap-3 text-[var(--color-accent-red)] font-headline font-black uppercase text-xl">
                        <EyeOff />
                        DON'T OVERSHARE
                      </div>
                      <div className="flex items-center gap-3 text-[var(--color-accent-red)] font-headline font-black uppercase text-xl">
                        <Lock />
                        EXERCISE RIGHTS
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>

      {/* Rapid Response Banner */}
      <section className="bg-[var(--color-accent-red)] py-32 px-6 border-y-8 border-[var(--color-bg-dark)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="warning-stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="20" height="40" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#warning-stripes)" />
          </svg>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="font-headline font-black text-6xl md:text-8xl text-white uppercase tracking-tighter mb-12 italic">
            EMERGENCY?<br />ACT NOW.
          </h2>
          <p className="font-body text-2xl md:text-4xl text-white font-black uppercase tracking-widest mb-16 leading-tight">
            IF YOU OR A LOVED ONE IS IN CUSTODY, CONTACT A RAPID RESPONSE NETWORK IMMEDIATELY.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <a 
              href="tel:1234567890" 
              className="bg-[var(--color-bg-dark)] text-white px-12 py-6 font-headline font-black text-3xl uppercase flex items-center gap-4 hard-shadow hover:scale-105 transition-transform"
            >
              <Phone size={32} />
              CALL HOTLINE
            </a>
            <Link 
              to="/report" 
              className="bg-[var(--color-accent-orange)] text-[var(--color-bg-dark)] px-12 py-6 font-headline font-black text-3xl uppercase flex items-center gap-4 hard-shadow hover:scale-105 transition-transform"
            >
              <Megaphone size={32} />
              REPORT SIGHTING
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 bg-[var(--color-bg-dark)] text-[var(--color-accent-orange)] p-6 hard-shadow-red hover:scale-110 transition-transform group"
      >
        <ArrowRight className="-rotate-90 group-hover:-translate-y-2 transition-transform" size={32} />
      </motion.button>

      {/* Background Grid Accent */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="rights-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--color-bg-dark)" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rights-grid)" />
        </svg>
      </div>
    </div>
  );
}
