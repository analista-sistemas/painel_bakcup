// URL do seu deploy do Apps Script
const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbzUX_OyTervwoAr41BfOQZgynKFXRjSmV96UjsZVmqKNsqI58jiUdlxOmeFbgIKwshSjw/exec";

// Variáveis DOM
const senhaLista = document.getElementById("senha-lista");
const modal = document.getElementById("modal");
const formPaciente = document.getElementById("form-paciente");
const btnCancelar = document.getElementById("btn-cancelar");

let senhas = []; // lista de senhas carregadas
let senhaAtual = null; // senha que está sendo chamada/preenchida

// Função para buscar senhas "Aguardando classificação"
async function carregarSenhas() {
  try {
    const res = await fetch(`${API_BASE_URL}?action=listar&maquina=`);
    const data = await res.json();
    senhas = data;
    renderizarSenhas();
  } catch (error) {
    alert("Erro ao carregar senhas: " + error.message);
  }
}

// Renderiza a lista de senhas no painel
function renderizarSenhas() {
  senhaLista.innerHTML = "";

  if (senhas.length === 0) {
    senhaLista.innerHTML = "<p>Nenhuma senha aguardando classificação.</p>";
    return;
  }

  senhas.forEach((item) => {
    const div = document.createElement("div");
    div.className = "senha-item";
    div.innerHTML = `
      <span><strong>Senha:</strong> ${item.senha}</span>
      <button data-senha="${item.senha}">Chamar</button>
    `;

    div
      .querySelector("button")
      .addEventListener("click", () => abrirModal(item.senha));
    senhaLista.appendChild(div);
  });
}

// Abre o modal para preencher dados do paciente
function abrirModal(senha) {
  senhaAtual = senha;
  limparFormulario();
  modal.classList.remove("hidden");
}

// Limpa todos os campos do formulário
function limparFormulario() {
  formPaciente.reset();
}

// Fecha o modal
function fecharModal() {
  modal.classList.add("hidden");
  senhaAtual = null;
}

// Função para salvar dados do paciente e atualizar a senha no Apps Script
async function salvarDados(event) {
  event.preventDefault();

  const formData = new FormData(formPaciente);
  const nome = formData.get("nome").trim();
  const idade = formData.get("idade").trim();
  const especialidade = formData.get("especialidade").trim();
  const cor = formData.get("cor").trim();
  const observacao = formData.get("observacao").trim();

  if (!nome || !idade || !especialidade) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const url = new URL(API_BASE_URL);
    url.searchParams.append("action", "chamar");
    url.searchParams.append("senha", senhaAtual);
    url.searchParams.append("maquina", "Maquina1"); // Se quiser, pode deixar dinâmico depois
    url.searchParams.append("nome", nome);
    url.searchParams.append("idade", idade);
    url.searchParams.append("especialidade", especialidade);
    url.searchParams.append("cor", cor);
    url.searchParams.append("observacao", observacao);

    const res = await fetch(url.toString());
    const json = await res.json();

    if (json.success) {
      alert("Dados salvos com sucesso!");
      fecharModal();
      await carregarSenhas(); // Atualiza lista após salvar
    } else {
      alert("Erro ao salvar dados: " + (json.message || "Erro desconhecido"));
    }
  } catch (error) {
    alert("Erro ao conectar com o servidor: " + error.message);
  }
}

// Event listeners
formPaciente.addEventListener("submit", salvarDados);
btnCancelar.addEventListener("click", fecharModal);

// Inicializa o painel carregando as senhas
carregarSenhas();
