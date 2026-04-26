"""
=========================================================
ARQUIVO: transcricao.py
DESCRIÇÃO: Módulo especialista em transcrição de imagens.
Responsável pela comunicação com a API do Google Gemini 
para extrair o texto de imagens de redações manuscritas, 
preservando os erros originais (ortografia, pontuação) 
do aluno para a posterior correção pedagógica.
=========================================================
"""

import os
import mimetypes
from google import genai
from modulosPython.config import GEMINI_API_KEY, GEMINI_MODEL

# Inicializa o Cliente Gemini
try:
    client_gemini = genai.Client(api_key=GEMINI_API_KEY)
    print("Cliente Gemini conectado para transcrição!")
except Exception as e:
    print(f"--- ERRO AO CONECTAR COM GEMINI ---: {e}")
    client_gemini = None

PROMPT_TRANSCRICAO = """
Atue como um transcritor fiel para fins de correção pedagógica de redações.

OBJETIVO: Transcrever o texto para formato digital, facilitando a leitura mas PRESERVANDO OS ERROS para avaliação.

DIRETRIZES DE TRANSCRIÇÃO:
1. DECIFRAÇÃO INTELIGENTE: A caligrafia pode ser ruim. Use o contexto para entender qual palavra o aluno tentou escrever.
2. FIDELIDADE AOS ERROS (CRUCIAL): 
   - Se o aluno escreveu a palavra com ortografia errada (ex: "caza"), MANTENHA O ERRO. Não corrija.
   - Se faltou acento ou crase, MANTENHA A FALTA.
   - Se a pontuação está errada ou ausente, MANTENHA COMO ESTÁ.
3. FORMATAÇÃO:
   - IGNORAR CABEÇALHO: Não transcreva nomes, turmas soltos no topo da folha.
   - IGNORAR TITULOS: Saiba diferenciar o título do restante da redação e ignore-o.
   - TEXTO CORRIDO: Junte as linhas para formar parágrafos contínuos. Só quebre linha em novo parágrafo visual.
   - HÍFENS: Se uma palavra foi separada no final da linha (ex: "ca-" + "sa"), junte-a ("casa").
   - IDENTAÇÃO: Insira uma tabulação (ou 4 espaços) no início de cada novo parágrafo.

Retorne APENAS o texto transcrito.
"""

def extrair_texto_da_imagem(filepath, filename):
    if not client_gemini:
        raise Exception("Erro config Gemini. Verifique .env")

    # Detecção de MIME Type
    mime_type, _ = mimetypes.guess_type(filepath)
    if not mime_type:
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        tipo_map = {
            'webp': 'image/webp', 'png': 'image/png', 'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg', 'jfif': 'image/jpeg', 'gif': 'image/gif', 'bmp': 'image/bmp'
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
        
        print(">>> [INFO] Solicitando geração de conteúdo ao Gemini...")
        response = client_gemini.models.generate_content(
            model=GEMINI_MODEL,
            contents=[PROMPT_TRANSCRICAO, uploaded_file],
        )
        
        # Verifica bloqueio de resposta
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
        # Limpeza do arquivo local e na nuvem
        if os.path.exists(filepath): 
            os.remove(filepath)
        if uploaded_file: 
            try: client_gemini.files.delete(name=uploaded_file.name)
            except: pass

    return transcricao