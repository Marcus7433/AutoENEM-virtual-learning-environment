const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const EssayController = require('../controllers/EssayController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(Object.assign(new Error('Apenas imagens sao permitidas.'), { status: 400 }));
  },
});

router.get('/',       authMiddleware, EssayController.listarRedacoes);
router.post('/',      authMiddleware, upload.single('image'), EssayController.corrigirRedacao);
router.get('/:id',    authMiddleware, EssayController.buscarRedacao);
router.delete('/:id', authMiddleware, EssayController.excluirRedacao);

module.exports = router;
