import os
import json
import re
import mimetypes # Para a Transcrição
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename # Para a Tanscrição
from transformers import pipeline
from functools import wraps
from dotenv import load_dotenv

# --- IMPORTAÇÕES GOOGLE GENAI (Para Trancrição) ---
from google import genai
from google.genai import types
from google.genai.errors import APIError

# --- NOVAS IMPORTAÇÕES (Groq + Pydantic) ---
from groq import Groq
from pydantic import BaseModel, Field, ValidationError
from typing import Optional

# --- 0. Configurar Chaves ---
load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GROQ_API_KEY:
    print("ALERTA: 'GROQ_API_KEY' não encontrada no .env")
if not INTERNAL_API_KEY:
    print("ALERTA: 'INTERNAL_API_KEY' não encontrada no .env")
if not GEMINI_API_KEY:
    print("ALERTA: 'GEMINI_API_KEY' não encontrada no .env (Necessária para transcrição)")

# --- 1. Inicializar Cliente Groq ---
try:
    client_groq = Groq(api_key=GROQ_API_KEY)
    # Llama 3.3 é excelente, mas o 3.1 70b também serve
    GROQ_MODEL = "llama-3.3-70b-versatile" 
    print(f"Cliente Groq conectado! Usando modelo: {GROQ_MODEL}")
except Exception as e:
    print(f"--- ERRO AO CONECTAR COM GROQ ---: {e}")
    client_groq = None

# Cliente Gemini (NOVO - Para Transcrição)
try:
    client_gemini = genai.Client(api_key=GEMINI_API_KEY)
    print("Cliente Gemini conectado para transcrição!")
except Exception as e:
    print(f"--- ERRO AO CONECTAR COM GEMINI ---: {e}")
    client_gemini = None

# Configurações de Upload
mimetypes.add_type('image/webp', '.webp')
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'jfif'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- 2. Carregar o Modelo BERT (Local) ---
print("Carregando modelo BERT 'md43/meu-bert-enem-v1'...")
MODELO_BERT_ID = "md43/meu-bert-enem-v1"
try:
    avaliador_bert = pipeline("text-classification", model=MODELO_BERT_ID, device=-1)
    print("BERT carregado com sucesso!")
except Exception as e:
    print(f"Erro no BERT: {e}")
    def avaliador_bert(text, **kwargs): return [{'score': 0.5}]

# --- 3. DEFINIÇÃO DO SCHEMA (PYDANTIC) ---
class FeedbackEstruturado(BaseModel):
    fuga_ao_tema: bool = Field(description="True se o texto fugiu totalmente ao tema")
    
    # Usamos valores padrão (0 ou string vazia) para evitar crash se o LLM falhar
    c1_nota: int = 0
    c2_nota: int = 0
    c3_nota: int = 0
    c4_nota: int = 0
    c5_nota: int = 0
    
    c1_feedback: str = "Sem feedback."
    c2_feedback: str = "Sem feedback."
    c3_feedback: str = "Sem feedback."
    c4_feedback: str = "Sem feedback."
    c5_feedback: str = "Sem feedback."
    
    comentario_geral: str = "Sem comentários."

# --- 4. PROMPTS ---

# O segredo aqui é dar o EXEMPLO EXATO do JSON no prompt
# --- 4. PROMPTS (ATUALIZADO E MELHORADO) ---

