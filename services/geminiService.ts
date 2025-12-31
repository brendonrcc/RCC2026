// Simulation of a Database using LocalStorage
const DB_KEY = 'rcc_mega_virada_db_2025';

// Arrays estáticos para simular a resposta "inteligente" da IA
const THEMES = [
  "Prosperidade", "Resiliência", "Vitória", "Sabedoria", "Coragem", 
  "Inovação", "Liderança", "Fortuna", "Esperança", "Glória"
];

const MESSAGES = [
  "A sorte favorece os audazes. Seu momento é agora.",
  "2026 será o palco das suas maiores conquistas.",
  "Sua determinação atrairá grandes vitórias este ano.",
  "O universo está alinhado com seus objetivos. Acredite.",
  "Grandes recompensas exigem grandes atitudes. Avante!",
  "A fortuna sorri para quem persiste. Boa sorte!",
  "Seu destino está sendo escrito com letras douradas.",
  "Que a sorte da Mega da Virada ilumine seu caminho na RCC."
];

const getRegisteredTickets = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DB_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getAllUsedNumbers = () => {
  const tickets = getRegisteredTickets();
  const used = new Set();
  tickets.forEach(t => t.numbers.forEach(n => used.add(n)));
  return used;
};

const saveTicket = (nickname, numbers) => {
  const tickets = getRegisteredTickets();
  tickets.push({
    nickname,
    numbers,
    timestamp: Date.now()
  });
  localStorage.setItem(DB_KEY, JSON.stringify(tickets));
};

const generateUniqueRandom = (exclude) => {
  let num = Math.floor(Math.random() * 1000); // 0 to 999
  while (exclude.has(num)) {
    num = Math.floor(Math.random() * 1000);
    if (exclude.size >= 1000) return -1; 
  }
  return num;
};

// Agora puramente local, sem API Key
export const generateLuckyNumbers = async (wish, nickname) => {
  try {
    const usedNumbers = getAllUsedNumbers();
    
    // Simula um delay de processamento para parecer "IA pensando"
    await new Promise(resolve => setTimeout(resolve, 1500));

    const finalNumbers = [];
    
    // Gera 3 números
    for (let i = 0; i < 3; i++) {
        const num = generateUniqueRandom(new Set([...usedNumbers, ...finalNumbers]));
        if (num !== -1) finalNumbers.push(num);
    }

    finalNumbers.sort((a, b) => a - b);
    saveTicket(nickname, finalNumbers);

    // Seleciona tema e mensagem aleatória baseada no "wish" (hash simples) ou aleatório
    const seed = (wish.length + nickname.length);
    const theme = THEMES[seed % THEMES.length] || THEMES[Math.floor(Math.random() * THEMES.length)];
    const message = MESSAGES[seed % MESSAGES.length] || MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    return {
      numbers: finalNumbers,
      message: message,
      theme: theme
    };

  } catch (error) {
    console.error("Erro ao gerar números (Local):", error);
    return {
      numbers: [0, 0, 0],
      message: "O sistema blindou sua sorte manualmente.",
      theme: "Erro"
    };
  }
};