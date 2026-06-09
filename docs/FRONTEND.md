# Frontend — AutoENEM

Stack: **React + Vite + TailwindCSS + recharts + @react-pdf/renderer**. Roda na porta `5173`.

---

## Como o app sobe (`main.jsx`)

O ponto de entrada monta a árvore de providers na seguinte ordem:

```
BrowserRouter         → habilita roteamento via URL
  AuthProvider        → disponibiliza o usuário logado para o app todo
    ThemeProvider     → disponibiliza o tema (claro/escuro) para o app todo
      App             → define as rotas
```

Tudo que está dentro desses providers pode usar os hooks `useAuth()` e `useTheme()`.

---

## Rotas (`App.jsx`)

| URL | Página | Quem pode acessar |
|---|---|---|
| `/` | `LandingPage` | Qualquer pessoa |
| `/historico` | `EssaysHistoryPage` | Apenas usuários logados |
| `/progresso` | `ProgressPage` | Apenas usuários logados |
| `/configuracoes` | `SettingsPage` | Qualquer pessoa |
| `/auth/callback` | `AuthCallbackPage` | Callback interno do OAuth |
| qualquer outra | redireciona para `/` | — |

---

## Fluxo principal — Correção de Redação

```
Usuário digita tema + texto (salvo automaticamente no localStorage)
    ↓
Clica "Corrigir"
    ↓
Se não estiver logado → abre modal de login
    ↓
POST localhost:3000/api/essays  (FormData: tema, texto, imagem opcional)
    ↓
Server Node.js salva no Supabase e chama a API Python internamente
    ↓
Retorna feedback → exibe resultado na tela
```

## Fluxo — Transcrição de Imagem

```
Clica "Transcrever imagem"
    ↓
Se não estiver logado → abre modal de login
    ↓
Abre seletor de arquivo
    ↓
POST localhost:3000/api/essays/transcrever  (passa pelo Node.js)
    ↓
Node.js faz proxy para a API Python (localhost:5001/transcrever)
    ↓
Texto extraído preenchido automaticamente no campo de redação
```

> A transcrição passa pelo Express (porta 3000), que autentica o usuário via `authMiddleware` antes de repassar para o Flask. O front nunca fala diretamente com a porta 5001.

## Fluxo — Autenticação OAuth

```
Usuário clica em "Entrar com Google" (ou similar)
    ↓
Abre popup com URL do Supabase OAuth
    ↓
Supabase redireciona para /auth/callback
    ↓
AuthCallbackPage pega o token e envia para POST localhost:3000/api/auth/session
    ↓
Server Node.js cria o cookie de sessão
    ↓
Popup envia mensagem AUTH_SUCCESS para a janela principal e fecha
    ↓
useAuth() detecta a mensagem e atualiza o usuário logado
```

---

## Estrutura de pastas

