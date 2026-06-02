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

## Ver a Estrutura do Projeto

- [Frontend (React + Vite)](./FRONTEND.md)
- [Server (Node.js + Express)](./SERVER.md)
- [API Python (Flask + IA)](./API_PYTHON.md)

