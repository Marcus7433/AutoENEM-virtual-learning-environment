# AutoENEM — Plataforma de Correção de Redações

Plataforma web para correção automatizada de redações com base nos critérios oficiais do ENEM. O aluno envia o texto (digitado ou por foto), recebe nota geral, pontuação por competência, feedback detalhado e acompanha sua evolução ao longo do tempo.

---

## Funcionalidades

- **Correção automática** por IA (BERT + LLM Groq/llama-3.3-70b)
- **Transcrição de imagem** — envie uma foto da redação manuscrita (Gemini 2.5 Flash)
- **Feedback por competência** — avaliação individual das 5 competências do ENEM
- **Histórico de redações** com busca por tema e filtros de data/nota
- **Meu Progresso** — gráficos de evolução mensal geral e por competência
- **Autenticação** com email/senha, Google e GitHub (OAuth via Supabase)
- **Tema claro/escuro**

---

## Arquitetura

O projeto é dividido em **3 servidores independentes** que rodam simultaneamente:

```
Usuário
  │
  ▼
Front-end (React + Vite — porta 5173)
  │  autenticação e redações
  ▼
Server Node.js (Express — porta 3000)
  │  armazenamento (Supabase) e correção
  ▼
API Python (Flask — porta 5001)
  │  modelo BERT + Groq + Gemini
  ▼
Supabase (banco de dados + storage + auth)
```

---

## Stack

| Camada | Tecnologias |
|---|---|
| **Front-end** | React 19, Vite, Tailwind CSS 4, React Router 7, recharts, Lucide React |
| **Server** | Node.js, Express, Supabase JS, multer, cookie-parser |
| **API Python** | Flask, BERT (HuggingFace), Groq llama-3.3-70b, Gemini 2.5 Flash, Pydantic |
| **Banco de dados** | Supabase (PostgreSQL + Storage) |

---

## Como rodar

Consulte o guia completo em [`docs/touse.md`](./docs/touse.md).

Em resumo: instale as dependências dos 3 servidores, configure os `.env` e rode cada servidor em um terminal separado.

---

## Documentação técnica

| Documento | Descrição |
|---|---|
| [`docs/FRONTEND.md`](./docs/FRONTEND.md) | Rotas, componentes, hooks, fluxos e estrutura do front |
| [`docs/SERVER.md`](./docs/SERVER.md) | Rotas da API, controllers, model e autenticação por cookie |
| [`docs/API_PYTHON.md`](./docs/API_PYTHON.md) | Pipeline de correção (BERT + Groq) e transcrição (Gemini) |

---

## Padrões do projeto

- **Context API** para estado global — `AuthContext`, `ThemeContext`, `AuthPromptContext`
- **Separação pages / components** — páginas orquestram, componentes apresentam
- **Cookies HttpOnly** para sessão — sem JWT no header, sem token no front
- **scoreColors.js** como fonte única da lógica de cores por faixa de nota
- **Fetch API nativa** para todas as chamadas HTTP
- **Protected Routes** via wrapper component
- **localStorage** para rascunho de redação e preferência de tema
