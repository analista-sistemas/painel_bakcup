const apiUrl =
  "https://script.google.com/macros/s/AKfycbzUX_OyTervwoAr41BfOQZgynKFXRjSmV96UjsZVmqKNsqI58jiUdlxOmeFbgIKwshSjw/exec";

document.addEventListener("DOMContentLoaded", () => {
  carregarSenhas();

  document
    .getElementById("fechar-modal")
    .addEventListener("click", fecharModal);
  document
    .getElementById("salvar-dados")
    .addEventListener("click", salvarDados);
});

function carregarSenhas() {
  fetch(`${apiUrl}?action=listar`)
    .then((response) => response.json())
    .then((data) => {
      const painel = document.getElementById("painel-senhas");
      painel.innerHTML = ""; // Limpa senhas anteriores
      data.forEach((item) => {
        const div = document.createElement("div");
        div.className = "senha-card";
        div.innerHTML = `
                    <p><strong>Senha:</strong> ${item.senha}</p>
                    <button onclick="abrirModal('${item.senha}')">Chamar</button>
                    <button onclick="excluirSenha('${item.senha}')">Excluir</button>
                `;
        painel.appendChild(div);
      });
    })
    .catch((err) => console.error("Erro ao carregar senhas:", err));
}

function abrirModal(senha) {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal").dataset.senha = senha;
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

function salvarDados() {
  const senha = document.getElementById("modal").dataset.senha;
  const nome = document.getElementById("nome").value;
  const idade = document.getElementById("idade").value;
  const especialidade = document.getElementById("especialidade").value;
  const cor = document.getElementById("cor").value;
  const observacao = document.getElementById("observacao").value;

  fetch(
    `${apiUrl}?action=chamar&senha=${senha}&nome=${nome}&idade=${idade}&especialidade=${especialidade}&cor=${cor}&observacao=${observacao}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Dados salvos com sucesso!");
        fecharModal();
        carregarSenhas();
      } else {
        alert("Erro ao salvar dados: " + data.message);
      }
    })
    .catch((err) => console.error("Erro ao salvar dados:", err));
}

function excluirSenha(senha) {
  fetch(`${apiUrl}?action=excluir&senha=${senha}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Senha excluída com sucesso!");
        carregarSenhas();
      } else {
        alert("Erro ao excluir senha: " + data.message);
      }
    })
    .catch((err) => console.error("Erro ao excluir senha:", err));
}
