const EssayModel = require('../models/EssayModel');

const PYTHON_URL = 'http://localhost:5001/prever';
const PYTHON_TIMEOUT_MS = 120_000;

async function callPythonAI(topic, content) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PYTHON_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(PYTHON_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ tema_redacao: topic, texto_redacao: content }),
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('A API de correcao demorou demais. Tente novamente.'), { status: 504 });
    }
    throw Object.assign(new Error('Nao foi possivel conectar a API de correcao. Verifique se ela esta rodando.'), { status: 503 });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let details = '';
    try {
      const errJson = await response.json();
      details = errJson.erro || errJson.error || errJson.message || JSON.stringify(errJson);
    } catch {
      details = await response.text();
    }
    throw Object.assign(new Error('Falha ao obter correcao da API de IA.'), { status: 502, details });
  }

  const data = await response.json();
  if (typeof data.nota_final === 'undefined' || typeof data.feedback === 'undefined') {
    throw Object.assign(new Error('Resposta da API de IA em formato inesperado.'), { status: 502 });
  }

  return data;
}

class EssayController {
  static async listarRedacoes(req, res) {
    try {
      const essays = await EssayModel.findAllByUser(req.user?.id);
      return res.json(essays);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async corrigirRedacao(req, res) {
    try {
      const { title, topic, content } = req.body || {};
      const userId = req.user?.id;

      if (!title || !topic || !content) {
        return res.status(400).json({ message: 'Campos obrigatorios ausentes: title, topic e content.' });
      }
      if (content.trim().length < 50) {
        return res.status(400).json({ message: 'O texto da redacao deve ter pelo menos 50 caracteres.' });
      }

      let imagePath = null;
      if (req.file) {
        imagePath = await EssayModel.uploadImage({
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          originalname: req.file.originalname,
          userId,
        });
      }

      const { nota_final, feedback } = await callPythonAI(topic, content);
      const essay = await EssayModel.save({ userId, title, topic, content, nota_final, feedback, imagePath });

      return res.status(200).json({
        id: essay.id,
        message: 'Redacao corrigida e salva com sucesso.',
        nota: essay.final_score,
        feedback: essay.feedback_json,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || 'Erro interno ao corrigir redacao.',
        ...(error.details && { details: error.details }),
      });
    }
  }

  static async buscarRedacao(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const essay = await EssayModel.findByIdAndUser(id, userId);
      return res.json({
        id: essay.id,
        topic: essay.topic,
        content: essay.content,
        nota: essay.final_score,
        feedback: essay.feedback_json,
        created_at: essay.created_at,
      });
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  static async excluirRedacao(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const essay = await EssayModel.findByIdAndUser(id, userId);

      if (essay.image_url) {
        await EssayModel.deleteImage(essay.image_url);
      }

      await EssayModel.deleteByIdAndUser(id, userId);

      return res.status(200).json({ message: 'Redacao excluida com sucesso.' });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: 'Erro ao excluir redacao.',
        details: error.message,
      });
    }
  }
}

module.exports = EssayController;
