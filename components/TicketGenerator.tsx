import React from 'react';
import Skeleton from './Skeleton';
import NumberSelector from './NumberSelector';
import { generateVerificationCode, verifyHabboMission } from '../services/habboService';
import { submitMissionToSheet, fetchDashboardData } from '../services/sheetService';
import { useSound } from '../hooks/useSound';

// --- SVG ICONS ---
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Copy: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Refresh: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Logout: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>,
  Diamond: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2L2 12l10 10 10-10L12 2z" /></svg>
};

const RCC_LOGO_URL = "https://i.imgur.com/EgxhzBS.png";

const MISSION_MAP = {
    1: "1 Hora em Função",
    2: "Rondas Ostensivas",
    3: "Recrutamento"
};

const normalizeText = (text) => {
    return (text || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
};

interface Mission {
  id: number;
  title: string;
  desc: string;
  status: string;
  statusLabel?: string;
  chosenNumber: string;
  proofLink: string;
}

const TicketGenerator = ({ onGlobalRefresh }) => {
  const [stage, setStage] = React.useState('LOGIN');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [nickname, setNickname] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [verifying, setVerifying] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState(null);
  const [takenNumbers, setTakenNumbers] = React.useState(new Set());
  const [userHistory, setUserHistory] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const { playWhoosh, playChime, playClick } = useSound();
  
  const [missions, setMissions] = React.useState<Mission[]>([
    { id: 1, title: MISSION_MAP[1], desc: '1h em Função', status: 'PENDING', chosenNumber: '', proofLink: '' },
    { id: 2, title: MISSION_MAP[2], desc: '03 Rondas de Recrutamento ou Divulgação', status: 'PENDING', chosenNumber: '', proofLink: '' },
    { id: 3, title: MISSION_MAP[3], desc: 'Recrutar 01 Civil', status: 'PENDING', chosenNumber: '', proofLink: '' },
  ]);
  const [activeMissionId, setActiveMissionId] = React.useState(null);

  const changeStage = (newStage) => {
    playWhoosh();
    setIsTransitioning(true);
    setTimeout(() => {
        setStage(newStage);
        requestAnimationFrame(() => setIsTransitioning(false));
    }, 600); 
  };

  React.useEffect(() => {
    const storedSession = localStorage.getItem('rcc_mega_session');
    if (storedSession) {
        try {
            const session = JSON.parse(storedSession);
            if (session.nickname) {
                setNickname(session.nickname);
                setStage('DASHBOARD');
            }
        } catch (e) {
            localStorage.removeItem('rcc_mega_session');
        }
    }
  }, []);

  const saveSession = (nick) => {
      localStorage.setItem('rcc_mega_session', JSON.stringify({ nickname: nick }));
  };

  const refreshData = React.useCallback(() => {
    if (!nickname) return;
    if (onGlobalRefresh) onGlobalRefresh();
    setLoadingData(true);

    fetchDashboardData(nickname).then((data) => {
        setTakenNumbers(data.blockedNumbers);
        const historyInSheetOrder = [...data.userHistory];

        setMissions(prevMissions => prevMissions.map(mission => {
            const targetNameNormalized = normalizeText(MISSION_MAP[mission.id]);
            const missionEntries = historyInSheetOrder.filter(entry => normalizeText(entry.missionId) === targetNameNormalized);
            const lastEntry = missionEntries.length > 0 ? missionEntries[missionEntries.length - 1] : null;

            if (lastEntry) {
                 const statusRaw = normalizeText(lastEntry.status);
                 if (statusRaw.includes('reprovado')) return { ...mission, status: 'REJECTED', statusLabel: 'Reprovado', chosenNumber: lastEntry.chosenNumber, proofLink: lastEntry.proofLink };
                 if (statusRaw.includes('aprovado')) return { ...mission, status: 'COMPLETED', statusLabel: 'Aprovado', chosenNumber: lastEntry.chosenNumber, proofLink: lastEntry.proofLink }
                 return { ...mission, status: 'LOCKED', statusLabel: 'Análise', chosenNumber: lastEntry.chosenNumber, proofLink: lastEntry.proofLink };
            }
            return { ...mission, status: 'PENDING', statusLabel: 'Pendente', chosenNumber: '', proofLink: '' };
        }));

        setUserHistory([...historyInSheetOrder].reverse());
        setLoadingData(false);
    });
  }, [nickname, onGlobalRefresh]);

  React.useEffect(() => {
    if (stage === 'DASHBOARD' && nickname) refreshData();
  }, [stage, nickname, refreshData]);

  const handleStartVerification = () => {
    if (!nickname.trim()) return;
    playClick();
    const code = generateVerificationCode();
    setVerificationCode(code);
    setVerifyError(null);
    changeStage('VERIFICATION');
  };

  const handleCancelVerification = () => {
      setVerifyError(null);
      changeStage('LOGIN');
  };

  const handleVerifyMission = async () => {
    playClick();
    setVerifying(true);
    setVerifyError(null);
    try {
      const result = await verifyHabboMission(nickname, verificationCode);
      if (result.success) {
        playChime();
        saveSession(nickname);
        changeStage('DASHBOARD');
      } else {
        setVerifyError(result.message);
      }
    } catch (e) {
      setVerifyError("Erro inesperado na conexão.");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
      playClick();
      localStorage.removeItem('rcc_mega_session');
      setNickname('');
      changeStage('LOGIN');
      setMissions(missions.map(m => ({ ...m, status: 'PENDING', chosenNumber: '', proofLink: '' })));
  };

  const handleSubmitMission = async (id) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;

    const num = parseInt(mission.chosenNumber);
    if (isNaN(num) || mission.chosenNumber === '') { alert("Por favor, selecione um número na tabela."); return; }
    if (takenNumbers.has(num)) { alert("Este número consta como OCUPADO. Por favor, escolha outro."); refreshData(); return; }
    if (!mission.proofLink || mission.proofLink.length < 5) { alert("Link de comprovação inválido."); return; }
    
    playClick();
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'SUBMITTING' } : m));
    const result = await submitMissionToSheet({ nickname: nickname, missionId: id, chosenNumber: num, proofLink: mission.proofLink });

    if (result.success) {
        playChime();
        alert(`Missão enviada! A tabela será atualizada em instantes.`);
        setActiveMissionId(null);
        setTimeout(() => refreshData(), 3000);
    } else {
        setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'PENDING' } : m));
        alert(result.message);
    }
  };

  const updateMissionField = (id, field, value) => {
    setMissions(prev => prev.map(m => m.id !== id ? m : { ...m, [field]: value }));
  };

  // --- LUXURY LOGIN (THE CLOCK/GALA INVITATION) ---
  const renderLogin = () => (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[50vh] md:min-h-[60vh] animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
         <div className="w-full relative group perspective-1000 flex flex-col md:flex-row shadow-2xl rounded-xl md:rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
            
            {/* Left Side: The Visual (Clock Concept) - Hidden on Mobile to save space */}
            <div className="hidden md:flex relative w-1/2 min-h-full bg-[#f3f3f3] dark:bg-black overflow-hidden items-center justify-center border-r border-slate-200 dark:border-white/5">
                 {/* Decorative Circle */}
                 <div className="absolute inset-0 border-[20px] border-[#e5e5e5] dark:border-[#151515] rounded-full scale-150"></div>
                 <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent"></div>
                 
                 {/* Rotating Elements */}
                 <div className="w-64 h-64 border border-amber-500/30 rounded-full flex items-center justify-center relative animate-[spin_60s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full"></div>
                 </div>
                 <div className="absolute w-48 h-48 border border-slate-300 dark:border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

                 <div className="relative z-10 flex flex-col items-center">
                     <span className="text-8xl font-editorial text-slate-800 dark:text-white font-bold tracking-tighter mix-blend-overlay">20</span>
                     <span className="text-8xl font-editorial text-amber-500 font-bold tracking-tighter -mt-6 drop-shadow-sm">26</span>
                 </div>
            </div>

            {/* Right Side: The Invite Form */}
            <div className="relative w-full md:w-1/2 p-6 md:p-14 flex flex-col justify-center bg-white dark:bg-[#0a0a0a]">
                <div className="mb-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-amber-600 dark:text-amber-500 mb-2">Convite Oficial</p>
                    <h2 className="text-3xl font-editorial text-slate-900 dark:text-white">Confirme sua Presença</h2>
                    <div className="w-10 h-[1px] bg-amber-500 mx-auto mt-4"></div>
                </div>

                <div className="space-y-8">
                     <div className="relative group/input">
                         <input
                             type="text"
                             value={nickname}
                             onChange={(e) => setNickname(e.target.value)}
                             className="block w-full py-4 bg-transparent border-b border-slate-300 dark:border-white/20 text-center text-xl text-slate-800 dark:text-white focus:border-amber-500 outline-none transition-all font-editorial placeholder-slate-400 dark:placeholder-gray-700"
                             placeholder="Seu Nome Habbo"
                         />
                     </div>

                     <button
                         onClick={handleStartVerification}
                         disabled={!nickname.trim()}
                         className="w-full bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-amber-700 dark:hover:bg-amber-400 font-bold uppercase text-xs py-5 tracking-[0.3em] transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn shadow-lg"
                     >
                         <span className="relative z-10 flex items-center justify-center gap-2">
                             Acessar Salão <Icons.ArrowRight />
                         </span>
                     </button>
                </div>
                
                <p className="mt-8 text-center text-[10px] text-slate-400 dark:text-gray-600 uppercase tracking-wider">RCC System Secured</p>
            </div>

         </div>
    </div>
  );

  // --- LUXURY VERIFICATION (THE GOLDEN TICKET) ---
  const renderVerify = () => (
    <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500 px-4">
        <div className="bg-white dark:bg-[#050505] p-1 relative shadow-2xl rounded-sm border-t-4 border-amber-500">
            
            {/* Content Area */}
            <div className="p-8 md:p-12 text-center border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#080808]">
                <div className="w-12 h-12 mx-auto mb-6 text-amber-500 border border-amber-500 rounded-full flex items-center justify-center">
                    <Icons.Lock />
                </div>

                <h2 className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-[0.3em] mb-2">Código de Validação</h2>
                <h1 className="text-3xl font-editorial text-slate-900 dark:text-white mb-8">Liberar Acesso</h1>

                {/* The Golden Ticket Code */}
                <div 
                    className="relative bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-black border border-amber-300 dark:border-amber-500/30 p-6 mb-8 cursor-pointer group hover:scale-[1.02] transition-transform"
                    onClick={() => {navigator.clipboard.writeText(verificationCode); alert('Código copiado!');}}
                >
                    {/* Corner Cuts */}
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 dark:bg-[#080808] rounded-full border-r border-amber-300 dark:border-amber-500/30"></div>
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 dark:bg-[#080808] rounded-full border-l border-amber-300 dark:border-amber-500/30"></div>

                    <p className="text-[9px] text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-2">Ticket Nº</p>
                    <div className="text-4xl font-mono text-amber-900 dark:text-white font-bold tracking-widest group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {verificationCode}
                    </div>
                    <div className="mt-2 text-[8px] text-amber-800/60 dark:text-gray-500 uppercase flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         Clique para copiar <Icons.Copy />
                    </div>
                </div>
                
                {verifyError && (
                     <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 rounded">
                         <p className="text-red-600 dark:text-red-400 text-xs font-bold animate-pulse">{verifyError}</p>
                     </div>
                )}

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleVerifyMission} 
                        disabled={verifying} 
                        className="w-full bg-slate-900 dark:bg-white hover:bg-amber-700 dark:hover:bg-amber-400 text-white dark:text-black font-bold uppercase text-[10px] py-4 tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <span>{verifying ? 'Validando...' : 'Confirmar Missão'}</span>
                    </button>
                    <button 
                        onClick={handleCancelVerification}
                        className="text-slate-500 dark:text-gray-600 text-[10px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  // --- DASHBOARD (Refined) ---
  const renderDashboard = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Header Profile */}
            <div className="relative mb-16">
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-slate-300 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
                         <div className="relative w-20 h-20 flex-shrink-0">
                            <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/50 animate-[spin_10s_linear_infinite]"></div>
                            <img 
                                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${nickname}&direction=2&head_direction=3&gesture=sml&size=l&headonly=1`} 
                                alt={nickname}
                                className="w-full h-full rounded-full object-cover p-2"
                             />
                             <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 dark:bg-black p-0.5 border border-amber-500">
                                <img src={RCC_LOGO_URL} alt="Badge" className="w-full h-full object-contain" />
                             </div>
                         </div>
                         
                         <div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-amber-700 dark:text-amber-500 uppercase tracking-widest font-bold mb-1">
                                    Sua Jornada para 2026
                                </span>
                                <h2 className="text-3xl font-editorial text-slate-900 dark:text-white tracking-wide">{nickname}</h2>
                            </div>
                         </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto justify-center">
                        <button 
                            onClick={refreshData} 
                            disabled={loadingData}
                            className="px-6 py-3 border border-slate-300 dark:border-white/10 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-500 text-slate-700 dark:text-white transition-colors text-[10px] uppercase tracking-widest flex items-center gap-2 rounded"
                        >
                            <Icons.Refresh /> {loadingData ? '...' : 'Atualizar'}
                        </button>

                        <button onClick={handleLogout} className="px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-[10px] uppercase tracking-widest rounded border border-transparent hover:border-red-200 dark:hover:border-red-800">
                            Sair
                        </button>
                    </div>
                </div>
            </div>

            {/* Mission Files Grid - CARD REDESIGN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {loadingData && missions.every(m => m.status === 'PENDING') ? (
                     [1, 2, 3].map((i) => <Skeleton key={i} className="h-96 w-full opacity-10" />)
                ) : (
                    missions.map((mission) => {
                        let statusColor = 'text-slate-500 dark:text-gray-500';
                        let borderColor = 'border-slate-300 dark:border-white/10';
                        let statusBg = 'bg-slate-100 dark:bg-black/50';
                        
                        if (mission.status === 'REJECTED') {
                            statusColor = 'text-red-600 dark:text-red-500';
                            borderColor = 'border-red-300 dark:border-red-900';
                            statusBg = 'bg-red-50 dark:bg-red-900/20';
                        } else if (mission.status === 'COMPLETED') {
                            statusColor = 'text-green-700 dark:text-green-500';
                            borderColor = 'border-green-300 dark:border-green-900';
                            statusBg = 'bg-green-50 dark:bg-green-900/20';
                        } else if (mission.status === 'LOCKED') { 
                            statusColor = 'text-amber-700 dark:text-amber-500';
                            borderColor = 'border-amber-300 dark:border-amber-500/50';
                            statusBg = 'bg-amber-50 dark:bg-amber-900/20';
                        }

                        const isOpen = activeMissionId === mission.id;
                        const canInteract = mission.status === 'PENDING' || mission.status === 'REJECTED';
                        
                        return (
                            <div 
                                key={mission.id} 
                                className={`
                                    relative bg-white dark:bg-[#111] backdrop-blur-xl border ${borderColor} transition-all duration-500 flex flex-col group
                                    ${isOpen ? 'lg:col-span-3 z-20 min-h-[500px] shadow-2xl' : 'min-h-[350px] hover:-translate-y-2 shadow-lg dark:shadow-none hover:shadow-xl'}
                                    rounded-sm overflow-hidden
                                `}
                            >
                                {/* Decorative Corner Accents for "Gala Ticket" feel */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-500/30"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-500/30"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-500/30"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-500/30"></div>

                                <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 mb-2">Evento 00{mission.id}</span>
                                            <h3 className="text-2xl md:text-3xl text-slate-900 dark:text-white font-editorial tracking-wide leading-none">{mission.title}</h3>
                                        </div>
                                        <div className={`px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-bold border ${borderColor} ${statusColor} ${statusBg} rounded`}>
                                            {mission.statusLabel || 'Pendente'}
                                        </div>
                                    </div>

                                    <div className="flex-grow flex items-center">
                                        <p className="text-sm text-slate-600 dark:text-gray-300 font-light border-l-2 border-amber-500/30 pl-4 leading-relaxed max-w-md">
                                            {mission.desc}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-2">Número da Sorte</p>
                                            <div className="h-12 px-6 flex items-center justify-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 min-w-[120px] rounded">
                                                <span className={`font-mono text-xl font-bold ${mission.chosenNumber ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-gray-600'}`}>
                                                    {mission.chosenNumber ? `#${mission.chosenNumber}` : '---'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {canInteract && (
                                            <button 
                                                onClick={() => { playClick(); setActiveMissionId(isOpen ? null : mission.id); }}
                                                className={`w-12 h-12 border flex items-center justify-center transition-all rounded-full ${isOpen ? 'bg-amber-600 dark:bg-amber-500 border-amber-600 dark:border-amber-500 text-white rotate-180 shadow-lg' : 'border-slate-300 dark:border-white/20 text-slate-400 dark:text-gray-400 hover:text-amber-700 dark:hover:text-white hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}
                                            >
                                                <Icons.ChevronDown />
                                            </button>
                                        )}
                                    </div>

                                    {/* EXPANSION */}
                                    <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen && canInteract ? 'grid-rows-[1fr] mt-8 pt-8 border-t border-slate-200 dark:border-white/10' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-top-2 duration-500">
                                                
                                                {/* Number Selector - Full Width */}
                                                <div className="w-full">
                                                    <NumberSelector 
                                                        takenNumbers={takenNumbers} 
                                                        selectedNumber={mission.chosenNumber} 
                                                        onSelect={(n) => { playClick(); updateMissionField(mission.id, 'chosenNumber', n); }} 
                                                        loading={loadingData} 
                                                    />
                                                </div>

                                                {/* Submission Form - Below */}
                                                <div className="flex flex-col justify-center space-y-8 p-6 md:p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                                                    <div>
                                                        <h4 className="text-xs text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 font-bold flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
                                                            <Icons.Lock /> Comprovações de Missão
                                                        </h4>
                                                        
                                                        <div className="relative group/input mb-4">
                                                            <input 
                                                                type="text"
                                                                placeholder="COLE A URL DO IMGUR AQUI..."
                                                                value={mission.proofLink}
                                                                onChange={(e) => updateMissionField(mission.id, 'proofLink', e.target.value)}
                                                                className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 px-6 py-5 text-slate-900 dark:text-white text-sm font-mono focus:border-amber-500 outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-700 rounded-lg"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 dark:text-gray-500 leading-relaxed">
                                                            * Certifique-se que o link da imagem está público e legível. Registros inválidos serão anulados. A validação é manual.
                                                        </p>
                                                    </div>

                                                    <button 
                                                        onClick={() => handleSubmitMission(mission.id)}
                                                        disabled={mission.status === 'SUBMITTING'}
                                                        className="w-full bg-slate-900 dark:bg-white hover:bg-amber-700 dark:hover:bg-amber-500 hover:text-white dark:hover:text-black text-white dark:text-black font-bold uppercase text-xs py-5 tracking-[0.3em] transition-all flex justify-center gap-2 items-center shadow-lg rounded-lg"
                                                    >
                                                        {mission.status === 'SUBMITTING' ? 'Processando...' : (
                                                            <>Enviar Registro <Icons.ArrowRight /></>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
  };

  return (
    <>
      {stage === 'LOGIN' && renderLogin()}
      {stage === 'VERIFICATION' && renderVerify()}
      {stage === 'DASHBOARD' && renderDashboard()}
    </>
  );
};

export default TicketGenerator;