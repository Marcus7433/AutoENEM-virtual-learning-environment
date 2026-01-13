/* REDA MAX - LOGIC 
   Versão Integrada e BLINDADA
*/

// --- 1. DADOS E ESTADO ---
const competencyDescriptions = {
    c1: "C1: Norma Padrão",
    c2: "C2: Tema e Repertório",
    c3: "C3: Argumentação",
    c4: "C4: Coesão Textual",
    c5: "C5: Proposta de Intervenção"
};

let authToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user')) || {};

// Lista de telas deve bater com os IDs no HTML
const SCREENS = ["login", "register", "main", "profile", "dashboard"];

// --- 2. NAVEGAÇÃO SEGURA ---
function showScreen(name) {
    SCREENS.forEach(id => {
        const el = document.getElementById(id + "-section");
        // FIX: Só remove se o elemento existir
        if (el) el.classList.remove("active");
    });
    const target = document.getElementById(name + "-section");
    // FIX: Só adiciona se o target existir
    if (target) {
        target.classList.add("active");
    } else {
        console.error(`Erro: Tela "${name}-section" não encontrada no HTML.`);
    }
}

function updateProfileUI() {
    const nameEl = document.getElementById("profile-name");
    const emailEl = document.getElementById("profile-email");
    if (nameEl) nameEl.textContent = currentUser.name || "Usuário";
    if (emailEl) emailEl.textContent = currentUser.email || "-";
}

function checkAuth() {
    if (authToken) {
        showScreen("main");
        updateProfileUI();
        fetchHistory();
    } else {
        showScreen("login");
    }
}

// --- 3. AÇÕES DE API ---

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro no login");

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        checkAuth();
    } catch (err) {
        if(errorEl) errorEl.textContent = err.message;
        console.error(err);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const errorEl = document.getElementById("register-error");

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(currentUser));

        checkAuth();
    } catch (err) {
        if(errorEl) errorEl.textContent = err.message;
    }
}

async function submitEssay() {
    const textEl = document.getElementById("transcription-text");
    const submitBtn = document.getElementById("submit-essay-btn");
    const totalEl = document.getElementById("total-score");

    if (!textEl || !submitBtn || !totalEl) return;

    const text = textEl.value;

    if (text.length < 50) {
        alert("Texto muito curto! Digite pelo menos 50 caracteres.");
        return;
    }

    const topic = prompt("Qual o tema da redação?", "Tema Livre");
    if (!topic) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Corrigindo...";
    totalEl.textContent = "Nota Total: Processando...";

    try {
        const res = await fetch('/api/essays', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title: topic, topic: topic, content: text })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Erro na correção");

        renderScores(data);
        fetchHistory();
        alert("Correção concluída!");

    } catch (err) {
        alert("Erro: " + err.message);
        totalEl.textContent = "Nota Total: Erro";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar para correção";
    }
}

async function fetchHistory() {
    try {
        const res = await fetch('/api/essays', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            const essays = await res.json();
            const list = document.getElementById("essay-list");
            
            // FIX: Verifica se a lista existe antes de manipular
            if (list) {
                list.innerHTML = "";
                essays.forEach(essay => {
                    const li = document.createElement("li");
                    li.innerText = `${essay.title || "Sem Título"} - ${essay.nota_final || "?"}`;
                    li.style.cursor = "pointer";
                    li.onclick = () => loadEssay(essay);
                    list.appendChild(li);
                });
            }
        }
    } catch (err) { console.error(err); }
}

function loadEssay(essay) {
    const textEl = document.getElementById("transcription-text");
    const transCard = document.getElementById("transcription-card");
    const prevCard = document.getElementById("preview-card");

    if (textEl) textEl.value = essay.content;
    if (transCard) transCard.style.display = "block";
    if (prevCard) prevCard.style.display = "none"; // Esconde preview ao carregar histórico
    renderScores(essay);
}

