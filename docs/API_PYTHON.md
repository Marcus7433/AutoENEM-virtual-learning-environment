# API Python — AutoENEM

Flask rodando na porta `5001`. Responsável por duas tarefas: **corrigir redações com IA** e **transcrever imagens de redações manuscritas**.

---

## Como a API sobe (`app.py`)

```
Carrega variáveis de ambiente (.env)
    ↓
Cria o app Flask com CORS liberado para localhost:5173
    ↓
Importa os módulos de correção e transcrição
  (o modelo BERT é carregado na memória nesse momento — pode demorar alguns segundos)
    ↓
Registra as rotas:
  - POST /prever      → correção de redação
  - POST /transcrever → transcrição de imagem
    ↓
Escuta na porta 5001
```

---

## Estrutura de pastas

```
api_python/
├── app.py                        → Ponto de entrada: servidor Flask, rotas e segurança
├── requirements.txt              → Dependências Python
├── .env                          → Variáveis de ambiente (não vai pro git)
├── uploads/                      → Pasta temporária de imagens (criada automaticamente)
│
└── modulosPython/
    ├── __init__.py               → Marca a pasta como pacote Python
    ├── config.py                 → Carrega .env, define chaves de API e configurações de upload
    ├── correcao.py               → Lógica de correção: BERT + Groq (llama-3.3-70b)
    └── transcricao.py            → Lógica de transcrição: Gemini 2.5 Flash
```

---

## Segurança (`app.py`)

### Chave interna (`X-Internal-API-Key`)

A rota `/prever` só aceita requisições que venham com a header `X-Internal-API-Key` correta. Essa chave é compartilhada entre o server Node.js e a API Python via `.env`. Isso garante que **só o server Node.js consegue pedir correções** — ninguém de fora consegue chamar a rota diretamente.

> A rota `/transcrever` não exige a chave interna porque é chamada diretamente pelo front.

### Detecção de Prompt Injection

Antes de processar qualquer texto, a API verifica se ele contém frases como `"ignore as instruções"`, `"system prompt"` ou `"ignore previous"`. Se detectar, rejeita com erro 422. Isso impede que um usuário malicioso tente manipular a IA através do campo de redação.

---

## Rota `POST /prever` — Correção de Redação

**Quem chama:** server Node.js (nunca o front diretamente)

**Recebe:**
```json
{
  "tema_redacao": "tema da redação",
  "texto_redacao": "texto completo da redação"
}
```

**Retorna:**
```json
{
  "nota_final": 720,
  "feedback": {
    "fuga_ao_tema": false,
    "c1_nota": 160, "c1_feedback": "...",
    "c2_nota": 160, "c2_feedback": "...",
    "c3_nota": 120, "c3_feedback": "...",
    "c4_nota": 160, "c4_feedback": "...",
    "c5_nota": 120, "c5_feedback": "...",
    "comentario_geral": "..."
  }
}
```

---

## Rota `POST /transcrever` — Transcrição de Imagem

**Quem chama:** front diretamente (porta 5001)

**Recebe:** `multipart/form-data` com o campo `image` ou `file` contendo a imagem da redação.

**Retorna:**
```json
{
  "transcricao": "texto extraído da imagem..."
}
```

O arquivo é salvo temporariamente na pasta `uploads/`, processado pelo Gemini e **deletado imediatamente** após a transcrição (tanto do disco local quanto da nuvem do Gemini).

---

## `modulosPython/config.py`

Carrega todas as variáveis do `.env` e centraliza as configurações usadas pelos outros módulos:

| Variável | O que é |
|---|---|
| `GROQ_API_KEY` | Chave da API Groq (usada na correção) |
| `GEMINI_API_KEY` | Chave da API Google Gemini (usada na transcrição) |
| `INTERNAL_API_KEY` | Chave interna compartilhada com o Node.js |
| `GROQ_MODEL` | Modelo usado: `llama-3.3-70b-versatile` |
| `MODELO_BERT_ID` | Modelo BERT do HuggingFace: `md43/meu-bert-enem-v1` |
| `GEMINI_MODEL` | Modelo Gemini: `gemini-2.5-flash` |
| `UPLOAD_FOLDER` | Pasta `uploads/` (criada automaticamente se não existir) |
| `ALLOWED_EXTENSIONS` | Formatos aceitos: png, jpg, jpeg, gif, webp, jfif |
| `MAX_CONTENT_LENGTH` | Limite de upload: 16MB |

---

## `modulosPython/correcao.py` — Como a correção funciona

A correção usa **dois modelos de IA em sequência**: primeiro o BERT para gerar uma nota de referência, depois o Groq (LLM) para gerar o feedback detalhado.

### Passo 1 — BERT (modelo local)