PROMPT_SISTEMA = """
Você é um Corretor Especialista Oficial do ENEM (Brasil).
Sua tarefa é corrigir uma redação dissertativo-argumentativa com rigor técnico, mas didática extrema.

### DIRETRIZES DE FEEDBACK (OBRIGATÓRIO):
1.  *CITE O TEXTO:* Ao apontar um erro ou um acerto, você DEVE citar trechos exatos da redação entre aspas. Ex: "Ao escrever 'as pessoa', houve erro de concordância."
2.  *JUSTIFIQUE A NOTA:* Explique por que a nota foi atribuída baseando-se nos níveis da Matriz de Referência do ENEM (0, 40, 80, 120, 160, 200).
3.  *SEJA CONSTRUTIVO:* Sugira como melhorar o parágrafo ou o argumento.

### CRITÉRIOS POR COMPETÊNCIA:
- *C1 (Norma Culta):* Aponte erros específicos de crase, vírgula, concordância, ortografia e problemas de construção sintática (truncamento/justaposição).
- *C2 (Tema e Repertório):* Verifique se o texto é dissertativo-argumentativo. Avalie se usou repertório sociocultural (livros, filmes, leis) e se ele foi *legitimado, pertinente e produtivo* (bem conectado à discussão).
- *C3 (Argumentação):* Avalie o "Projeto de Texto". Os argumentos são desenvolvidos ou apenas listados? Há autoria e senso crítico? Aponte onde a argumentação ficou superficial.
- *C4 (Coesão):* Avalie o uso de conectivos (operadores argumentativos). Há repetição de palavras? O texto flui bem entre parágrafos?
- *C5 (Proposta de Intervenção):* Verifique obrigatoriamente os 5 ELEMENTOS: Agente, Ação, Meio/Modo, Efeito e Detalhamento. Aponte qual faltou.

### REGRA DE SEGURANÇA E FORMATO:
- Se houver *FUGA TOTAL AO TEMA*, marque "fuga_ao_tema": true e zere todas as notas.
- Retorne APENAS um JSON PLANO (sem aninhamento). Não use chaves como "feedback" ou "response".

FORMATO OBRIGATÓRIO DE SAÍDA (JSON):
{
  "fuga_ao_tema": false,
  "c1_nota": 160,
  "c1_feedback": "Nota 160 pois apresentou poucos desvios. Atenção ao trecho '...' onde faltou crase. Sugestão: ...",
  "c2_nota": 200,
  "c2_feedback": "Excelente uso do repertório 'Modernidade Líquida' de Bauman, que foi produtivo para sustentar a tese...",
  "c3_nota": 120,
  "c3_feedback": "Argumentação mediana. No segundo parágrafo, você cita o problema mas não explica suas causas a fundo. O trecho '...' ficou expositivo.",
  "c4_nota": 160,
  "c4_feedback": "Bom uso de conectivos como 'Portanto' e 'Ademais'. Evite repetir a palavra 'sociedade' tantas vezes.",
  "c5_nota": 160,
  "c5_feedback": "Proposta boa, mas incompleta. Você apresentou Agente (Governo), Ação (criar leis) e Efeito (melhorar), mas faltou o Detalhamento de como isso será feito.",
  "comentario_geral": "Uma redação sólida com bom domínio do tema. Para alcançar a nota 1000, foque em detalhar mais a intervenção e aprofundar a análise crítica no desenvolvimento."
}
"""

# --- 5. SERVIDOR FLASK ---
app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def require_internal_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.headers.get('X-Internal-API-Key') == INTERNAL_API_KEY:
            return f(*args, **kwargs)
        return jsonify({"erro": "Acesso não autorizado."}), 403
    return decorated_function

def check_prompt_injection(text):
    if not text: return False
    keywords = ["ignore as instruções", "system prompt", "ignore previous"]
    return any(k in text.lower() for k in keywords)

