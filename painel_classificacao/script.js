const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyaihPs8SLCWmOFnhm0RyBOd2XjQq6WnhW6uXkM_OTEAdiwj6xnUhx9lT1ZT47keBiCXg/exec";

let senhas = [];
let senhaSelecionada = "";
let maquinaSelecionada = "Classificacao1";

const tbody = document.querySelector("#senhaTable tbody");

// Modais e botões
const modal = document.getElementById("modal");
const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const especialidadeInput = document.getElementById("especialidade");
const corInput = document.getElementById("cor");
const observacaoInput = document.getElementById("observacao");
const salvarBtn = document.getElementById("salvarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

const modalConfig = document.getElementById("modalConfig");
const btnConfig = document.getElementById("btnConfig");
const salvarConfigBtn = document.getElementById("salvarConfigBtn");
const cancelarConfigBtn = document.getElementById("cancelarConfigBtn");
const formConfig = document.getElementById("formConfig");

// Renderiza tabela com as senhas da máquina selecionada
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

// Busca as senhas da máquina no Apps Script
async function carregarSenhas() {
  try {
    const resp = await fetch(
      `${WEB_APP_URL}?action=listar&maquina=${encodeURIComponent(
        maquinaSelecionada
      )}`
    );
    senhas = await resp.json();
    render();
  } catch (err) {
    alert("Erro ao carregar senhas: " + err.message);
  }
}

// Abre modal para preencher dados do paciente
function abrirModal(senha) {
  senhaSelecionada = senha;
  limparFormulario();
  modal.classList.add("show");
}

// Fecha modal de dados
function cancelarModal() {
  modal.classList.remove("show");
  limparFormulario();
}

// Limpa formulário
function limparFormulario() {
  nomeInput.value = "";
  idadeInput.value = "";
  especialidadeInput.value = "";
  corInput.value = "";
  observacaoInput.value = "";
}

// Salva dados do paciente no Apps Script (inclui máquina)
async function salvarDados() {
  const nome = nomeInput.value.trim();
  const idade = idadeInput.value.trim();
  const especialidade = especialidadeInput.value.trim();
  const cor = corInput.value;
  const observacao = observacaoInput.value.trim();

  if (!nome || !idade || !especialidade || !cor) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const resp = await fetch(
      `${WEB_APP_URL}?action=chamar&senha=${encodeURIComponent(
        senhaSelecionada
      )}&maquina=${encodeURIComponent(
        maquinaSelecionada
      )}&nome=${encodeURIComponent(nome)}&idade=${encodeURIComponent(
        idade
      )}&especialidade=${encodeURIComponent(
        especialidade
      )}&cor=${encodeURIComponent(cor)}&observacao=${encodeURIComponent(
        observacao
      )}`
    );
    const result = await resp.json();
    if (result.success) {
      alert("Dados salvos e senha colocada em triagem!");
      cancelarModal();
      carregarSenhas();
    } else {
      alert("Erro ao salvar dados: " + result.message);
    }
  } catch (err) {
    alert("Erro na conexão: " + err.message);
  }
}

// Exclui senha da máquina selecionada
async function excluirSenha(senha) {
  if (!confirm(`Tem certeza que quer excluir a senha ${senha}?`)) return;

  try {
    const resp = await fetch(
      `${WEB_APP_URL}?action=excluir&senha=${senha}&maquina=${encodeURIComponent(
        maquinaSelecionada
      )}`
    );
    const result = await resp.json();
    if (result.success) {
      alert("Senha excluída com sucesso!");
      carregarSenhas();
    } else {
      alert("Erro ao excluir senha: " + result.message);
    }
  } catch (err) {
    alert("Erro na conexão: " + err.message);
  }
}

// Abre modal de configuração da máquina
function abrirModalConfig() {
  // Marca radio da máquina atual
  const radios = formConfig.elements["maquina"];
  for (const radio of radios) {
    radio.checked = radio.value === maquinaSelecionada;
  }
  modalConfig.classList.add("show");
}

// Fecha modal de configuração
function cancelarModalConfig() {
  modalConfig.classList.remove("show");
}

// Salva máquina selecionada e recarrega lista
function salvarConfig() {
  const radios = formConfig.elements["maquina"];
  for (const radio of radios) {
    if (radio.checked) {
      maquinaSelecionada = radio.value;
      break;
    }
  }
  cancelarModalConfig();
  carregarSenhas();
}

document.addEventListener("DOMContentLoaded", () => {
  // Botão engrenagem abre modal configuração
  btnConfig.addEventListener("click", abrirModalConfig);

  salvarConfigBtn.addEventListener("click", salvarConfig);
  cancelarConfigBtn.addEventListener("click", cancelarModalConfig);

  // Modal paciente
  salvarBtn.addEventListener("click", salvarDados);
  cancelarBtn.addEventListener("click", cancelarModal);

  carregarSenhas();

  // Atualiza a lista a cada 5s
  setInterval(carregarSenhas, 5000);
});
