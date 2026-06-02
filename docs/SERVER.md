# Server — AutoENEM

Node.js + Express rodando na porta `3000`. Responsável por autenticação, gerenciamento de redações e intermediar a comunicação com a API Python.

---

## Como o server sobe (`server.js`)

```
Carrega variáveis de ambiente (.env)
    ↓
Cria o app Express com middlewares globais:
  - cors()          → permite requisições do front (localhost:5173)
  - express.json()  → lê body em JSON
  - cookieParser()  → lê cookies das requisições
    ↓
Registra as rotas:
  - /api/auth    → authRoutes
  - /api/essays  → essayRoutes
    ↓
Escuta na porta 3000
```

---

## Por que tem Supabase no front também?

O front tem um `supabaseClient.js`, mas ele é usado **em apenas um lugar**: o `AuthCallbackPage` — a página invisível que finaliza o login OAuth (Google, GitHub, etc).

Quando o usuário faz login com Google, o Supabase redireciona para `/auth/callback`. Nesse momento, o front precisa do cliente Supabase para pegar o token gerado pelo OAuth. Depois disso, manda esse token para o server Node.js, que valida e grava o cookie. **A partir daí, o Supabase some completamente do front** — toda comunicação passa pelo server.

A razão dessa separação é a chave usada em cada lado:

| | Chave | Permissão |
|---|---|---|
| **Front** | `anon key` (pública) | Acesso mínimo, só para OAuth |
| **Server** | `service role key` (secreta) | Acesso total ao banco e storage |

A `service role key` não pode ficar no front porque qualquer pessoa abriria o DevTools e a roubaria. Por isso ela fica só no server, dentro do `.env`.

---

## Autenticação — cookies HttpOnly

O server **não usa JWT no header** — usa **cookies HttpOnly**. O browser guarda e envia os cookies automaticamente em toda requisição, sem o front precisar fazer nada manualmente.

Quando o usuário loga, dois cookies são gravados:

| Cookie | O que armazena | Duração |
|---|---|---|
| `sb_access_token` | Token de acesso do Supabase | 1 hora |
| `sb_refresh_token` | Token para renovar a sessão | 30 dias |

O atributo `httpOnly` impede que o JavaScript do front leia esses cookies — só o server acessa. Isso protege contra ataques XSS onde um script malicioso tentaria roubar o token.

---

## Estrutura de pastas

```
server/
├── server.js                  → Ponto de entrada: configura e sobe o Express
├── package.json               → Dependências e scripts
├── .env                       → Variáveis de ambiente (não vai pro git)
│
└── src/
    ├── config/
    │   └── supabase.js        → Cria e exporta o cliente Supabase com a service role key
    │
    ├── middlewares/
    │   └── authMiddleware.js  → Valida o cookie de sessão antes de rotas protegidas
    │
    ├── routes/
    │   ├── authRoutes.js      → Define as rotas de /api/auth
    │   └── essayRoutes.js     → Define as rotas de /api/essays
    │
    ├── controllers/
    │   ├── AuthController.js  → Lógica de login, cadastro, OAuth, logout e deletar conta
    │   └── EssayController.js → Lógica de corrigir, listar, buscar, excluir e progresso
    │
    └── models/
        └── EssayModel.js      → Acesso direto ao Supabase (banco de dados e storage)
```

---

## `src/config/supabase.js`

Cria o cliente Supabase usando a `SUPABASE_SERVICE_ROLE_KEY` do `.env`. Essa chave tem acesso administrativo total — sem restrições de Row Level Security (RLS). É exportada como singleton e usada em todos os outros arquivos do server.

Se as variáveis de ambiente estiverem faltando, o server **lança um erro na inicialização** e não sobe.

---

## `src/middlewares/authMiddleware.js`

Intercepta toda requisição que chega em rotas protegidas antes do controller rodar.

```
Requisição chega
    ↓
Lê o cookie sb_access_token
    ↓
Sem cookie → retorna 401
    ↓
Valida com supabase.auth.getUser(token)
    ↓
Token inválido/expirado → retorna 401
    ↓
Token válido → coloca o usuário em req.user e passa para o controller
```

---

## `src/routes/authRoutes.js`

| Método | Rota | Protegida | O que faz |
|---|---|---|---|
| POST | `/api/auth/login` | Não | Login com email e senha |
| POST | `/api/auth/signup` | Não | Cadastro de nova conta |
| POST | `/api/auth/session` | Não | Recebe token do OAuth e grava cookies |
| GET | `/api/auth/me` | Sim | Retorna os dados do usuário logado |
| POST | `/api/auth/logout` | Não | Apaga os cookies de sessão |
| DELETE | `/api/auth/account` | Sim | Deleta a conta e todos os dados do usuário |

---

## `src/routes/essayRoutes.js`

