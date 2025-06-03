/* URL do Web App do Apps Script (já fornecida por você) */
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzy6LrIq81fBqBsia6AJwq8P_mW3MFFQ4sqiYD_RmOOY4lZEh7cYETeKKlASxAI1f2yEQ/exec";

let senhas = []; // Armazena as senhas carregadas
let senhaSelecionada = ""; // Armazena a senha selecionada no modal

const tbody = document.querySelector("#senhaTable tbody"); // Corpo da tabela
const POLLING_INTERVAL = 5000; // Intervalo de atualização automática

// Elementos do modal
const modal = document.getElementById("modal");
const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const especialidadeInput = document.getElementById("especialidade");
const corInput = document.getElementById("cor");
const observacaoInput = document.getElementById("observacao");
const salvarBtn = document.getElementById("salvarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

/**
 * Renderiza as linhas da tabela com os dados das senhas
 */
function render() {
  tbody.innerHTML = ""; // Limpa a tabela antes de renderizar
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
 * Carrega as senhas via Apps Script (listagem)
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
 * Função para abrir o modal e limpar campos
 */
function abrirModal(senha) {
  senhaSelecionada = senha;
  limparFormulario();
  modal.classList.add("show");
}

/**
 * Fecha o modal (sem enviar dados) e limpa o formulário
 */
function cancelarModal() {
  modal.classList.remove("show");
  limparFormulario();
}

/**
 * Limpa todos os campos do formulário dentro do modal
 */
function limparFormulario() {
  nomeInput.value = "";
  idadeInput.value = "";
  especialidadeInput.value = "";
  corInput.value = "";
  observacaoInput.value = "";
}

/**
 * Salva os dados do paciente e faz a chamada (action=chamar)
 * Depois fecha o modal e recarrega a lista
 */
async function salvarDados() {
  const nome = nomeInput.value.trim();
  const idade = idadeInput.value.trim();
  const especialidade = especialidadeInput.value.trim();
  const cor = corInput.value;
  const observacao = observacaoInput.value.trim();

  // Pega a "máquina" da URL (se existir), senão usa "Classificacao1"
  const urlParams = new URLSearchParams(window.location.search);
  const maquina = urlParams.get("maquina") || "Classificacao1";

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
 * Exclui uma senha (action=excluir) e recarrega a lista
 */
async function excluirSenha(senha) {
  if (!confirm(`Tem certeza que quer excluir a senha ${senha}?`)) return;

  try {
    const resp = await fetch(`${WEB_APP_URL}?action=excluir&senha=${senha}`);
    const result = await resp.json();
    if (result.success) {
      alert("Senha excluída com sucesso!");
      const urlParams = new URLSearchParams(window.location.search);
      const maquina = urlParams.get("maquina") || "Classificacao1";
      carregarSenhas(maquina);
    } else {
      alert("Erro ao excluir senha: " + result.message);
    }
  } catch (err) {
    alert("Erro na conexão: " + err.message);
  }
}

/**
 * Inicia a atualização periódica (polling) de senhas
 */
function iniciarAtualizacaoAutomatica() {
  const urlParams = new URLSearchParams(window.location.search);
  const maquina = urlParams.get("maquina") || "Classificacao1";

  // Primeiro carregamento imediato
  carregarSenhas(maquina);

  // Recarrega a cada POLLING_INTERVAL
  setInterval(() => {
    carregarSenhas(maquina);
  }, POLLING_INTERVAL);
}

// Liga eventos de botões e inicia polling quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  // Abre modal ao clicar em "Chamar" (função é chamada por onclick nos botões gerados dinamicamente)
  window.abrirModal = abrirModal; // Necessário para onclick inline
  window.excluirSenha = excluirSenha; // Necessário para onclick inline

  // Evento nos botões do modal
  cancelarBtn.addEventListener("click", cancelarModal);
  salvarBtn.addEventListener("click", salvarDados);

  // Iniciar atualização automática
  iniciarAtualizacaoAutomatica();
});
