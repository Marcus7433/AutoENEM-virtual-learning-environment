"""
=========================================================
ARQUIVO: config.py
DESCRIÇÃO: Módulo central de configurações do projeto.
Responsável por carregar variáveis de ambiente (.env),
chaves de API (Groq, Gemini, Interna), definir os modelos
de IA utilizados e as regras básicas de upload de arquivos.
=========================================================
"""

import os
import mimetypes
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

# --- CHAVES DE API ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# --- AVISOS DE CHAVES FALTANTES ---
if not GROQ_API_KEY:
    print("ALERTA: 'GROQ_API_KEY' não encontrada no .env")
if not INTERNAL_API_KEY:
    print("ALERTA: 'INTERNAL_API_KEY' não encontrada no .env")
if not GEMINI_API_KEY:
    print("ALERTA: 'GEMINI_API_KEY' não encontrada no .env (Necessária para transcrição)")

# --- CONFIGURAÇÕES DE MODELOS ---
GROQ_MODEL = "llama-3.3-70b-versatile" 
MODELO_BERT_ID = "md43/meu-bert-enem-v1"
GEMINI_MODEL = "gemini-2.5-flash"

# --- CONFIGURAÇÕES DE UPLOAD E ARQUIVOS ---
mimetypes.add_type('image/webp', '.webp')
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'jfif'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS