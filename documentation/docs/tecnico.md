# Documentação Técnica

## Arquitetura da Solução:

A aplicação AutoEnem é estruturada em uma arquitetura distribuída composta por três camadas principais:

* Front-end (React): responsável pela interface do usuário e interação com o sistema
* Back-end (Node.js + Express): responsável pela lógica de negócio, autenticação e gerenciamento de dados
* API de IA (Python + Flask): responsável pela correção automatizada das redações e processamento de texto

## Fluxo da Aplicação:

1 - O front-end realiza a autenticação do usuário via Supabase
2 - O front-end envia requisições ao servidor Node.js
3 - O servidor Node.js gerencia usuários e redações no banco de dados
4 - Para correção de redações, o servidor Node.js envia a requisição para a API Python
5 - A API Python utiliza modelos de IA para gerar nota e feedback
6 - O resultado é retornado ao usuário no front-end

## Tecnologias Utilizadas: 

# Front-end:
* React
* React Router DOM
* Tailwind CSS
* Vite
* Supabase JS
* Lucide React / React Icons

## Back-end:
* Node.js
* Express

## API de IA:
* Python
* Flask
* Integração com APIs de IA (Groq, Gemini)

## Organização do Projeto:

## Front-end (React):

* pages/: páginas principais da aplicação
* components/: componentes reutilizáveis
* hooks/: gerenciamento de estado (autenticação, tema, etc.)
* lib/: configuração de serviços e API
* utils/: funções auxiliares

## Back-end (Node.js):

* routes/: definição de rotas
* controllers/: regras de negócio
* models/: estrutura de dados
* middlewares/: autenticação e validação
* config/: configuração de serviços externos

## API Python:

* correcao.py: lógica de correção de redação
* transcricao.py: processamento de texto/OCR
* config.py: configuração de APIs externas

## Instruções de instalação e execução:

## 1. Instalar Dependências

* Front-end (React + Vite):

```bash
cd front
npm install
```

* Back-end Node.js (Express):
```bash
cd server
npm install
```

* API Python (Flask):

```bash
cd api_python
pip install -r requirements.txt
```

## 2. Variáveis de Ambiente

* `front/.env`:

```
VITE_SUPABASE_URL=<sua_url_supabase>
VITE_SUPABASE_ANON_KEY=<sua_anon_key>
```

* `server/.env`:

```
SUPABASE_URL=<sua_url_supabase>
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>
INTERNAL_API_KEY=<chave_interna_compartilhada_com_python>
FRONTEND_URL=http://localhost:5173
```

* `api_python/.env`:

```
INTERNAL_API_KEY=<mesma_chave_do_server_node>
GROQ_API_KEY=<sua_chave_groq>
GEMINI_API_KEY=<sua_chave_gemini>
```

## 3. Rodar os Servidores

Abra **3 terminais** diferentes e execute um em cada:

* Terminal 1 - Front-end (porta 5173):

```bash
cd front
npm run dev
```

* Terminal 2 - Back-end Node.js (porta 3000):

```bash
cd server
npm start
```

* Terminal 3 - API Python (porta 5001):

```bash
cd api_python
python app.py
```

---

## 4. Acessar

* Front-end: http://localhost:5173
* API Node.js: http://localhost:3000
* API Python: http://localhost:5001

## Decisões Técnicas Relevantes: 

* Utilização de React com Context API para gerenciamento de estado global
* Uso do Supabase para autenticação via OAuth
* Separação da lógica de inteligência artificial em um serviço independente (API Python)
* Comunicação entre serviços via requisições HTTP
* Persistência de dados em banco gerenciado pelo Supabase
* Uso de localStorage para armazenamento de rascunhos e preferências

## Evidências de Testes:

* Testes manuais das funcionalidades principais:
* Autenticação de usuários
* Envio de redação
* Correção automática
* Visualização de histórico
* Validação do fluxo completo entre front-end, back-end e API de IA

## Estrutura de Dados:

O sistema utiliza o Supabase como banco de dados para:

* Armazenamento de usuários autenticados
* Registro das redações enviadas
* Armazenamento das notas e feedbacks gerados

## Considerações Finais:

A arquitetura adotada permite a separação de responsabilidades entre as camadas do sistema, facilitando a manutenção, escalabilidade e evolução da aplicação. A divisão em múltiplos serviços possibilita melhorias independentes em cada parte do sistema, especialmente na camada de inteligência artificial.

## Referências Acadêmicas 

## Referências utilizadas para treinar o modelo de IA:

* Proceedings, Part I. Springer, 2020.GÉRON, Aurélien. Aprendizado de Máquina Prático com Scikit-Learn, Keras e TensorFlow. 2. ed. Rio de Janeiro: Alta Books, 2020.
* SOUZA, Fábio; NOGUEIRA, Rodrigo; LOTUFO, Roberto. BERTimbau: Pre-trained BERT models for Brazilian Portuguese. In: Intelligent Systems: 9th Brazilian Conference, BRACIS 2020. Rio Grande, 2020. 
* KINGMA, Diederik P.; BA, Jimmy. Adam: A Method for Stochastic Optimization. In: International Conference on Learning Representations (ICLR), 2015. Disponível em: http://arxiv.org/abs/1412.6980. Acesso em: 24 nov. 2025.

## Referências utilizadas para a criação do FrontEnd: 

* https://chat.openai.com/chat
* https://www.w3schools.com/html/default.asp
* https://www.w3schools.com/css/default.asp
https://www.w3schools.com/js/default.asp

## Criação do Transcritor:

* https://www.alura.com.br/conteudo/python-gemini-crie-chatbot-ia-generativa?srsltid=AfmBOopbCXTPVyhy0l5Xwx2a8kv-bGc7apChvNhHEBJHay51uPtFqJr0
* https://www.youtube.com/watch?v=G27vGWfhpQA
* Google Gemini para ajudar a corrigir erros, especialmente para implementar uma exclusão do arquivo enviado pelo usuário.
