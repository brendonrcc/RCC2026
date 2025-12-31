import React from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = React.useState(0);
  const [isFading, setIsFading] = React.useState(false);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const duration = 2500; 
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      
      // Easing function: easeOutQuart
      const ease = 1 - Math.pow(1 - t, 4);
      
      setProgress(ease * 100);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setIsFading(true), 500);
        setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 1500);
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black opacity-80"></div>
      
      {/* Sparkles / Stars Static */}
      <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-amber-200 rounded-full animate-pulse delay-75"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse delay-150"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        
        {/* Top Text: Organization */}
        <div className="overflow-hidden mb-6">
            <span className="block text-[10px] md:text-xs text-amber-500/60 uppercase tracking-[0.6em] font-ritual animate-[reveal_1s_ease-out_forwards]">
                Polícia RCC
            </span>
        </div>

        {/* Centerpiece: 2026 filling up with Gold */}
        <div className="relative mb-8">
            {/* The Text Outline/Base (Dark/Faint) */}
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-editorial font-bold text-transparent stroke-text opacity-20 tracking-tight"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                2026
            </h1>

            {/* The Text Fill (Gold) - Masked by height */}
            <div 
                className="absolute top-0 left-0 w-full overflow-hidden flex items-end justify-center transition-all duration-100 ease-linear"
                style={{ height: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
            >
                 <h1 className="text-5xl sm:text-7xl md:text-9xl font-editorial font-bold text-transparent bg-clip-text bg-gradient-to-t from-amber-600 via-amber-400 to-amber-200 tracking-tight drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]">
                    2026
                 </h1>
            </div>
            
            {/* Horizontal Line flare that moves up with the fill */}
            <div 
                className="absolute left-0 w-full h-[1px] bg-white shadow-[0_0_10px_#fff] opacity-80 transition-all duration-100 ease-linear"
                style={{ bottom: `${progress}%`, display: progress >= 100 ? 'none' : 'block' }}
            ></div>
        </div>

        {/* Bottom Text: Theme */}
        <div className="flex flex-col items-center gap-3">
             <div className="h-[1px] w-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-[shimmer_2s_infinite]" style={{ width: `${Math.min(progress * 2, 200)}px`, transition: 'width 0.1s' }}></div>
             <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] font-light animate-pulse">
                 {progress < 100 ? 'Preparando o Futuro' : 'Seja Bem-vindo'}
             </p>
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;