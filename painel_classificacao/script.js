// script.js

const SPREADSHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbzUX_OyTervwoAr41BfOQZgynKFXRjSmV96UjsZVmqKNsqI58jiUdlxOmeFbgIKwshSjw/exec";

const senhaTableBody = document.querySelector("#senhaTable tbody");
const modal = document.getElementById("modal");
const form = document.getElementById("form");

const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const especialidadeInput = document.getElementById("especialidade");
const corSelect = document.getElementById("cor");
const observacaoInput = document.getElementById("observacao");

const salvarBtn = document.getElementById("salvarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

let senhaSelecionada = null; // Guarda a senha selecionada para editar

// Função para listar senhas do Google Sheets
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

    // Adiciona eventos aos botões
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

// Abre o modal e preenche com dados vazios para nova chamada
function abrirModal(event) {
  senhaSelecionada = event.target.dataset.senha;

  // Limpa campos
  nomeInput.value = "";
  idadeInput.value = "";
  especialidadeInput.value = "";
  corSelect.value = "Vermelho";
  observacaoInput.value = "";

  modal.classList.remove("hidden");
}

// Fecha o modal
function fecharModal() {
  modal.classList.add("hidden");
  senhaSelecionada = null;
}

// Salva os dados preenchidos e atualiza no Google Sheets
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
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (result.success) {
      alert("Dados salvos com sucesso!");
      fecharModal();
      listarSenhas();
    } else {
      alert("Erro ao salvar os dados.");
    }
  } catch (err) {
    alert("Erro na comunicação com o servidor.");
    console.error(err);
  }
}

// Excluir senha do painel e planilha
async function excluirSenha(event) {
  const senha = event.target.dataset.senha;

  if (!confirm(`Excluir a senha ${senha}?`)) return;

  try {
    const res = await fetch(SPREADSHEET_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "excluir", senha }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (result.success) {
      listarSenhas();
    } else {
      alert("Erro ao excluir senha.");
    }
  } catch (err) {
    alert("Erro na comunicação com o servidor.");
    console.error(err);
  }
}

// Eventos dos botões salvar e cancelar
salvarBtn.addEventListener("click", salvarDados);
cancelarBtn.addEventListener("click", fecharModal);

// Atualiza lista de senhas a cada 5 segundos
listarSenhas();
setInterval(listarSenhas, 5000);
