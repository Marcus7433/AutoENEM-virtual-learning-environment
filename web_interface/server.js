/*
TIA - Sistema de Persistência (Backend)
Backend Node.js + Servidor de Ficheiros + Ligação à IA Python
VERSÃO HÍBRIDA (BERT + LLM)
*/

// --- 1. IMPORTAÇÕES ---
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');
// --- NOVAS IMPORTAÇÕES PARA O PROXY DE ARQUIVOS ---
const fs = require('fs');
const multer = require('multer');
const FormData = require('form-data');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';
const PORT = process.env.PORT || 3000;

// Configuração do Multer (Upload temporário)
const upload = multer({ dest: 'uploads_temp/' });

// --- 2. LIGAÇÃO AO BANCO (SQLite) ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'dev.db', // Isto vai criar um ficheiro 'dev.db' na sua pasta
    logging: false, 
});

// --- 3. MODELOS DO BANCO (ATUALIZADOS PARA O HÍBRIDO) ---
const User = sequelize.define('User', {
    // --- ESTES CAMPOS ESTAVAM EM FALTA ---
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    // --- FIM DA CORREÇÃO ---
}, { timestamps: true });

const Essay = sequelize.define('Essay', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    
    // (O resto do seu modelo 'Essay' está perfeito)
    topic: { type: DataTypes.STRING, allowNull: true }, 
    nota_final: { type: DataTypes.INTEGER, allowNull: true }, 
    
    c1_nota: { type: DataTypes.INTEGER },
    c1_feedback: { type: DataTypes.TEXT },
    c2_nota: { type: DataTypes.INTEGER },
    c2_feedback: { type: DataTypes.TEXT },
    c3_nota: { type: DataTypes.INTEGER },
    c3_feedback: { type: DataTypes.TEXT },
    c4_nota: { type: DataTypes.INTEGER },
    c4_feedback: { type: DataTypes.TEXT },
    c5_nota: { type: DataTypes.INTEGER },
    c5_feedback: { type: DataTypes.TEXT },
    comentario_geral: { type: DataTypes.TEXT },
    contentHash: {
        type: DataTypes.STRING(64), 
        allowNull: true
    }
    
}, { 
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'contentHash']
        }
    ]
});

User.hasMany(Essay, { foreignKey: 'userId', onDelete: 'CASCADE' });
Essay.belongsTo(User, { foreignKey: 'userId' });

// --- 4. CONFIGURAÇÃO DO SERVIDOR ---
const app = express();
app.use(bodyParser.json());

// Serve estaticamente todos os ficheiros dentro da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal que serve o seu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- 5. ROTAS DA API ---

// Middleware de autenticação
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token ausente' });
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

// Helpers
async function createTokenForUser(user) {
    const payload = { sub: user.id, email: user.email };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Rotas de Saúde e Registo/Login
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email e password são obrigatórios' });
    try {
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(409).json({ error: 'Email já cadastrado' });
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash, name });
        const token = await createTokenForUser(user);
        return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno' });
    }
});
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email e password são obrigatórios' });
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });
        const token = await createTokenForUser(user);
        return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno' });
    }
});
app.get('/api/essays', authMiddleware, async (req, res) => {
    const essays = await Essay.findAll({ where: { userId: req.user.id }, order: [['updatedAt', 'DESC']] });
    return res.json(essays);
});

// --- ROTA DE TRANSCRIÇÃO (PROXY) ---
// Recebe do Front (com Auth), manda pro Python, devolve pro Front
app.post('/api/transcribe', authMiddleware, upload.single('file'), async (req, res) => {
    const URL_PYTHON_TRANSCRICAO = 'http://localhost:5001/transcrever';

    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    try {
        // Criar formulário para enviar ao Python
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        console.log("Encaminhando imagem para o serviço de transcrição Python...");
        const responseIA = await fetch(URL_PYTHON_TRANSCRICAO, {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders()
            }
        });

        if (!responseIA.ok) {
            const erro = await responseIA.json();
            throw new Error(erro.error || 'Erro no serviço de IA');
        }

        const data = await responseIA.json();
        res.json(data);

    } catch (err) {
        console.error("Erro no proxy de transcrição:", err);
        res.status(500).json({ error: 'Falha ao transcrever imagem: ' + err.message });
    } finally {
        // Limpar arquivo temporário do Node
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (e) => { if(e) console.error("Erro ao apagar temp:", e); });
        }
    }
});