O BERT (`md43/meu-bert-enem-v1`) é um modelo treinado especificamente para avaliar redações do ENEM. Ele roda **localmente na sua máquina** (sem custo de API) e gera um score entre 0 e 1.

```
texto da redação → BERT → score (ex: 0.72)
    ↓
Converte para escala ENEM: 0.72 × 1000 = 720
    ↓
Arredonda para múltiplo de 40 (escala real do ENEM): 720
    ↓
"Nota Alvo" = 720
```

Essa nota alvo é passada para o Groq como referência, guiando o LLM a distribuir as notas das competências de forma consistente.

### Passo 2 — Groq / llama-3.3-70b (LLM na nuvem)

O Groq recebe o tema, o texto e a nota alvo do BERT. Um prompt de sistema detalhado instrui o modelo a agir como um corretor oficial do ENEM, avaliando as 5 competências:

| Competência | O que avalia |
|---|---|
| C1 | Domínio da norma culta (gramática, ortografia, pontuação) |
| C2 | Compreensão do tema e uso de repertório sociocultural |
| C3 | Organização e desenvolvimento da argumentação |
| C4 | Coesão textual (uso de conectivos) |
| C5 | Proposta de intervenção (agente, ação, meio, efeito, detalhamento) |

Cada competência recebe uma nota entre 0 e 200 (múltiplos de 40) e um feedback textual citando trechos reais da redação.

O LLM é forçado a retornar um **JSON puro** (`response_format: json_object`) com `temperature: 0.2` para respostas mais consistentes e menos aleatórias.

### Passo 3 — Validação com Pydantic

O JSON retornado pelo Groq é validado pelo **Pydantic** (`FeedbackEstruturado`). Isso garante que todos os campos obrigatórios existem e têm o tipo correto antes de retornar para o Node.js. Se o JSON vier mal formatado, a API retorna um feedback de erro genérico em vez de quebrar.

### Passo 4 — Nota final

```
nota_final = c1_nota + c2_nota + c3_nota + c4_nota + c5_nota
```

Se o LLM detectar fuga total ao tema (`fuga_ao_tema: true`), a nota final é zerada independente das competências.

### Fluxo completo

```
tema + texto chegam no /prever
    ↓
BERT avalia o texto → gera nota alvo (0–1000, múltiplo de 40)
    ↓
Groq recebe tema + texto + nota alvo
    ↓
LLM retorna JSON com notas e feedbacks das 5 competências
    ↓
Pydantic valida o JSON
    ↓
Calcula nota_final = soma das 5 competências
    ↓
Retorna nota_final + feedback para o Node.js
```

---

## `modulosPython/transcricao.py` — Como a transcrição funciona

Usa o **Gemini 2.5 Flash** do Google para extrair texto de imagens de redações manuscritas.

O ponto mais importante do prompt de transcrição: o Gemini é instruído a **preservar os erros do aluno** — ortografia errada, falta de acento, pontuação incorreta. Isso é intencional: o texto transcrito vai ser corrigido pela IA de correção, e corrigir os erros antes destruiria a avaliação pedagógica.

### Fluxo

```
Imagem chega no /transcrever
    ↓
Salva temporariamente em uploads/
    ↓
Detecta o MIME type da imagem (png, jpg, webp, etc.)
    ↓
Faz upload da imagem para os servidores do Gemini
    ↓
Gemini extrai o texto preservando os erros do aluno
    ↓
Deleta o arquivo local (uploads/) e o arquivo na nuvem do Gemini
    ↓
Retorna o texto transcrito
```

A limpeza acontece no bloco `finally`, garantindo que o arquivo é deletado **mesmo se ocorrer um erro** durante a transcrição.

---

## Dependências (`requirements.txt`)

| Pacote | Para que serve |
|---|---|
| `flask` | Framework web da API |
| `flask-cors` | Libera requisições do front (CORS) |
| `python-dotenv` | Carrega o arquivo `.env` |
| `transformers` | Carrega e roda o modelo BERT localmente |
| `torch` | Motor de execução do BERT (PyTorch) |
| `huggingface-hub` | Baixa o modelo BERT do HuggingFace |
| `groq` | Cliente oficial da API Groq |
| `pydantic` | Valida o JSON retornado pelo LLM |
| `accelerate` | Otimiza a execução do BERT |
| `google-genai` | Cliente oficial da API Google Gemini |

---

## Variáveis de ambiente (`api_python/.env`)

```
INTERNAL_API_KEY=...   → Mesma chave do server Node.js (autentica chamadas internas)
GROQ_API_KEY=...       → Chave da API Groq para o llama-3.3-70b
GEMINI_API_KEY=...     → Chave da API Google Gemini para transcrição
```