# --- 6. FUNÇÃO DE CHAMADA GROQ (BLINDADA) ---
def chamar_groq(tema, texto, nota_alvo):
    if not client_groq:
        raise Exception("Cliente Groq não inicializado.")

    prompt_usuario = f"""
    Tema: "{tema}"
    Nota Alvo: {nota_alvo}
    Texto:
    '''
    {texto}
    '''
    """

    try:
        completion = client_groq.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": PROMPT_SISTEMA},
                {"role": "user", "content": prompt_usuario}
            ],
            temperature=0.2, # Baixa temperatura para ser mais rígido no JSON
            response_format={"type": "json_object"}
        )

        json_str = completion.choices[0].message.content
        dados = json.loads(json_str)
        
        # --- CORREÇÃO DE ANINHAMENTO (A "Blindagem") ---
        # Se o LLM colocar o resultado dentro de uma chave "feedback", nós tiramos de lá.
        if "feedback" in dados and isinstance(dados["feedback"], dict):
            print("Aviso: LLM aninhou o JSON. Corrigindo...")
            dados = dados["feedback"]
        elif "response" in dados and isinstance(dados["response"], dict):
             dados = dados["response"]

        # Validação Pydantic
        feedback_validado = FeedbackEstruturado(**dados)
        
        return feedback_validado.model_dump()

    except ValidationError as ve:
        print(f"Erro de Validação Pydantic: {ve}")
        # Retorno de emergência estruturado
        return {
            "fuga_ao_tema": False,
            "c1_nota": int(nota_alvo/5), "c1_feedback": "Erro na formatação da IA.",
            "c2_nota": int(nota_alvo/5), "c2_feedback": "Erro na formatação da IA.",
            "c3_nota": int(nota_alvo/5), "c3_feedback": "Erro na formatação da IA.",
            "c4_nota": int(nota_alvo/5), "c4_feedback": "Erro na formatação da IA.",
            "c5_nota": int(nota_alvo/5), "c5_feedback": "Erro na formatação da IA.",
            "comentario_geral": "A IA avaliou o texto mas falhou ao formatar a tabela de notas. Tente novamente."
        }
    except Exception as e:
        print(f"Erro Geral Groq: {e}")
        return {
            "fuga_ao_tema": False,
            "c1_nota": 0, "c1_feedback": "Erro técnico.",
            "c2_nota": 0, "c2_feedback": "Erro técnico.",
            "c3_nota": 0, "c3_feedback": "Erro técnico.",
            "c4_nota": 0, "c4_feedback": "Erro técnico.",
            "c5_nota": 0, "c5_feedback": "Erro técnico.",
            "comentario_geral": f"Erro técnico na IA: {str(e)}"
        }

# --- 7. ENDPOINT /prever /transcrever ---
@app.route("/prever", methods=["POST"])
@require_internal_key
def prever():
    try:
        dados = request.get_json()
        texto = dados.get('texto_redacao')
        tema = dados.get('tema_redacao')

        if check_prompt_injection(texto) or check_prompt_injection(tema):
            return jsonify({"erro": "Prompt Injection detectado."}), 422

        if not texto or len(texto) < 50:
             return jsonify({"nota_final": 0, "feedback": {"comentario_geral": "Texto muito curto."}}), 200

        # 1. BERT
        res_bert = avaliador_bert(texto, truncation=True, max_length=512)[0]
        nota_bert = float(max(0, min(1000, res_bert['score'] * 1000)))
        nota_alvo = round(nota_bert / 40.0) * 40
        print(f"Nota BERT: {nota_bert:.0f} -> Alvo: {nota_alvo}")

        # 2. GROQ (LLM)
        feedback_dict = chamar_groq(tema, texto, nota_alvo)

        # 3. Calcular Nota Final
        nota_final_real = (
            feedback_dict['c1_nota'] + 
            feedback_dict['c2_nota'] + 
            feedback_dict['c3_nota'] + 
            feedback_dict['c4_nota'] + 
            feedback_dict['c5_nota']
        )
        
        if feedback_dict['fuga_ao_tema']:
            nota_final_real = 0

        return jsonify({
            "nota_final": nota_final_real,
            "feedback": feedback_dict
        })

    except Exception as e:
        print(f"Erro 500: {e}")
        return jsonify({"erro": str(e)}), 500
    
