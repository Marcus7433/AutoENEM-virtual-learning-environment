"""
=========================================================
ARQUIVO: app.py
DESCRIÇÃO: Servidor principal da API REST (usando Flask).
Gerencia as rotas web (endpoints /prever e /transcrever),
recebe as requisições HTTP, aplica validações de segurança
(como checagem de chave interna e injeção de prompt) e 
delega o processamento para os módulos correspondentes.
=========================================================
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from functools import wraps

# Importações dos seus módulos criados
from modulosPython.config import INTERNAL_API_KEY, UPLOAD_FOLDER, MAX_CONTENT_LENGTH, allowed_file
from modulosPython.correcao import analisar_redacao_completa
from modulosPython.transcricao import extrair_texto_da_imagem

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173"]}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Internal-API-Key"],
)

# --- MIDDLEWARES & UTILITÁRIOS DE SEGURANÇA ---
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

# --- ROTAS DA API ---

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

        # Delega todo o cálculo pesado para a camada de correção
        nota_final_real, feedback_dict = analisar_redacao_completa(tema, texto)

        return jsonify({
            "nota_final": nota_final_real,
            "feedback": feedback_dict
        })

    except Exception as e:
        print(f"Erro 500: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/transcrever', methods=['POST'])
def transcrever_imagem_endpoint():
    uploaded_file = request.files.get('file') or request.files.get('image')
    if not uploaded_file:
        return jsonify({'error': 'Nenhum arquivo enviado.'}), 400
    
    if uploaded_file.filename == '' or not allowed_file(uploaded_file.filename):
        return jsonify({'error': 'Arquivo inválido.'}), 400

    # Salva temporariamente para processar
    filename = secure_filename(uploaded_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    uploaded_file.save(filepath)
    
    try:
        # Chama a função especialista do módulo transcricao.py
        resultado_texto = extrair_texto_da_imagem(filepath, filename)
        return jsonify({'transcricao': resultado_texto})
    except Exception as e:
        # Garante a limpeza do arquivo local em caso de erro extremo não capturado
        if os.path.exists(filepath): 
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)