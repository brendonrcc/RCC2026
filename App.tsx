import React from 'react';
import BackgroundEffects from './components/BackgroundEffects';
import Countdown from './components/Countdown';
import NebulaBackground from './components/NebulaBackground';
import TicketGenerator from './components/TicketGenerator';
import GridBackground from './components/GridBackground';
import PublicRegistry from './components/PublicRegistry';
import LoadingScreen from './components/LoadingScreen';
import GoldParticles from './components/GoldParticles';
import { useSound } from './hooks/useSound';

// --- Global Constants ---
const RCC_LOGO_URL = "https://i.imgur.com/EgxhzBS.png";

// --- Theme Context ---
const ThemeContext = React.createContext({
  theme: 'dark',
  toggleTheme: () => {}
});

// --- Icons ---
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

// --- Social Icons ---
const SocialIcons = {
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Twitter: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Youtube: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
};

// --- Custom Cursor Component ---
const CustomCursor = () => {
    const cursorRef = React.useRef<HTMLDivElement>(null);
    const outlineRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;

        let requestRef: number;
        let mouseX = -100;
        let mouseY = -100;
        let outlineX = -100;
        let outlineY = -100;

        const moveCursor = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animate = () => {
            if (cursorRef.current && outlineRef.current) {
                cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
                outlineX += (mouseX - outlineX) * 0.15;
                outlineY += (mouseY - outlineY) * 0.15;
                outlineRef.current.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
            }
            requestRef = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', moveCursor);
        requestRef = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            cancelAnimationFrame(requestRef);
        };
    }, []);

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

    return (
        <React.Fragment>
            <div ref={cursorRef} className="cursor-dot hidden md:block will-change-transform mix-blend-difference" />
            <div ref={outlineRef} className="cursor-outline hidden md:block will-change-transform mix-blend-difference" />
        </React.Fragment>
    );
};