# --- NOVA ROTA DE TRANSCRIÇÃO ---
@app.route('/transcrever', methods=['POST'])
def transcrever_imagem():
    if not client_gemini:
        return jsonify({'error': 'Erro config Gemini. Verifique .env'}), 500
        
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado.'}), 400
    
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Arquivo inválido.'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # --- 1. DETECÇÃO ROBUSTA DE MIME TYPE ---
    mime_type, _ = mimetypes.guess_type(filepath)

    if not mime_type:
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        tipo_map = {
            'webp': 'image/webp',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'jfif': 'image/jpeg',
            'gif': 'image/gif',
            'bmp': 'image/bmp'
        }
        mime_type = tipo_map.get(ext, 'image/jpeg')

    uploaded_file = None
    transcricao = ""
    
    try:
        print(f">>> [INFO] Enviando {filename} ({mime_type}) para o Gemini...")
        with open(filepath, "rb") as f:
            uploaded_file = client_gemini.files.upload(
                file=f,
                config={'mime_type': mime_type, 'display_name': filename}
            )
        
        # Prompt vindo do seu primeiro projeto
        prompt = """
        Atue como um transcritor fiel para fins de correção pedagógica de redações.
        
        OBJETIVO: Transcrever o texto para formato digital, facilitando a leitura mas PRESERVANDO OS ERROS para avaliação.
        
        DIRETRIZES DE TRANSCRIÇÃO:
        1. DECIFRAÇÃO INTELIGENTE: A caligrafia pode ser ruim. Use o contexto para entender qual palavra o aluno tentou escrever (não escreva palavras aleatórias só porque parece um garrancho).
        
        2. FIDELIDADE AOS ERROS (CRUCIAL): 
           - Se o aluno escreveu a palavra com ortografia errada (ex: "caza", "exessão"), MANTENHA O ERRO. Não corrija.
           - Se faltou acento ou crase, MANTENHA A FALTA.
           - Se a pontuação está errada ou ausente, MANTENHA COMO ESTÁ.
           
        3. FORMATAÇÃO:
           - IGNORAR CABEÇALHO: Não transcreva nomes, turmas soltos no topo da folha.
           -IGNORAR TITULOS: Se houver título, ignore-o, as vezes os alunos escrevem títulos junto ao conteúdo da redação no início, saiba diferenciar o título do restante da redação.
           - TEXTO CORRIDO: Junte as linhas para formar parágrafos contínuos. Só quebre linha quando houver um novo parágrafo visual na folha.
           - HÍFENS: Se uma palavra foi separada no final da linha (ex: "ca-" + "sa"), junte-a ("casa"). Se o aluno separou errado (ex: "cas-" + "a"), junte mas mantenha a grafia.
           - IDENTAÇÃO: Insira uma tabulação (ou 4 espaços) no início de cada novo parágrafo para marcar visualmente a estrutura.

        Retorne APENAS o texto transcrito.
        """
        print(">>> [INFO] Solicitando geração de conteúdo ao Gemini...")
        response = client_gemini.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, uploaded_file],
        )
        
# Verifica se o Gemini bloqueou a resposta (ex: achou que era conteúdo impróprio)
        if not response.text:
             reason = "Desconhecido"
             if response.candidates and response.candidates[0].finish_reason:
                 reason = response.candidates[0].finish_reason
             
             print(f">>> [DEBUG] O Gemini bloqueou a resposta. Motivo: {reason}")
             transcricao = f"[Erro: A IA não conseguiu transcrever. Motivo do bloqueio: {reason}]"
        else:
             transcricao = response.text
             print(">>> [SUCESSO] Transcrição concluída!")
        
    except Exception as e:
        print(f">>> [ERRO CRÍTICO] Falha na transcrição: {e}")
        transcricao = f"Erro na transcrição: {e}"
    finally:
        if os.path.exists(filepath): os.remove(filepath)
        if uploaded_file: 
            try: client_gemini.files.delete(name=uploaded_file.name)
            except: pass
        
    return jsonify({'transcricao': transcricao})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)