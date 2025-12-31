import React from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isNewYear, setIsNewYear] = React.useState(false);

  React.useEffect(() => {
    const targetDate = new Date(`January 1, 2026 00:00:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsNewYear(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setIsNewYear(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full py-32 md:py-40 overflow-hidden flex flex-col items-center justify-center bg-transparent">
        
        {/* Background Elements (Theme Aware) */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] border border-slate-300 dark:border-white/5 rounded-full opacity-30 dark:opacity-20 animate-[spin_120s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] border border-slate-300 dark:border-white/5 rounded-full opacity-40 dark:opacity-30 animate-[spin_80s_linear_infinite_reverse]"></div>
        </div>

        {isNewYear ? (
           <div className="relative z-10 text-center animate-in zoom-in-50 duration-1000 px-4">
               <h2 className="text-4xl md:text-7xl font-editorial font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 animate-shimmer mb-4 drop-shadow-2xl">
                   FELIZ ANO NOVO!
               </h2>
               <h3 className="text-3xl md:text-6xl font-editorial text-white tracking-[0.5em] animate-pulse">
                   FELIZ 2026!
               </h3>
               <div className="mt-8 flex justify-center gap-4">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-300"></div>
               </div>
           </div>
        ) : (
            <>
                <div className="relative z-10 mb-16 md:mb-20 text-center px-4">
                    <h3 className="text-3xl md:text-6xl text-slate-900 dark:text-white font-editorial tracking-wide">
                        Contagem <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-700">Final</span>
                    </h3>
                </div>

                <div className="flex flex-wrap justify-center items-center relative z-10 gap-4 md:gap-0">
                    
                    <div className="flex flex-col items-center mx-2 md:mx-4 group cursor-default">
                        <span className="text-4xl md:text-9xl font-editorial text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors duration-500 drop-shadow-xl tabular-nums">
                            {timeLeft.days.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 dark:text-gray-500 mt-2 md:mt-4 border-t border-slate-300 dark:border-white/10 pt-2 w-full text-center">Dias</span>
                    </div>

                    <span className="text-2xl md:text-6xl text-amber-500/40 font-light -mt-6 md:-mt-8">:</span>

                    <div className="flex flex-col items-center mx-2 md:mx-4 group cursor-default">
                        <span className="text-4xl md:text-9xl font-editorial text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors duration-500 drop-shadow-xl tabular-nums">
                            {timeLeft.hours.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 dark:text-gray-500 mt-2 md:mt-4 border-t border-slate-300 dark:border-white/10 pt-2 w-full text-center">Horas</span>
                    </div>

                    <span className="text-2xl md:text-6xl text-amber-500/40 font-light -mt-6 md:-mt-8">:</span>

                    <div className="flex flex-col items-center mx-2 md:mx-4 group cursor-default">
                        <span className="text-4xl md:text-9xl font-editorial text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors duration-500 drop-shadow-xl tabular-nums">
                            {timeLeft.minutes.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 dark:text-gray-500 mt-2 md:mt-4 border-t border-slate-300 dark:border-white/10 pt-2 w-full text-center">Min</span>
                    </div>

                    <span className="text-2xl md:text-6xl text-amber-500/40 font-light -mt-6 md:-mt-8">:</span>

                    <div className="flex flex-col items-center mx-2 md:mx-4 group cursor-default relative">
                        <span className="text-4xl md:text-9xl font-editorial text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-700 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-pulse tabular-nums">
                            {timeLeft.seconds.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-amber-600 dark:text-amber-500 mt-2 md:mt-4 border-t border-amber-500/30 pt-2 w-full text-center font-bold">Seg</span>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

export default Countdown;