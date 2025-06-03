// script.js

const SPREADSHEET_API_URL =
  "https://script.google.com/macros/s/SEU_SCRIPT_AQUI/exec";

const senhaTableBody = document.querySelector("#senhaTable tbody");
const modal = document.getElementById("modal");

const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const especialidadeInput = document.getElementById("especialidade");
const corSelect = document.getElementById("cor");
const observacaoInput = document.getElementById("observacao");

const salvarBtn = document.getElementById("salvarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

let senhaSelecionada = null;

// Função para listar senhas
async function listarSenhas() {
  try {
    const res = await fetch(`${SPREADSHEET_API_URL}?action=listar`);
    const data = await res.json();

    senhaTableBody.innerHTML = "";

    if (!data.length) {
      senhaTableBody.innerHTML = `<tr><td colspan="4">Nenhuma senha aguardando classificação.</td></tr>`;
      return;
    }

    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.senha}</td>
        <td>${new Date(item.data).toLocaleString()}</td>
        <td>${item.status}</td>
        <td>
          <button class="chamar-btn" data-senha="${item.senha}">Chamar</button>
          <button class="excluir-btn" data-senha="${
            item.senha
          }">Excluir</button>
        </td>
      `;

      senhaTableBody.appendChild(tr);
    });

    // Eventos para abrir modal e excluir
    document.querySelectorAll(".chamar-btn").forEach((btn) => {
      btn.addEventListener("click", abrirModal);
    });

    document.querySelectorAll(".excluir-btn").forEach((btn) => {
      btn.addEventListener("click", excluirSenha);
    });
  } catch (err) {
    console.error("Erro ao listar senhas:", err);
  }
}

// Abre modal, limpa campos, mostra modal
function abrirModal(event) {
  senhaSelecionada = event.target.dataset.senha;

  nomeInput.value = "";
  idadeInput.value = "";
  especialidadeInput.value = "";
  corSelect.value = "Vermelho";
  observacaoInput.value = "";

  modal.classList.remove("hidden");
}

// Fecha modal
function fecharModal() {
  modal.classList.add("hidden");
  senhaSelecionada = null;
}

// Salva dados via POST no Apps Script
async function salvarDados() {
  if (!senhaSelecionada) {
    alert("Nenhuma senha selecionada.");
    return;
  }

  const nome = nomeInput.value.trim();
  const idade = idadeInput.value.trim();
  const especialidade = especialidadeInput.value.trim();
  const cor = corSelect.value;
  const observacao = observacaoInput.value.trim();

  if (!nome || !idade || !especialidade || !cor) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const payload = {
    action: "atualizar",
    senha: senhaSelecionada,
    nome,
    idade,
    especialidade,
    cor,
    observacao,
  };

  try {
    const res = await fetch(SPREADSHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (result.success) {
      alert("Dados salvos com sucesso!");
      fecharModal();
      listarSenhas();
    } else {
      alert("Erro ao salvar os dados.");
    }
  } catch (error) {
    alert("Erro na comunicação com o servidor.");
    console.error(error);
  }
}

// Excluir senha
async function excluirSenha(event) {
  const senha = event.target.dataset.senha;

  if (!confirm(`Excluir a senha ${senha}?`)) return;

  try {
    const res = await fetch(SPREADSHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "excluir", senha }),
    });

    const result = await res.json();

    if (result.success) {
      listarSenhas();
    } else {
      alert("Erro ao excluir senha.");
    }
  } catch (error) {
    alert("Erro na comunicação com o servidor.");
    console.error(error);
  }
}

salvarBtn.addEventListener("click", salvarDados);
cancelarBtn.addEventListener("click", fecharModal);

// Inicializa a lista e atualiza a cada 5s
listarSenhas();
setInterval(listarSenhas, 5000);
