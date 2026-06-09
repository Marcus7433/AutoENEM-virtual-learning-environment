const CORRECAO_URL    = 'http://localhost:5001/prever';
const TRANSCRICAO_URL = 'http://localhost:5001/transcrever';
const CORRECAO_TIMEOUT_MS    = 120_000;
const TRANSCRICAO_TIMEOUT_MS =  60_000;

function httpError(message, status, details) {
  return Object.assign(new Error(message), { status, ...(details && { details }) });
}

async function fetchComTimeout(url, options, timeoutMs, msgTimeout, msgConexao) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') throw httpError(msgTimeout, 504);
    throw httpError(msgConexao, 503);
  } finally {
    clearTimeout(timeoutId);
  }
  return response;
}

async function corrigir(topic, content) {
  const response = await fetchComTimeout(
    CORRECAO_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ tema_redacao: topic, texto_redacao: content }),
    },
    CORRECAO_TIMEOUT_MS,
    'A API de correcao demorou demais. Tente novamente.',
    'Nao foi possivel conectar a API de correcao. Verifique se ela esta rodando.',
  );

  if (!response.ok) {
    let details = '';
    try {
      const e = await response.json();
      details = e.erro || e.error || e.message || JSON.stringify(e);
    } catch { details = await response.text(); }
    throw httpError('Falha ao obter correcao da API de IA.', 502, details);
  }

  const data = await response.json();
  if (typeof data.nota_final === 'undefined' || typeof data.feedback === 'undefined') {
    throw httpError('Resposta da API de IA em formato inesperado.', 502);
  }
  return data;
}

async function transcrever(file) {
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  formData.append('image', blob, file.originalname);

  const response = await fetchComTimeout(
    TRANSCRICAO_URL,
    { method: 'POST', body: formData },
    TRANSCRICAO_TIMEOUT_MS,
    'A transcricao demorou demais. Tente novamente.',
    'Nao foi possivel conectar a API de transcricao. Verifique se ela esta rodando.',
  );

  if (!response.ok) {
    let details = '';
    try { const e = await response.json(); details = e.error || e.message || ''; } catch { /* noop */ }
    throw httpError('Falha ao transcrever a imagem.', 502, details);
  }

  return response.json();
}

module.exports = { corrigir, transcrever };
