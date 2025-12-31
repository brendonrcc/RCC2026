import React from 'react';
import Skeleton from './Skeleton';

const NumberSelector = ({ takenNumbers, selectedNumber, onSelect, loading = false }) => {
  const [rangeIndex, setRangeIndex] = React.useState(0); // 0 = 0-99, 1 = 100-199...
  const [searchTerm, setSearchTerm] = React.useState('');

  // Ranges setup
  const ranges = React.useMemo(() => {
    const r = [];
    for (let i = 0; i < 10; i++) {
      r.push({
        id: i,
        label: `${i}00`, 
        fullLabel: `${i}00 - ${i}99`,
        start: i * 100,
        end: (i * 100) + 99
      });
    }
    return r;
  }, []);

  // Filter logic
  const visibleNumbers = React.useMemo(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.replace(/\D/g, '');
      const results = [];
      for (let i = 0; i < 1000; i++) {
        const numStr = i.toString().padStart(3, '0');
        if (numStr.includes(term)) {
          results.push(i);
        }
      }
      return results;
    } else {
      const currentRange = ranges[rangeIndex];
      const nums = [];
      for (let i = currentRange.start; i <= currentRange.end; i++) {
        nums.push(i);
      }
      return nums;
    }
  }, [rangeIndex, searchTerm, ranges]);

  return (
    <div className="w-full bg-[#FDFBF7] dark:bg-[#050505] border border-slate-200 dark:border-amber-500/20 rounded-2xl overflow-hidden relative flex flex-col h-full min-h-[500px]">
      
      {/* --- HEADER: Metallic/Glass Vault Look --- */}
      <div className="relative p-6 md:p-8 bg-gradient-to-b from-white to-slate-100 dark:from-[#0a0a0a] dark:to-black border-b border-slate-200 dark:border-amber-500/10 z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Title & Stats */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-12 h-12 flex-shrink-0">
                      <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 border border-amber-500/50 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                      </div>
                  </div>
                  <div>
                      <h4 className="text-base md:text-lg font-bold text-slate-800 dark:text-white uppercase tracking-[0.2em] font-ritual">Cofre de Tickets</h4>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                              DISPONÍVEIS: <strong className="text-slate-900 dark:text-white">{1000 - takenNumbers.size}</strong>
                          </span>
                      </div>
                  </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64 group">
                  <input 
                      type="text" 
                      placeholder="BUSCAR NÚMERO..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={loading}
                      className="w-full bg-white dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-lg py-3 pl-10 pr-4 text-xs font-mono text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-slate-400 dark:placeholder-gray-600 uppercase tracking-widest"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600 group-focus-within:text-amber-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
              </div>
          </div>
      </div>

      {/* --- BODY: Scrollable Grid with Sticky Tabs --- */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50 dark:bg-[#050505]">
          
          {/* Tabs (Ranges) - Only show if not searching */}
          {!searchTerm && (
              <div className="flex-shrink-0 bg-white dark:bg-black/40 border-b border-slate-200 dark:border-white/5 py-3 overflow-x-auto custom-scrollbar">
                  <div className="flex px-4 md:px-6 gap-2 min-w-max">
                      {loading ? (
                          [...Array(6)].map((_, i) => <Skeleton key={i} className="w-20 h-8 rounded" />)
                      ) : (
                          ranges.map((r, idx) => (
                              <button
                                  key={idx}
                                  onClick={() => setRangeIndex(idx)}
                                  className={`
                                      px-4 py-2 rounded text-[10px] font-bold tracking-widest transition-all duration-300 border
                                      ${rangeIndex === idx 
                                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-black border-transparent shadow-md scale-105' 
                                          : 'bg-transparent text-slate-500 dark:text-gray-500 border-slate-300 dark:border-white/10 hover:border-amber-500 hover:text-amber-600 dark:hover:text-white'}
                                  `}
                              >
                                  {r.fullLabel}
                              </button>
                          ))
                      )}
                  </div>
              </div>
          )}

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3 pb-8">
                  {loading ? (
                      Array.from({ length: 40 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full rounded opacity-20" />
                      ))
                  ) : (
                      <>
                          {visibleNumbers.map(num => {
                              const isTaken = takenNumbers.has(num);
                              const numStr = num.toString().padStart(3, '0');
                              const isSelected = parseInt(selectedNumber) === num;

                              return (
                                  <button
                                      key={num}
                                      disabled={isTaken && !isSelected}
                                      onClick={() => onSelect(numStr)}
                                      className={`
                                          relative h-10 md:h-12 rounded flex items-center justify-center text-xs font-mono transition-all duration-200 border group
                                          ${isSelected 
                                              ? 'bg-amber-500 border-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] z-10 scale-110' 
                                              : isTaken 
                                                  ? 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-300 dark:text-white/20 cursor-not-allowed' 
                                                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                          }
                                      `}
                                  >
                                      {isTaken && !isSelected ? (
                                           <div className="absolute inset-0 flex items-center justify-center">
                                               <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                           </div>
                                      ) : (
                                          <span>{numStr}</span>
                                      )}
                                  </button>
                              );
                          })}
                          
                          {visibleNumbers.length === 0 && (
                              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40">
                                  <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-gray-500">Nenhum número encontrado</p>
                              </div>
                          )}
                      </>
                  )}
              </div>
          </div>

          {/* Footer Legend */}
          <div className="p-4 bg-white dark:bg-[#080808] border-t border-slate-200 dark:border-white/5 flex flex-wrap justify-center gap-4 md:gap-6 text-[9px] uppercase tracking-widest font-bold">
              <div className="flex items-center gap-2 text-slate-500 dark:text-gray-500">
                  <div className="w-3 h-3 rounded border border-slate-300 dark:border-white/20 bg-transparent"></div> Disponível
              </div>
              <div className="flex items-center gap-2 text-slate-400 dark:text-gray-600">
                  <div className="w-3 h-3 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-current rounded-full opacity-50"></div></div> Ocupado
              </div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <div className="w-3 h-3 rounded bg-amber-500"></div> Selecionado
              </div>
          </div>
      </div>
    </div>
  );
};

export default NumberSelector;