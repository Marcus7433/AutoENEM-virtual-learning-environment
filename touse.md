# AutoEnem - Como Rodar o Projeto

O projeto possui **3 servidores** que precisam rodar simultaneamente.

## Pré-requisitos

- **Node.js** (v18+)
- **Python** (3.10+)
- **npm**

---

## 1. Instalar Dependências

### Front-end (React + Vite)
```bash
cd front
npm install
```

### Back-end Node.js (Express)
```bash
cd server
npm install
```

### API Python (Flask)
```bash
cd api_python
pip install -r requirements.txt
```

---

## 2. Variáveis de Ambiente

### `front/.env`
```
VITE_SUPABASE_URL=<sua_url_supabase>
VITE_SUPABASE_ANON_KEY=<sua_anon_key>
```

### `server/.env`
```
SUPABASE_URL=<sua_url_supabase>
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>
INTERNAL_API_KEY=<chave_interna_compartilhada_com_python>
FRONTEND_URL=http://localhost:5173
```

### `api_python/.env`
```
INTERNAL_API_KEY=<mesma_chave_do_server_node>
GROQ_API_KEY=<sua_chave_groq>
GEMINI_API_KEY=<sua_chave_gemini>
```

---

## 3. Rodar os Servidores

Abra **3 terminais** diferentes e execute um em cada:

### Terminal 1 - Front-end (porta 5173)
```bash
cd front
npm run dev
```

### Terminal 2 - Back-end Node.js (porta 3000)
```bash
cd server
npm start
```

### Terminal 3 - API Python (porta 5001)
```bash
cd api_python
python app.py
```

---

## 4. Acessar

- **Front-end:** http://localhost:5173
- **API Node.js:** http://localhost:3000
- **API Python:** http://localhost:5001

---

## Estrutura do Projeto

```
AutoEnem/
├── front/                      → React + Vite + TailwindCSS (UI)
│   └── src/
│       ├── pages/              → LandingPage, EssaysHistoryPage, SettingsPage
│       ├── components/         → AuthModal, ProfileModal, layout/, landing/, history/, settings/
│       ├── hooks/              → useAuth, useTheme, useLogout, useAuthPrompt
│       └── lib/                → supabaseClient, api.js, essayDraft.js
├── server/                     → Node.js + Express (autenticação, rotas de redação)
│   └── src/
│       ├── routes/             → authRoutes.js, essayRoutes.js
│       ├── controllers/        → AuthController.js, EssayController.js
│       ├── models/             → EssayModel.js
│       ├── middlewares/        → authMiddleware.js
│       └── config/             → supabase.js
└── api_python/                 → Flask + IA (correção de redação, transcrição OCR)
    └── modulosPython/
        ├── config.py           → chaves de API e configurações (modelos: llama-3.3-70b, gemini-2.5-flash, BERT)
        ├── correcao.py         → lógica de correção de redação
        └── transcricao.py      → OCR via Gemini
```

## Fluxo

1. O **front** faz autenticação via **Supabase** e chama o **server Node.js**
2. O **server Node.js** gerencia usuários e redações no banco
3. Para correção de redação, o **server Node.js** chama a **API Python**
4. A **API Python** usa Groq/Gemini para corrigir e transcrever redações
