// URL do seu Google Apps Script implantado (Web App) - Para Envio (POST)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxY-i50jk_xfHVLW3YitGoRup4Ije_UvVxKTeubFuofYodMalJNZF1vv4NyXt9-XfueOw/exec'; 

// URL do Worker (Proxy para Leitura TSV)
const BASE_SHEET_URL = "https://rccapi.brendon-goncalves.workers.dev/";

// IDs das abas (GIDs)
const GID_HISTORY = "1872953189"; 

// --- CACHE & DEDUPLICATION SYSTEM ---
let cacheData = {
    timestamp: 0,
    data: null as string | null
};
const CACHE_DURATION_MS = 5000; // Cache de 5 segundos para evitar spam

// Limpa células que podem vir com aspas ou espaços extras do formato TSV/CSV
const cleanData = (data: any) => {
    if (!data) return "";
    return data.toString().replace(/^["']|["']$/g, '').trim();
};

// Função auxiliar para analisar TSV de forma robusta
const parseTSV = (text: string) => {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  return lines.map(line => line.split('\t').map(cleanData));
};

// Helper para gerar string aleatória de cache
const getCacheBuster = () => `cb=${Math.floor(Date.now() / 1000)}`;

// --- FUNÇÃO CENTRALIZADA DE FETCH ---
const fetchRawSheetData = async (gid: string) => {
    const now = Date.now();
    
    // Retorna cache se válido
    if (cacheData.data && (now - cacheData.timestamp < CACHE_DURATION_MS)) {
        return cacheData.data;
    }

    try {
        const url = `${BASE_SHEET_URL}?gid=${gid}&${getCacheBuster()}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const text = await response.text();
            if (!text.trim().startsWith('<')) {
                // Atualiza cache
                cacheData = {
                    timestamp: now,
                    data: text
                };
                return text;
            }
        }
    } catch (e) {
        console.error("Erro no fetch raw:", e);
    }
    return null;
};

// ============================================================================
// NOVO: BUSCA UNIFICADA PARA O DASHBOARD (Otimização)
// ============================================================================
export const fetchDashboardData = async (nickname: string) => {
    const text = await fetchRawSheetData(GID_HISTORY);
    
    const result = {
        blockedNumbers: new Set<number>(),
        userHistory: [] as any[]
    };

    if (!text) return result;

    const rows = parseTSV(text);
    const searchNick = nickname.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Processa o TSV uma única vez (O(N))
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 2) continue;

        const rowNick = cleanData(row[1]);
        const numberStr = row[3];
        const statusStr = (row.length > 5 ? row[5] : '').toLowerCase().trim();
        const missionId = cleanData(row[2]);
        const proofLink = cleanData(row[4]);
        const timestamp = cleanData(row[0]);

        // 1. Preenche Números Ocupados
        if (numberStr && statusStr.includes('aprovado')) {
            const num = parseInt(numberStr);
            if (!isNaN(num)) result.blockedNumbers.add(num);
        }

        // 2. Preenche Histórico do Usuário
        const normalizedRowNick = rowNick.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (normalizedRowNick === searchNick) {
            let statusRaw = 'Análise';
            if (statusStr !== "") statusRaw = cleanData(row[5]); // Usa o valor original para exibição

            result.userHistory.push({
                timestamp,
                missionId,
                chosenNumber: numberStr,
                proofLink,
                status: statusRaw
            });
        }
    }

    return result;
};

// ============================================================================
// 1. BUSCAR REGISTRO PÚBLICO
// Mantido separado pois é usado em outro contexto/tela
// ============================================================================
export const fetchApprovedRegistry = async () => {
    try {
        const text = await fetchRawSheetData(GID_HISTORY); // Reusa o cache se possível
        if (!text) return [];

        const rows = parseTSV(text);
        const registry = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length > 5) {
                const statusStr = (row[5] || '').toLowerCase().trim();
                if (statusStr.includes('aprovado')) {
                    const num = parseInt(row[3]);
                    const nick = cleanData(row[1]);
                    
                    if (!isNaN(num) && nick) {
                        registry.push({ number: num, nickname: nick });
                    }
                }
            }
        }
        return registry.sort((a, b) => a.number - b.number);

    } catch (e) {
        console.error("Erro ao buscar registro público:", e);
        return [];
    }
}

// Mantendo compatibilidade legada se necessário, mas o ideal é usar fetchDashboardData
export const fetchTakenNumbers = async () => {
    const data = await fetchDashboardData("ignore_nick_check");
    return data.blockedNumbers;
};

export const fetchUserHistory = async (nickname: string) => {
     const data = await fetchDashboardData(nickname);
     return data.userHistory;
};

export const submitMissionToSheet = async (data: any) => {
  try {
    const formData = new URLSearchParams();
    formData.append('nickname', data.nickname);
    
    let missionName = "";
    if(data.missionId === 1) missionName = "1 Hora em Função";
    if(data.missionId === 2) missionName = "Ronda de Recrutamento";
    if(data.missionId === 3) missionName = "Recrutamento";

    formData.append('missionId', missionName);
    formData.append('chosenNumber', data.chosenNumber.toString());
    formData.append('proofLink', data.proofLink);
    formData.append('timestamp', new Date().toISOString());

    // Invalida o cache ao enviar
    cacheData.timestamp = 0;

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    return { success: true, message: 'Comprovação enviada com sucesso! Aguarde a atualização da tabela.' };

  } catch (error) {
    console.error("Erro no envio:", error);
    return { success: false, message: 'Erro de conexão. Tente novamente.' };
  }
};