const App = () => {
  const [globalRefreshTrigger, setGlobalRefreshTrigger] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [theme, setTheme] = React.useState('dark');
  const { playChime } = useSound();
  
  // Hero Interaction State
  const heroRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 });

  React.useEffect(() => {
    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme(systemDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', systemDark);
    }
  }, []);

  const toggleTheme = () => {
    playChime();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
          window.requestAnimationFrame(() => {
              setIsScrolled(window.scrollY > 50);
              ticking = false;
          });
          ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGlobalRefresh = React.useCallback(() => {
    setGlobalRefreshTrigger(prev => prev + 1);
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <React.Fragment>
        <LoadingScreen onComplete={() => setIsLoading(false)} />
        <CustomCursor />
        
        {/* Main Container */}
        <div className={`min-h-screen relative flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden transition-all duration-1000 
          bg-[#F5F5F0] dark:bg-[#050505] 
          ${theme === 'dark' ? 'bg-gradient-radial from-[#0f0800] to-[#000000]' : 'bg-gradient-to-b from-[#ffffff] to-[#F0F0E8]'}
          ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        >
          
          {/* Global Background Effects - Reduced opacity for better performance perception */}
          <div className="opacity-50 pointer-events-none">
            <BackgroundEffects theme={theme} />
          </div>

          {/* Navigation */}
          <nav 
              className={`fixed top-0 left-0 w-full p-4 md:px-12 md:py-6 z-50 flex justify-between items-center transition-all duration-700 ${
                  isScrolled 
                  ? 'bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 py-3 md:py-4 shadow-sm' 
                  : 'bg-transparent py-4 md:py-8'
              }`}
          >
            <div className="flex flex-col cursor-pointer group interactive-hover" onClick={() => scrollToSection('hero')}>
                <div className="flex items-center gap-3">
                    <img src={RCC_LOGO_URL} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md hover:scale-110 transition-transform" alt="Logo" />
                    <div className="flex flex-col">
                        <h1 className="text-sm md:text-base font-bold tracking-[0.2em] text-slate-900 dark:text-white uppercase font-ritual leading-none group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors whitespace-nowrap">POLÍCIA RCC</h1>
                        <span className="text-[5px] md:text-[6px] font-bold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-500 whitespace-nowrap">FORMANDO LÍDERES PARA O FUTURO</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <ul className="hidden lg:flex items-center gap-8">
                  {['Início', 'Contagem', 'Login', 'Números', 'Missões'].map((item, idx) => {
                      const ids = ['hero', 'countdown', 'missions', 'registry', 'rules'];
                      return (
                          <li key={idx}>
                              <button 
                                onClick={() => scrollToSection(ids[idx])}
                                className="text-[10px] uppercase tracking-[0.2em] text-slate-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 transition-all relative group py-2 font-bold interactive-hover hover:scale-105"
                              >
                                  {item}
                                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-[1px] bg-amber-600 dark:bg-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                              </button>
                          </li>
                      )
                  })}
              </ul>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full border border-slate-300 dark:border-white/10 hover:border-amber-500 text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-all interactive-hover bg-white/50 dark:bg-black/30 backdrop-blur-sm shadow-sm"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </nav>

          {/* Content Wrapper */}
          <main className="flex-grow w-full relative z-10">
            
            {/* --- ICONIC LUXURY HERO SECTION --- */}
            <section 
              id="hero"
              ref={heroRef}
              onMouseMove={handleHeroMouseMove}
              className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden pt-20"
            >
                {/* Optimized Gold Particles - New Layer */}
                <GoldParticles />

                {/* Background Glow */}
                <div 
                  className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] rounded-full opacity-30 pointer-events-none transition-transform duration-100 ease-out blur-[120px] mix-blend-multiply dark:mix-blend-screen will-change-transform"
                  style={{
                      background: theme === 'dark' 
                        ? 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(0,0,0,0) 60%)'
                        : 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(255,255,255,0) 60%)',
                      transform: `translate3d(-50%, -50%, 0) translate3d(${(mousePos.x - 50) * 0.05}px, ${(mousePos.y - 50) * 0.05}px, 0)` // Reduced movement for performance
                  }}
                ></div>
                
                {/* Hero Content */}
                <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-7xl mx-auto w-full">
                    
                    {/* Top Decorative Line */}
                    <div className="animate-reveal flex flex-col items-center mb-10 opacity-70">
                        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-amber-600 dark:via-amber-400 to-transparent"></div>
                        <span className="mt-4 text-[10px] md:text-xs font-bold tracking-[0.5em] text-slate-500 dark:text-amber-500/60 uppercase">
                            Edição Especial
                        </span>
                    </div>

                    {/* Main Composition */}
                    <div className="relative w-full flex flex-col items-center justify-center">
                        
                        {/* Huge Background Text "2026" */}
                        <h1 
                            className="text-[25vw] leading-none font-editorial font-normal text-slate-200 dark:text-[#111] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
                            style={{ 
                                textShadow: theme === 'dark' ? '0 0 50px rgba(0,0,0,0.8)' : '0 0 20px rgba(255,255,255,0.8)',
                            }}
                        >
                            2026
                        </h1>

                        {/* Foreground Title "MEGA DA VIRADA" */}
                        <div className="relative z-10 group cursor-default">
                             <h2 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-editorial text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-600 dark:from-white dark:to-gray-400 drop-shadow-2xl animate-reveal tracking-tight hover:scale-[1.02] transition-transform duration-700">
                                 MEGA DA
                                 <span className="block italic font-light text-amber-600 dark:text-amber-400 mt-[-0.2em]">Virada</span>
                             </h2>
                        </div>

                        {/* Floating Badge (Hidden on small mobile) */}
                        <div className="absolute top-0 right-10 md:right-20 animate-float hidden lg:block">
                            <div className="w-24 h-24 rounded-full border border-amber-500/30 flex items-center justify-center backdrop-blur-md bg-white/10 dark:bg-black/20 hover:bg-amber-500/10 transition-colors">
                                <div className="text-center">
                                    <span className="block text-2xl font-editorial text-amber-600 dark:text-amber-400">18</span>
                                    <span className="block text-[8px] uppercase tracking-widest text-slate-600 dark:text-white">HCs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Call to Action */}
                    <div className="mt-20 flex flex-col items-center animate-reveal" style={{ animationDelay: '0.4s' }}>
                        <p className="text-sm md:text-lg text-slate-600 dark:text-gray-400 font-light tracking-wide max-w-xl mb-10 leading-relaxed">
                            O grande baile da fortuna aguarda por você. <br/>
                            <span className="text-amber-700 dark:text-amber-300">Faça sua história em 2026.</span>
                        </p>

                        <button 
                            onClick={() => scrollToSection('missions')}
                            className="group relative px-12 py-5 bg-transparent overflow-hidden transition-all duration-300 hover:scale-105"
                        >
                            <div className="absolute inset-0 border-y border-slate-300 dark:border-white/20 group-hover:border-amber-500/50 transition-colors w-full h-full scale-x-100 group-hover:scale-x-90 duration-500"></div>
                            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors"></div>
                            <span className="relative flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                Resgatar Ticket
                            </span>
                        </button>
                    </div>

                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#F5F5F0] dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
            </section>

            {/* Section 2: Timeline */}
            <section id="countdown" className="relative border-t border-slate-300 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md z-20">
                <Countdown />
            </section>

            {/* Section 3: GOLD SECTION (Missions) */}
            <section id="missions" className="min-h-screen flex items-center justify-center relative overflow-hidden py-20 bg-[#ECECE6] dark:bg-transparent transition-colors">
                 {/* Only show Nebula in Dark Mode */}
                 <div className="hidden dark:block">
                    <NebulaBackground />
                 </div>
                 
                 {/* Content */}
                 <div className="relative z-10 w-full">
                      <TicketGenerator onGlobalRefresh={handleGlobalRefresh} />
                 </div>
            </section>

            {/* Section 4: GRID SECTION (Registry) */}
            <div id="registry" className="relative min-h-screen bg-[#F9F9F7] dark:bg-transparent transition-colors">
              <GridBackground theme={theme} />
              <div className="relative z-10">
                  <PublicRegistry refreshTrigger={globalRefreshTrigger} />
              </div>
            </div>

            {/* Section 5: Rules & Missions */}
            <section id="rules" className="py-20 md:py-32 px-6 md:px-20 bg-[#F0F0E8] dark:bg-[#080808] text-slate-900 dark:text-white relative overflow-hidden border-t border-slate-300 dark:border-white/10">
                {/* Background: Blueprint Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-20">
                    <div className="absolute inset-0" 
                         style={{
                             backgroundImage: theme === 'dark' 
                                ? 'linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)'
                                : 'linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
                             backgroundSize: '40px 40px'
                         }}>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-20 pb-8 border-b border-slate-300 dark:border-white/10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse"></span>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-700 dark:text-amber-500">Documento Oficial</span>
                            </div>
                            <h3 className="text-3xl md:text-5xl font-editorial text-slate-900 dark:text-white">Condições & Premiação</h3>
                        </div>
                        <div className="text-right hidden md:block opacity-30">
                             <span className="block text-6xl font-mono font-bold text-slate-900/10 dark:text-white/5 tracking-tighter">OP-2026</span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-16">
                        
                        {/* Left Column: Timeline */}
                        <div className="lg:col-span-4 relative">
                            <div className="lg:sticky lg:top-32">
                                <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 text-slate-500 dark:text-white/50 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-slate-400 dark:bg-white/20"></span> Cronograma
                                </h4>
                                
                                <div className="relative pl-8 border-l border-slate-300 dark:border-white/10 space-y-16">
                                    {/* Event 1 */}
                                    <div className="relative group interactive-hover">
                                        <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-slate-300 dark:bg-black border-2 border-slate-500 dark:border-white/20 group-hover:border-amber-500 group-hover:bg-amber-900 transition-all z-10"></div>
                                        <span className="text-[10px] text-amber-700 dark:text-amber-500 uppercase tracking-widest block mb-1">Abertura</span>
                                        <p className="text-2xl font-editorial text-slate-900 dark:text-white mb-1">31 Dezembro</p>
                                    </div>

                                    {/* Event 2 */}
                                    <div className="relative group interactive-hover">
                                        <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-slate-300 dark:bg-black border-2 border-slate-500 dark:border-white/20 group-hover:border-amber-500 group-hover:bg-amber-900 transition-all z-10"></div>
                                        <span className="text-[10px] text-slate-600 dark:text-gray-500 uppercase tracking-widest block mb-1">Fechamento</span>
                                        <p className="text-2xl font-editorial text-slate-900 dark:text-white mb-1">10 Janeiro</p>
                                    </div>

                                    {/* Event 3 */}
                                    <div className="relative group interactive-hover">
                                        <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.6)] z-10"></div>
                                        <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-amber-500 animate-ping opacity-20"></div>

                                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest block mb-1">O Grande Sorteio</span>
                                        <p className="text-3xl font-editorial text-slate-900 dark:text-white mb-1 text-gold-shimmer">11 Janeiro</p>
                                        <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">Transmissão ao vivo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Mission Briefing Cards */}
                        <div className="lg:col-span-8 space-y-6">
                             <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-slate-500 dark:text-white/50 flex items-center gap-3">
                                 <span className="w-8 h-[1px] bg-slate-400 dark:bg-white/20"></span> Diretrizes da Missão
                             </h4>

                             <div className="grid md:grid-cols-2 gap-6">
                                 {/* Card 1 */}
                                 <div className="bg-white dark:bg-[#111] p-8 border border-slate-300 dark:border-white/10 transition-all duration-500 hover:border-amber-500/30 group shadow-sm hover:shadow-lg rounded-sm hover:-translate-y-1">
                                     <div className="flex justify-between items-start mb-6">
                                         <span className="text-[10px] border border-slate-200 dark:border-white/10 px-2 py-1 uppercase tracking-widest text-slate-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-white group-hover:border-amber-500/30 transition-colors">Fácil</span>
                                     </div>
                                     <h3 className="text-xl text-slate-900 dark:text-white font-light mb-2">01 hora em função</h3>
                                     <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-4 group-hover:bg-amber-500/50 transition-colors"></div>
                                     <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                         Necessário completar <strong className="text-slate-900 dark:text-white">01 hora</strong> em função (Exige rotação no batalhão).
                                     </p>
                                     <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-500/70">
                                         <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_#f59e0b]"></span> Recompensa: 1 Ticket
                                     </div>
                                 </div>

                                 {/* Card 2 */}
                                 <div className="bg-white dark:bg-[#111] p-8 border border-slate-300 dark:border-white/10 transition-all duration-500 hover:border-amber-500/30 group shadow-sm hover:shadow-lg rounded-sm hover:-translate-y-1">
                                     <div className="flex justify-between items-start mb-6">
                                         <span className="text-[10px] border border-slate-200 dark:border-white/10 px-2 py-1 uppercase tracking-widest text-slate-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-white group-hover:border-amber-500/30 transition-colors">Fácil</span>
                                     </div>
                                     <h3 className="text-xl text-slate-900 dark:text-white font-light mb-2">Realizar 3 Rondas</h3>
                                     <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-4 group-hover:bg-amber-500/50 transition-colors"></div>
                                     <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                         Realizar <strong className="text-slate-900 dark:text-white">03 rondas</strong> (Divulgação/Recrutamento).
                                     </p>
                                     <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-500/70">
                                         <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_#f59e0b]"></span> Recompensa: 1 Ticket
                                     </div>
                                 </div>

                                 {/* Card 3 - Featured */}
                                 <div className="md:col-span-2 bg-white dark:bg-[#111] relative p-8 border border-slate-300 dark:border-white/10 hover:border-amber-500/50 transition-all duration-500 group overflow-hidden shadow-sm hover:shadow-xl rounded-sm hover:-translate-y-1">
                                     {/* Animated Gradient Background */}
                                     <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                                     <div className="flex justify-between items-start mb-6 relative z-10">
                                         <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 px-3 py-1 uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">Intermediária</span>
                                     </div>
                                     <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                                         <div>
                                             <h3 className="text-2xl text-slate-900 dark:text-white mb-3">Recrutamento</h3>
                                             <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                                 Recrutar <strong className="text-slate-900 dark:text-white">01 novo policial</strong> à RCC com perfil ativo no System.
                                             </p>
                                             <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-500 font-bold">
                                                 <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Recompensa: 1 Ticket
                                             </div>
                                         </div>
                                         <div className="h-full bg-slate-50 dark:bg-black/40 backdrop-blur-md rounded-lg p-4 border border-slate-200 dark:border-white/5 flex flex-col justify-center transform group-hover:scale-[1.02] transition-transform duration-500">
                                             <p className="text-[10px] text-slate-600 dark:text-gray-500 italic text-center">"Todo novo ciclo é uma oportunidade de recomeçar, é uma nova chance de reaprender e refazer."</p>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

          </main>

          <footer className="relative z-10 bg-[#F5F5F0] dark:bg-black border-t border-slate-200 dark:border-white/5 transition-colors duration-500">
            {/* Top Gradient Separator */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center justify-center space-y-12">
                
                {/* Brand Section */}
                <div className="flex flex-col items-center group cursor-default">
                    <div className="relative mb-6 interactive-hover">
                        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <img src={RCC_LOGO_URL} className="w-16 h-16 object-contain relative z-10 drop-shadow-md grayscale group-hover:grayscale-0 transition-all duration-500" alt="Logo Footer" />
                    </div>
                    <h2 className="text-xl font-bold tracking-[0.3em] text-slate-900 dark:text-white uppercase font-ritual leading-none mb-2">POLÍCIA RCC</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">HIERARQUIA • ORGANIZAÇÃO • AGILIDADE • HABILIDADE</p>
                </div>

                {/* Social Media Links */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {[
                        { name: 'Instagram', url: 'https://www.instagram.com/policercc/', icon: <SocialIcons.Instagram /> },
                        { name: 'Facebook', url: 'https://www.facebook.com/PoliciaRCC/', icon: <SocialIcons.Facebook /> },
                        { name: 'Twitter', url: 'https://twitter.com/PoliceRCC/', icon: <SocialIcons.Twitter /> },
                        { name: 'Youtube', url: 'https://www.youtube.com/PoliceRCC/', icon: <SocialIcons.Youtube /> }
                    ].map((social) => (
                        <a 
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-center p-4 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-white hover:border-amber-500 transition-all duration-300 interactive-hover hover:-translate-y-1"
                            aria-label={social.name}
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                {social.icon}
                            </div>
                        </a>
                    ))}
                </div>

                {/* Bottom Legal & Credits */}
                <div className="w-full border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-600 text-center">
                    <p>&copy; 2026 Revolução Contra o Crime. All rights reserved.</p>
                    <div className="flex items-center gap-4 justify-center">
                        <span className="flex items-center gap-2">
                           Dev <span className="text-amber-600 dark:text-amber-500 font-bold">.Brendon</span>
                        </span>
                    </div>
                </div>
            </div>
          </footer>
        </div>
      </React.Fragment>
    </ThemeContext.Provider>
  );
};

export default App;