// --- ROTA DE CORREÇÃO (HÍBRIDA) ---
app.post('/api/essays', authMiddleware, async (req, res) => {
    // --- FUNCIONALIDADE 2: Receber 'topic' e 'content' ---
    const { title, topic, content } = req.body; 
    const URL_DA_SUA_IA = 'http://localhost:5001/prever'; 
    
    // (A chave de API interna)
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

    if (!INTERNAL_API_KEY) {
        console.error("Erro Crítico: INTERNAL_API_KEY não definida no Node.js");
        return res.status(500).json({ error: "Configuração interna do servidor em falta." });
    }

    try {
        // --- 1. Verificação de Duplicatas (Hashing de Conteúdo) ---
        const createHash = (text) => {
            return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
        };
        const hash = createHash(content);
        const existingEssay = await Essay.findOne({
            where: { contentHash: hash, userId: req.user.id }
        });
        if (existingEssay) {
            //return res.status(409).json({ error: 'Você já enviou esta redação anteriormente.' });
        }

        // --- 2. Chamar a IA (PYTHON HÍBRIDA) ---
        console.log("A chamar o micro-serviço de IA HÍBRIDO (BERT+LLM)...");
        const responseIA = await fetch(URL_DA_SUA_IA, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Internal-API-Key': INTERNAL_API_KEY 
            },
            // --- FUNCIONALIDADE 2: Enviar o 'tema' e o 'texto' ---
            body: JSON.stringify({ 
                tema_redacao: topic, 
                texto_redacao: content 
            })
        });
        
        // --- FUNCIONALIDADE 1: Tratar o erro do Guardrail ---
        if (responseIA.status === 422) {
            const erroIA = await responseIA.json();
            return res.status(422).json({ error: erroIA.erro });
        }
        if (!responseIA.ok) {
            const erroIA = await responseIA.json();
            console.error("Falha na API Python:", erroIA.erro);
            throw new Error(`O servidor de IA (Python) falhou: ${erroIA.erro}`);
        }

        const dataIA = await responseIA.json();
        const notaFinal = dataIA.nota_final;
        const feedback = dataIA.feedback;
        
        if (!feedback) {
             throw new Error('A IA (LLM) não retornou o objeto de feedback.');
        }
        
        console.log(`Nota recebida (BERT): ${notaFinal}`);
        console.log(`Feedback recebido (LLM): C1=${feedback.c1_nota}, C2=${feedback.c2_nota}...`);

        // --- 3. SALVAR TUDO NO BANCO (COM O TEMA) ---
        const essay = await Essay.create({ 
            title: title, 
            content: content, 
            topic: topic, // <-- SALVAR O TEMA
            userId: req.user.id,
            nota_final: notaFinal, 
            
            c1_nota: feedback.c1_nota,
            c1_feedback: feedback.c1_feedback,
            c2_nota: feedback.c2_nota,
            c2_feedback: feedback.c2_feedback,
            c3_nota: feedback.c3_nota,
            c3_feedback: feedback.c3_feedback,
            c4_nota: feedback.c4_nota,
            c4_feedback: feedback.c4_feedback,
            c5_nota: feedback.c5_nota,
            c5_feedback: feedback.c5_feedback,
            comentario_geral: feedback.comentario_geral,
            contentHash: hash
        });
        
        return res.status(201).json(essay);

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({ error: 'Esta redação já existe (conflito de hash).' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Erro ao salvar redação ou ao chamar a IA: ' + err.message });
    }
});
// (Fim da rota duplicada - esta é a única rota POST /api/essays)


app.get('/api/essays/:id', authMiddleware, async (req, res) => {
    const essay = await Essay.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!essay) return res.status(404).json({ error: 'Redação não encontrada' });
    return res.json(essay);
});

// (Nota: A rota PUT de "atualizar" ainda não chama a IA)
app.put('/api/essays/:id', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const essay = await Essay.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!essay) return res.status(44).json({ error: 'Redação não encontrada' });
    try {
        // (IDEALMENTE, DEVERÍAMOS CHAMAR A IA HÍBRIDA AQUI TAMBÉM)
        essay.title = title ?? essay.title;
        essay.content = content ?? essay.content;
        // (Falta recalcular a nota e o feedback aqui)
        await essay.save();
        return res.json(essay);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar redação' });
    }
});

app.delete('/api/essays/:id', authMiddleware, async (req, res) => {
    const essay = await Essay.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!essay) return res.status(404).json({ error: 'Redação não encontrada' });
    try {
        await essay.destroy();
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao apagar redação' });
    }
});

// --- 6. INICIAR O SERVIDOR ---
(async () => {
    try {
        await sequelize.authenticate();
        // O {alter: true} irá adicionar magicamente as novas colunas
        // (c1_nota, c1_feedback, etc.) ao seu banco dev.db
        await sequelize.sync({ alter: true }); 
        app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
    } catch (err) {
        console.error('Erro ao iniciar:', err);
        process.exit(1);
    }
})();