function renderScores(data) {
    const totalEl = document.getElementById("total-score");
    if(totalEl) totalEl.innerText = `Nota Total: ${data.nota_final}`;

    const container = document.getElementById("competency-dropdowns");
    if (!container) return;
    
    container.innerHTML = "";

    const map = { c1: data.c1_nota, c2: data.c2_nota, c3: data.c3_nota, c4: data.c4_nota, c5: data.c5_nota };
    const feedMap = { c1: data.c1_feedback, c2: data.c2_feedback, c3: data.c3_feedback, c4: data.c4_feedback, c5: data.c5_feedback };

    Object.keys(competencyDescriptions).forEach(key => {
        const score = map[key] || 0;
        const feedback = feedMap[key] || "Sem feedback";
        const div = document.createElement("div");
        div.className = "dropdown";
        
        let color = score >= 160 ? "green" : (score >= 120 ? "yellow" : "red");
        
        div.innerHTML = `
            <button class="dropbtn ${color}" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                ${competencyDescriptions[key]} - Nota: ${score}
            </button>
            <div class="dropdown-content">${feedback}</div>
        `;
        container.appendChild(div);
    });

    if(data.comentario_geral) alert("Comentário Geral:\n" + data.comentario_geral);
}

function logout() {
    localStorage.clear();
    location.reload();
}

// --- 4. INICIALIZAÇÃO E EVENTOS ---

document.addEventListener("DOMContentLoaded", () => {
    // Helper para adicionar eventos com segurança (evita erro se ID não existir)
    const addSafeListener = (id, event, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
        else console.warn(`Elemento '${id}' não encontrado para evento '${event}'.`);
    };

    // 1. Formulários de Auth
    addSafeListener("login-form", "submit", handleLogin);
    addSafeListener("register-form", "submit", handleRegister);

    // 2. Botões de Navegação Básicos
    addSafeListener("go-to-register-from-login", "click", () => showScreen("register"));
    addSafeListener("back-to-login", "click", () => showScreen("login"));
    addSafeListener("user-profile-btn", "click", () => showScreen("profile"));
    addSafeListener("back-to-main-from-profile", "click", () => showScreen("main"));
    
    // 3. Botão de Enviar Redação
    addSafeListener("submit-essay-btn", "click", submitEssay);
    
    // 4. Botão Nova Redação (Sidebar)
    addSafeListener("sidebar-new-essay-btn", "click", () => {
        const textEl = document.getElementById("transcription-text");
        const totalEl = document.getElementById("total-score");
        const compEl = document.getElementById("competency-dropdowns");
        const prevCard = document.getElementById("preview-card");
        const transCard = document.getElementById("transcription-card");

        if(textEl) textEl.value = "";
        if(totalEl) totalEl.innerText = "Nota Total: --";
        if(compEl) compEl.innerHTML = "";
        if(prevCard) prevCard.style.display = "none";
        if(transCard) transCard.style.display = "block";
    });

    // 5. Botão Logout (FIX: Adicionado)
    addSafeListener("logout-btn", "click", logout);

    // 6. Dashboard (FIX: Lógica unificada)
    addSafeListener("dashboard-btn", "click", (e) => {
        e.preventDefault();
        showScreen("dashboard");
    });
    addSafeListener("back-to-main-from-dashboard", "click", (e) => {
        e.preventDefault();
        showScreen("main");
    });

    // 7. Upload de Imagem e Transcrição
    const fileInput = document.getElementById("file-upload-main");
    const transcriptionArea = document.getElementById("transcription-text");

    if (fileInput && transcriptionArea) {
        fileInput.addEventListener("change", async () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const fileNameEl = document.getElementById("file-name-main");
                if(fileNameEl) fileNameEl.textContent = file.name;
                
                // Preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imgEl = document.getElementById("essay-preview-img");
                    const prevCard = document.getElementById("preview-card");
                    const transCard = document.getElementById("transcription-card");

                    if(imgEl) imgEl.src = e.target.result;
                    if(prevCard) prevCard.style.display = "block";
                    if(transCard) transCard.style.display = "block";
                };
                reader.readAsDataURL(file);

                // Transcrição
                transcriptionArea.value = "Enviando para o servidor seguro... Aguarde a transcrição...";
                transcriptionArea.disabled = true;

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('/api/transcribe', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${authToken}` },
                        body: formData
                    });

                    const data = await response.json();

                    if (response.ok) {
                        transcriptionArea.value = data.transcricao;
                    } else {
                        transcriptionArea.value = `Erro: ${data.error || 'Falha na transcrição'}`;
                    }
                } catch (error) {
                    console.error("Erro ao transcrever:", error);
                    transcriptionArea.value = "Erro de conexão com o servidor.";
                } finally {
                    transcriptionArea.disabled = false;
                }
            }
        });
    }

    // 8. Checa login ao iniciar
    checkAuth();
});