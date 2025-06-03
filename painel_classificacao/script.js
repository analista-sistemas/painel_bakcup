// script.js

// URL do Apps Script para chamadas
const API_URL =
  "https://script.google.com/macros/s/AKfycbzUX_OyTervwoAr41BfOQZgynKFXRjSmV96UjsZVmqKNsqI58jiUdlxOmeFbgIKwshSjw/exec";

document.addEventListener("DOMContentLoaded", function () {
  const senhaContainer = document.getElementById("senha-container");
  const modal = document.getElementById("modal");
  const form = document.getElementById("form-dados");

  // Fetch para listar senhas
  async function listarSenhas() {
    const response = await fetch(`${API_URL}?action=listar`);
    const senhas = await response.json();
    senhaContainer.innerHTML = ""; // Limpa o container

    senhas.forEach((senha) => {
      const senhaDiv = document.createElement("div");
      senhaDiv.className = "senha-item";
      senhaDiv.innerHTML = `
                <span>SENHA: ${senha.senha}</span>
                <button data-senha="${senha.senha}" class="btn-chamar">Chamar</button>
                <button data-senha="${senha.senha}" class="btn-excluir">Excluir</button>
            `;
      senhaContainer.appendChild(senhaDiv);
    });

    document
      .querySelectorAll(".btn-chamar")
      .forEach((btn) => btn.addEventListener("click", handleChamar));
    document
      .querySelectorAll(".btn-excluir")
      .forEach((btn) => btn.addEventListener("click", handleExcluir));
  }

  // Função para chamar senha
  function handleChamar(event) {
    const senha = event.target.getAttribute("data-senha");
    modal.style.display = "flex";

    form.onsubmit = async function (e) {
      e.preventDefault();
      const dados = new FormData(form);
      const payload = new URLSearchParams(dados);
      payload.append("action", "chamar");
      payload.append("senha", senha);

      const response = await fetch(`${API_URL}?${payload}`);
      const result = await response.json();
      if (result.success) {
        alert("Dados salvos com sucesso.");
        modal.style.display = "none";
        listarSenhas();
      } else {
        alert("Erro ao salvar os dados.");
      }
    };
  }

  // Função para excluir senha
  async function handleExcluir(event) {
    const senha = event.target.getAttribute("data-senha");
    const response = await fetch(`${API_URL}?action=excluir&senha=${senha}`);
    const result = await response.json();

    if (result.success) {
      alert("Senha excluída.");
      listarSenhas();
    } else {
      alert("Erro ao excluir a senha.");
    }
  }

  // Fecha o modal
  document.getElementById("cancelar").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Inicializa listagem
  listarSenhas();
});
