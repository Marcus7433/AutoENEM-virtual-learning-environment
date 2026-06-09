const EssayModel = require('../models/EssayModel');
const PythonService = require('../services/PythonService');

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

      const { nota_final, feedback } = await PythonService.corrigir(topic, content);
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

  static async getProgress(req, res) {
    try {
      const essays = await EssayModel.getProgressData(req.user?.id);

      const avg = (arr) => Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
      const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      if (essays.length === 0) {
        return res.json({
          total: 0, bestScore: 0, avgScore: 0, thisMonth: 0,
          monthlyData: [],
          competencies: Array.from({ length: 5 }, (_, i) => ({ numero: i + 1, avg: 0, trend: 0 })),
        });
      }

      const now = new Date();
      const total = essays.length;
      const bestScore = Math.max(...essays.map((e) => e.final_score));
      const avgScore = avg(essays.map((e) => e.final_score));
      const thisMonth = essays.filter((e) => {
        const d = new Date(e.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      const monthMap = new Map();
      for (const e of essays) {
        const d = new Date(e.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        if (!monthMap.has(key)) monthMap.set(key, { scores: [], c: [[], [], [], [], []] });
        const entry = monthMap.get(key);
        entry.scores.push(e.final_score);
        for (let i = 0; i < 5; i++) {
          entry.c[i].push(e.feedback_json?.[`c${i + 1}_nota`] ?? 0);
        }
      }

      const monthlyData = [...monthMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => {
          const mo = parseInt(key.split('-')[1], 10);
          const result = { month: MONTHS[mo], avg: avg(v.scores) };
          for (let i = 0; i < 5; i++) result[`c${i + 1}`] = avg(v.c[i]);
          return result;
        });

      const len = monthlyData.length;
      const competencies = Array.from({ length: 5 }, (_, i) => {
        const scores = essays.map((e) => e.feedback_json?.[`c${i + 1}_nota`] ?? 0);
        const compAvg = avg(scores);
        const trend = len >= 2
          ? (monthlyData[len - 1][`c${i + 1}`] ?? 0) - (monthlyData[len - 2][`c${i + 1}`] ?? 0)
          : 0;
        return { numero: i + 1, avg: compAvg, trend };
      });

      return res.json({ total, bestScore, avgScore, thisMonth, monthlyData, competencies });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async transcreverImagem(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
      }
      const data = await PythonService.transcrever(req.file);
      return res.json(data);
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message,
        ...(error.details && { details: error.details }),
      });
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
