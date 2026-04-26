# RELATÓRIO DE ANÁLISE DA ARQUITETURA REACT — AutoEnem Frontend

---

## 1. RESUMO DA ARQUITETURA

### 1.1 Estrutura de Diretórios

```
front/src/
├── App.jsx                          # Componente raiz com definição de rotas
├── App.css                          # CSS legado do template Vite (NÃO importado)
├── index.css                        # Tailwind CSS v4 + tema customizado
├── main.jsx                         # Ponto de entrada (StrictMode, providers)
├── assets/
│   ├── hero.png
│   ├── react.svg                    # Asset legado do template Vite (provavelmente não usado)
│   └── vite.svg                     # Asset legado do template Vite (provavelmente não usado)
├── components/
│   ├── AuthModal.jsx                # Modal de login/signup + OAuth
│   ├── ProfileModal.jsx             # Modal de exibição do perfil do usuário
│   ├── ProtectedRoute.jsx           # Guarda de rota para páginas autenticadas
│   ├── layout/
│   │   └── PageShell.jsx            # Layout wrapper + AuthPromptContext
│   ├── landing/
│   │   ├── CompetenciaCard.jsx      # Card individual de competência ENEM
│   │   ├── CorrectionResult.jsx     # Exibição do resultado da correção
│   │   ├── DeleteConfirmModal.jsx   # Confirmação de exclusão de redação
│   │   ├── EssayForm.jsx            # Formulário principal de redação
│   │   ├── FloatingActions.jsx      # Botões flutuantes (nova/excluir)
│   │   ├── PageHeader.jsx           # Header com menu e perfil
│   │   └── SideMenu.jsx             # Menu lateral de navegação
│   ├── history/
│   │   ├── EssayCard.jsx            # Card de redação no histórico
│   │   ├── EssayDetailModal.jsx     # Modal de detalhes da redação
│   │   └── EssaySearchBar.jsx       # Barra de busca
│   └── settings/
│       ├── AccountActionsCard.jsx   # Botões de logout e deletar conta
│       ├── DeleteAccountModal.jsx   # Confirmação de exclusão de conta
│       └── ThemeSettingsCard.jsx    # Toggle de tema claro/escuro
├── hooks/
│   ├── useAuth.jsx                  # Context provider + hook de autenticação
│   ├── useLogout.js                 # Hook customizado de logout
│   └── useTheme.jsx                 # Context provider + hook de tema
├── lib/
│   ├── api.js                       # Constante com URL base da API
│   ├── essayDraft.js                # Utilitário para limpar rascunhos no localStorage
│   └── supabaseClient.js            # Inicialização do cliente Supabase
├── pages/
│   ├── AuthCallbackPage.jsx         # Handler de callback OAuth
│   ├── EssaysHistoryPage.jsx        # Página de histórico de redações
│   ├── LandingPage.jsx              # Página principal de correção
│   └── SettingsPage.jsx             # Página de configurações
└── utils/
    └── scoreColors.js               # Funções utilitárias de cores baseadas em notas
```

### 1.2 Stack Tecnológico

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19.2.5 | UI framework |
| React Router DOM | 7.14.2 | Roteamento SPA |
| Tailwind CSS | 4.2.4 | Estilização (via PostCSS) |
| Supabase JS | 2.104.0 | Autenticação OAuth (Google, GitHub) |
| Lucide React | 1.8.0 | Ícones |
| React Icons | 5.6.0 | Ícones adicionais (FaGoogle, FaGithub, etc.) |
| Vite | 8.0.9 | Build tool |

### 1.3 Padrões Arquiteturais Identificados

- **Context API** para estado global: `AuthContext` (useAuth), `ThemeContext` (useTheme), `AuthPromptContext` (PageShell)
- **Composição de componentes** com separação clara entre pages/components
- **forwardRef + useImperativeHandle** em LandingPage para expor método `reset`
- **localStorage** para persistência de rascunho e tema
- **Fetch API nativa** para todas as chamadas HTTP (sem axios ou similar)
- **Supabase OAuth** com fluxo popup + postMessage
- **Protected Routes** via wrapper component

---