```
front/
├── public/                  → Arquivos estáticos servidos diretamente
│   ├── favicon.svg
│   ├── essayicon.png
│   └── essayicon.svg
│
├── src/
│   ├── main.jsx             → Ponto de entrada: monta providers e renderiza o app
│   ├── App.jsx              → Define todas as rotas da aplicação
│   ├── index.css            → Estilos globais e configuração do Tailwind
│   │
│   ├── pages/               → Uma pasta por tela do app
│   │   ├── LandingPage.jsx          → Tela principal: formulário de redação e resultado
│   │   ├── EssaysHistoryPage.jsx    → Histórico de redações com busca e filtros
│   │   ├── ProgressPage.jsx         → Tela "Meu Progresso": evolução e competências
│   │   ├── SettingsPage.jsx         → Configurações (tema, logout, deletar conta)
│   │   └── AuthCallbackPage.jsx     → Página invisível que finaliza o login OAuth
│   │
│   ├── components/          → Componentes reutilizáveis
│   │   ├── AuthModal.jsx            → Modal de login/cadastro (suporta dark mode, fecha ao clicar fora)
│   │   ├── ProfileModal.jsx         → Modal com dados do perfil e botão de logout
│   │   ├── ProtectedRoute.jsx       → Bloqueia rotas para usuários não logados
│   │   ├── EssayPDF.jsx             → Documento PDF gerado pelo @react-pdf/renderer (tema, redação, nota, C1–C5)
│   │   │
│   │   ├── layout/
│   │   │   └── PageShell.jsx        → Wrapper de layout: entrega header, menu e modais para todas as páginas
│   │   │
│   │   ├── landing/                 → Componentes exclusivos da LandingPage
│   │   │   ├── EssayForm.jsx            → Formulário com campos de tema, texto e upload de imagem
│   │   │   ├── CorrectionResult.jsx     → Exibe o resultado da correção (notas e feedback por competência) + botão exportar PDF
│   │   │   ├── CompetenciaCard.jsx      → Card individual de cada competência do ENEM
│   │   │   ├── FloatingActions.jsx      → Botões flutuantes "Nova redação" e "Excluir" após correção
│   │   │   ├── PageHeader.jsx           → Barra do topo com logo, menu hamburguer e botão de perfil
│   │   │   ├── SideMenu.jsx             → Menu lateral deslizante com navegação
│   │   │   └── DeleteConfirmModal.jsx   → Modal de confirmação antes de excluir uma redação
│   │   │
│   │   ├── history/                 → Componentes exclusivos do histórico
│   │   │   ├── EssayCard.jsx            → Card de uma redação na listagem do histórico
│   │   │   ├── EssayDetailModal.jsx     → Modal com feedback completo de uma redação do histórico
│   │   │   └── EssaySearchBar.jsx       → Busca por tema + dropdown de filtros (Data e Nota)
│   │   │
│   │   ├── progress/                → Componentes exclusivos da tela Meu Progresso
│   │   │   ├── StatsGrid.jsx            → Grid dos 4 cards de resumo (total, média, melhor, mês)
│   │   │   ├── StatsCard.jsx            → Card individual de estatística
│   │   │   ├── AlertBanners.jsx         → Banners de progresso (verde) e atenção (laranja)
│   │   │   ├── OverallScoreCard.jsx     → Card da nota média geral com gráfico
│   │   │   ├── OverallChart.jsx         → LineChart (recharts) da evolução mensal geral
│   │   │   ├── CompetenciesGrid.jsx     → Grid das 5 competências com título da seção
│   │   │   └── CompetencyProgressCard.jsx → Card de competência com nota, tendência e mini gráfico
│   │   │
│   │   └── settings/                → Componentes exclusivos das configurações
│   │       ├── ThemeSettingsCard.jsx    → Card para alternar entre tema claro e escuro
│   │       ├── AccountActionsCard.jsx   → Card com botões de logout e deletar conta
│   │       └── DeleteAccountModal.jsx   → Modal de confirmação antes de deletar a conta
│   │
│   ├── hooks/               → Lógica reutilizável entre componentes
│   │   ├── useAuth.jsx          → Estado global do usuário logado; bate em /api/auth/me para verificar sessão
│   │   ├── useTheme.jsx         → Estado global do tema claro/escuro; persiste no localStorage
│   │   ├── useAuthPrompt.js     → Contexto que expõe a função openAuth() para qualquer componente filho do PageShell
│   │   └── useLogout.js         → Faz POST /api/auth/logout, limpa rascunho e redireciona para /
│   │
│   ├── lib/                 → Utilitários e integrações externas
│   │   ├── api.js               → Exporta a constante API com a URL base do server Node.js (localhost:3000)
│   │   ├── supabaseClient.js    → Cria e exporta o cliente Supabase (usado apenas no AuthCallbackPage)
│   │   └── essayDraft.js        → Função clearEssayDraft() que limpa o rascunho salvo no localStorage
│   │
│   └── utils/
│       └── scoreColors.js       → Funções utilitárias de cor por faixa de pontuação: totalColor, totalColorHex, compColor, compColorHex, compBadge, compBar, getDica
│
├── index.html               → HTML base onde o React é injetado
├── vite.config.js           → Configuração do Vite (bundler)
├── postcss.config.js        → Configuração do PostCSS (necessário para o Tailwind)
├── eslint.config.js         → Regras de linting do projeto
├── package.json             → Dependências e scripts npm
└── .gitignore               → Arquivos ignorados pelo git (node_modules, dist, etc.)
```

---

## localStorage — o que é salvo

| Chave | O que armazena |
|---|---|
| `autoenem_topic` | Tema da redação em andamento |
| `autoenem_essay` | Texto da redação em andamento |
| `autoenem_feedback` | Resultado da última correção |
| `autoenem_theme` | Preferência de tema (`light` ou `dark`) |

O rascunho (tema + texto + feedback) é limpo automaticamente ao clicar em "Nova redação".

---

## Variáveis de ambiente (`front/.env`)

```
VITE_SUPABASE_URL=...        → URL do projeto no Supabase
VITE_SUPABASE_ANON_KEY=...   → Chave pública do Supabase (anon/publishable)
```

> Variáveis com prefixo `VITE_` são expostas no browser. Nunca coloque chaves secretas aqui.
