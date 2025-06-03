const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbwVZTKjNARuWKLEADu4KcFUz0-xT9OJ88Q-8Y9lzQF-9B8Nowa2jcXHJM71Sg_cTkWbvQ/exec";

let senhas = [];
let senhaSelecionada = "";

const tbody = document.querySelector("#senhaTable tbody");
const POLLING_INTERVAL = 5000;

// Modal de paciente
const modal = document.getElementById("modal");
const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const especialidadeInput = document.getElementById("especialidade");
const corInput = document.getElementById("cor");
const observacaoInput = document.getElementById("observacao");
const salvarBtn = document.getElementById("salvarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

// Modal de seleção de máquina
const modalMaquina = document.getElementById("modalMaquina");
const btnEngrenagem = document.getElementById("btnEngrenagem");
const salvarMaquinaBtn = document.getElementById("salvarMaquinaBtn");
const cancelarMaquinaBtn = document.getElementById("cancelarMaquinaBtn");
const spanMaquina = document.getElementById("spanMaquina");

/**
 * Renderiza a tabela com as senhas
 */
function render() {
    tbody.innerHTML = "";
    senhas.forEach(({ senha, data, status }) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${senha}</td>
      <td>${new Date(data).toLocaleString()}</td>
      <td>${status}</td>
      <td>
        <button onclick="abrirModal('${senha}')">Chamar</button>
        <button onclick="excluirSenha('${senha}')">Excluir</button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

/**
 * Carrega senhas da máquina selecionada
 */
async function carregarSenhas(maquina) {
    try {
        const resp = await fetch(
            `${WEB_APP_URL}?action=listar&maquina=${encodeURIComponent(maquina)}`
        );
        senhas = await resp.json();
        render();
    } catch (err) {
        alert("Erro ao carregar senhas: " + err.message);
    }
}

/**
 * Abre o modal de paciente
 */
function abrirModal(senha) {
    senhaSelecionada = senha;
    limparFormulario();
    modal.classList.add("show");
}

/**
 * Fecha o modal do paciente
 */
function cancelarModal() {
    modal.classList.remove("show");
    limparFormulario();
}

/**
 * Limpa formulário
 */
function limparFormulario() {
    nomeInput.value = "";
    idadeInput.value = "";
    especialidadeInput.value = "";
    corInput.value = "";
    observacaoInput.value = "";
}

/**
 * Salva os dados do paciente
 */
async function salvarDados() {
    const nome = nomeInput.value.trim();
    const idade = idadeInput.value.trim();
    const especialidade = especialidadeInput.value.trim();
    const cor = corInput.value;
    const observacao = observacaoInput.value.trim();

    const maquina = localStorage.getItem("maquinaSelecionada") || "Classificação 01";

    if (!nome || !idade || !especialidade || !cor) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    try {
        const resp = await fetch(
            `${WEB_APP_URL}?action=chamar&senha=${encodeURIComponent(
        senhaSelecionada
      )}&maquina=${encodeURIComponent(maquina)}&nome=${encodeURIComponent(
        nome
      )}&idade=${encodeURIComponent(idade)}&especialidade=${encodeURIComponent(
        especialidade
      )}&cor=${encodeURIComponent(cor)}&observacao=${encodeURIComponent(
        observacao
      )}`
        );
        const result = await resp.json();
        if (result.success) {
            alert("Dados salvos e senha colocada em triagem!");
            cancelarModal();
            carregarSenhas(maquina);
        } else {
            alert("Erro ao salvar dados: " + result.message);
        }
    } catch (err) {
        alert("Erro na conexão: " + err.message);
    }
}

/**
 * Exclui senha
 */
async function excluirSenha(senha) {
    if (!confirm(`Tem certeza que quer excluir a senha ${senha}?`)) return;

    try {
        const resp = await fetch(`${WEB_APP_URL}?action=excluir&senha=${senha}`);
        const result = await resp.json();
        if (result.success) {
            alert("Senha excluída com sucesso!");
            const maquina = localStorage.getItem("maquinaSelecionada") || "Classificação 01";
            carregarSenhas(maquina);
        } else {
            alert("Erro ao excluir senha: " + result.message);
        }
    } catch (err) {
        alert("Erro na conexão: " + err.message);
    }
}

/**
 * Atualização automática
 */
function iniciarAtualizacaoAutomatica() {
    const maquina = localStorage.getItem("maquinaSelecionada") || "Classificação 01";
    carregarSenhas(maquina);
    setInterval(() => {
        carregarSenhas(maquina);
    }, POLLING_INTERVAL);
}

// --- Modal da engrenagem: seleção de máquina ---
btnEngrenagem.addEventListener("click", () => {
    modalMaquina.classList.add("show");
    const maquinaSalva = localStorage.getItem("maquinaSelecionada");
    if (maquinaSalva) {
        const radios = document.querySelectorAll("input[name='classificacao']");
        radios.forEach((radio) => {
            radio.checked = radio.value === maquinaSalva;
        });
    }
});

cancelarMaquinaBtn.addEventListener("click", () => {
    modalMaquina.classList.remove("show");
});

salvarMaquinaBtn.addEventListener("click", () => {
    const selecionado = document.querySelector("input[name='classificacao']:checked");
    if (!selecionado) {
        alert("Selecione uma máquina.");
        return;
    }

    const maquina = selecionado.value;
    localStorage.setItem("maquinaSelecionada", maquina);
    spanMaquina.textContent = `(Máquina atual: ${maquina})`;
    modalMaquina.classList.remove("show");
    carregarSenhas(maquina);
});

// Eventos iniciais
document.addEventListener("DOMContentLoaded", () => {
    const maquina = localStorage.getItem("maquinaSelecionada") || "Classificação 01";
    spanMaquina.textContent = `(Máquina atual: ${maquina})`;

    window.abrirModal = abrirModal;
    window.excluirSenha = excluirSenha;

    cancelarBtn.addEventListener("click", cancelarModal);
    salvarBtn.addEventListener("click", salvarDados);

    iniciarAtualizacaoAutomatica();
});