Todas as rotas são protegidas pelo `authMiddleware`. O upload de imagem usa **multer** com armazenamento em memória (não salva em disco) e limite de 10MB, aceitando apenas arquivos de imagem.

> A rota `/progress` é declarada **antes** de `/:id` para evitar que a string `"progress"` seja interpretada como um UUID de redação pelo Express.

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/essays` | Lista todas as redações do usuário logado |
| POST | `/api/essays` | Corrige e salva uma nova redação |
| GET | `/api/essays/progress` | Retorna dados agregados de progresso do usuário |
| GET | `/api/essays/:id` | Busca uma redação específica pelo ID |
| DELETE | `/api/essays/:id` | Exclui uma redação e sua imagem |

---

## `src/controllers/AuthController.js`

Contém a lógica de cada rota de autenticação.

**`login`** — chama `supabase.auth.signInWithPassword` e grava os cookies no response.

**`signup`** — chama `supabase.auth.signUp` com email, senha e nome. Se o Supabase já retornar uma sessão, grava os cookies.

**`setSession`** — usado exclusivamente pelo OAuth. Recebe o `access_token` e `refresh_token` que o `AuthCallbackPage` do front capturou, valida com o Supabase e grava os cookies. É assim que o login com Google vira uma sessão em cookie.

**`me`** — simplesmente retorna `req.user`, que já foi preenchido pelo `authMiddleware`.

**`logout`** — apaga os dois cookies com `res.clearCookie`.

**`deleteAccount`** — sequência de 4 passos:
1. Lista e remove todas as imagens do usuário no Storage
2. Deleta todas as redações do banco
3. Deleta a conta no Supabase Auth com `supabase.auth.admin.deleteUser`
4. Apaga os cookies

---

## `src/controllers/EssayController.js`

Contém a lógica de cada rota de redação.

**`corrigirRedacao`** — o fluxo mais complexo do server:

```
Recebe: título, tema, texto, imagem (opcional)
    ↓
Valida campos obrigatórios e tamanho mínimo do texto (50 chars)
    ↓
Se tem imagem → faz upload para o Supabase Storage via EssayModel.uploadImage()
    ↓
Chama a API Python (localhost:5001/prever) com tema e texto
  → envia X-Internal-API-Key no header para autenticar
  → timeout de 2 minutos (a IA pode demorar)
    ↓
Recebe nota_final + feedback da Python
    ↓
Salva tudo no banco via EssayModel.save()
    ↓
Retorna o resultado para o front
```

A chamada para a Python tem tratamento de erro detalhado: se demorar mais de 2 minutos retorna 504 (timeout), se a Python estiver fora do ar retorna 503.

**`listarRedacoes`** — busca todas as redações do usuário ordenadas por data. Se alguma tiver imagem, gera uma URL assinada com validade de 1 hora para o front conseguir exibir.

**`buscarRedacao`** — busca uma redação pelo ID garantindo que ela pertence ao usuário logado (segurança: usuário A não acessa redação do usuário B).

**`excluirRedacao`** — busca a redação, remove a imagem do Storage se existir, depois deleta o registro do banco.

**`getProgress`** — agrega os dados de todas as redações do usuário e retorna:

```
Busca todos os essays com final_score, feedback_json e created_at
    ↓
Computa estatísticas globais:
  total, bestScore, avgScore, thisMonth
    ↓
Agrupa por ano-mês → calcula média mensal de nota geral e de cada competência (c1–c5)
    ↓
Para cada competência calcula avg geral e trend (último mês - penúltimo mês)
    ↓
Retorna { total, bestScore, avgScore, thisMonth, monthlyData, competencies }
```

---

## `src/models/EssayModel.js`

Camada de acesso ao banco de dados. Isola todas as queries do Supabase para que os controllers não falem diretamente com o banco.

| Método | O que faz |
|---|---|
| `uploadImage()` | Faz upload da imagem no bucket `essay-images` com path `userId/timestamp.ext` |
| `save()` | Insere uma nova redação na tabela `essays` |
| `findAllByUser()` | Busca todas as redações do usuário e gera URLs assinadas para imagens |
| `findByIdAndUser()` | Busca uma redação pelo ID e user_id (impede acesso cruzado) |
| `deleteImage()` | Remove uma imagem do Storage |
| `deleteByIdAndUser()` | Deleta uma redação do banco filtrando por ID e user_id |
| `getProgressData()` | Busca `final_score`, `feedback_json` e `created_at` de todas as redações do usuário para cálculo de progresso |

---

## Variáveis de ambiente (`server/.env`)

```
SUPABASE_URL=...               → URL do projeto no Supabase
SUPABASE_SERVICE_ROLE_KEY=...  → Chave secreta com acesso total (nunca expor)
INTERNAL_API_KEY=...           → Chave compartilhada com a API Python para autenticar chamadas internas
FRONTEND_URL=http://localhost:5173  → Origem permitida pelo CORS
```
