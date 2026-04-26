"""
=========================================================
ARQUIVO: correcao.py
DESCRIÇÃO: Módulo especialista na avaliação de redações.
Contém a lógica de Inteligência Artificial para correção,
integrando o modelo BERT (local) para gerar a nota base e 
o LLM via Groq para análise detalhada, gerando o feedback.
Também define os prompts e a validação de dados (Pydantic).
=========================================================
"""

import json
from transformers import pipeline
from groq import Groq
from pydantic import BaseModel, Field, ValidationError
from modulosPython.config import GROQ_API_KEY, GROQ_MODEL, MODELO_BERT_ID

# --- 1. Inicializar Cliente Groq ---
try:
    client_groq = Groq(api_key=GROQ_API_KEY)
    print(f"Cliente Groq conectado! Usando modelo: {GROQ_MODEL}")
except Exception as e:
    print(f"--- ERRO AO CONECTAR COM GROQ ---: {e}")
    client_groq = None

# --- 2. Carregar o Modelo BERT (Local) ---
print(f"Carregando modelo BERT '{MODELO_BERT_ID}'...")
try:
    avaliador_bert = pipeline("text-classification", model=MODELO_BERT_ID, device=-1)
    print("BERT carregado com sucesso!")
except Exception as e:
    print(f"Erro no BERT: {e}")
    def avaliador_bert(text, **kwargs): return [{'score': 0.5}]

# --- 3. DEFINIÇÃO DO SCHEMA (PYDANTIC) ---
class FeedbackEstruturado(BaseModel):
    fuga_ao_tema: bool = Field(description="True se o texto fugiu totalmente ao tema")
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

# --- 4. PROMPT DE SISTEMA ---
PROMPT_SISTEMA = """
Você é um Corretor Especialista Oficial do ENEM (Brasil).
Sua tarefa é corrigir uma redação dissertativo-argumentativa com rigor técnico, mas didática extrema.

### DIRETRIZES DE FEEDBACK (OBRIGATÓRIO):
1.  *CITE O TEXTO:* Ao apontar um erro ou um acerto, você DEVE citar trechos exatos da redação entre aspas.
2.  *JUSTIFIQUE A NOTA:* Explique por que a nota foi atribuída baseando-se nos níveis da Matriz de Referência do ENEM (0, 40, 80, 120, 160, 200).
3.  *SEJA CONSTRUTIVO:* Sugira como melhorar o parágrafo ou o argumento.

### CRITÉRIOS POR COMPETÊNCIA:
- *C1 (Norma Culta):* Aponte erros específicos de crase, vírgula, concordância, ortografia.
- *C2 (Tema e Repertório):* Verifique se o texto é dissertativo-argumentativo, uso de repertório sociocultural legitimado, pertinente e produtivo.
- *C3 (Argumentação):* Avalie o "Projeto de Texto". Os argumentos são desenvolvidos?
- *C4 (Coesão):* Avalie o uso de conectivos (operadores argumentativos).
- *C5 (Proposta de Intervenção):* Verifique obrigatoriamente os 5 ELEMENTOS: Agente, Ação, Meio/Modo, Efeito e Detalhamento.

### REGRA DE SEGURANÇA E FORMATO:
- Se houver *FUGA TOTAL AO TEMA*, marque "fuga_ao_tema": true e zere todas as notas.
- Retorne APENAS um JSON PLANO (sem aninhamento). Não use chaves como "feedback" ou "response".

FORMATO OBRIGATÓRIO DE SAÍDA (JSON):
{
  "fuga_ao_tema": false,
  "c1_nota": 160,
  "c1_feedback": "Nota 160 pois...",
  "c2_nota": 200,
  "c2_feedback": "Excelente uso...",
  "c3_nota": 120,
  "c3_feedback": "Argumentação mediana...",
  "c4_nota": 160,
  "c4_feedback": "Bom uso de conectivos...",
  "c5_nota": 160,
  "c5_feedback": "Proposta boa, mas incompleta...",
  "comentario_geral": "Uma redação sólida..."
}
"""

# --- 5. LÓGICA DE CHAMADA ---
def analisar_redacao_completa(tema, texto):
    """Encapsula a lógica do BERT e do Groq em uma única função para o app.py"""
    
    # 1. Avaliação do BERT
    res_bert = avaliador_bert(texto, truncation=True, max_length=512)[0]
    nota_bert = float(max(0, min(1000, res_bert['score'] * 1000)))
    nota_alvo = round(nota_bert / 40.0) * 40
    print(f"Nota BERT: {nota_bert:.0f} -> Alvo: {nota_alvo}")

    # 2. Avaliação do GROQ
    if not client_groq:
        raise Exception("Cliente Groq não inicializado.")

    prompt_usuario = f"Tema: \"{tema}\"\nNota Alvo: {nota_alvo}\nTexto:\n'''\n{texto}\n'''"

    try:
        completion = client_groq.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": PROMPT_SISTEMA},
                {"role": "user", "content": prompt_usuario}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        json_str = completion.choices[0].message.content
        dados = json.loads(json_str)
        
        # Correção de aninhamento ("Blindagem")
        if "feedback" in dados and isinstance(dados["feedback"], dict):
            dados = dados["feedback"]
        elif "response" in dados and isinstance(dados["response"], dict):
             dados = dados["response"]

        # Validação Pydantic
        feedback_validado = FeedbackEstruturado(**dados)
        feedback_dict = feedback_validado.model_dump()

    except ValidationError as ve:
        print(f"Erro de Validação Pydantic: {ve}")
        feedback_dict = _gerar_feedback_erro(nota_alvo, "Erro na formatação da IA.")
    except Exception as e:
        print(f"Erro Geral Groq: {e}")
        feedback_dict = _gerar_feedback_erro(0, f"Erro técnico na IA: {str(e)}")

    # 3. Calcular Nota Final
    nota_final_real = (
        feedback_dict['c1_nota'] + feedback_dict['c2_nota'] + 
        feedback_dict['c3_nota'] + feedback_dict['c4_nota'] + 
        feedback_dict['c5_nota']
    )
    
    if feedback_dict['fuga_ao_tema']:
        nota_final_real = 0

    return nota_final_real, feedback_dict

def _gerar_feedback_erro(nota_base, mensagem):
    return {
        "fuga_ao_tema": False,
        "c1_nota": int(nota_base/5) if nota_base else 0, "c1_feedback": mensagem,
        "c2_nota": int(nota_base/5) if nota_base else 0, "c2_feedback": mensagem,
        "c3_nota": int(nota_base/5) if nota_base else 0, "c3_feedback": mensagem,
        "c4_nota": int(nota_base/5) if nota_base else 0, "c4_feedback": mensagem,
        "c5_nota": int(nota_base/5) if nota_base else 0, "c5_feedback": mensagem,
        "comentario_geral": mensagem
    }