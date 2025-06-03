document.addEventListener("DOMContentLoaded", () => {
  const listaSenhas = document.getElementById("listaSenhas");
  const modalPaciente = document.getElementById("modalPaciente");
  const formPaciente = document.getElementById("formPaciente");
  const btnCancelar = document.getElementById("btnCancelar");
  let senhaSelecionada = "";

  // Dados iniciais simulados
  const senhas = [
    { id: "A011" },
    { id: "A012" },
    { id: "A013" },
    { id: "A014" },
  ];

  function renderizarSenhas() {
    listaSenhas.innerHTML = "";
    senhas.forEach((senha, index) => {
      const card = document.createElement("div");
      card.className = "senhaCard";
      card.innerHTML = `
                <h2>${senha.id}</h2>
                <button class="btnChamar" data-id="${index}">Chamar</button>
                <button class="btnExcluir" data-id="${index}">Excluir</button>
            `;
      listaSenhas.appendChild(card);
    });

    document
      .querySelectorAll(".btnChamar")
      .forEach((btn) => btn.addEventListener("click", abrirModal));

    document
      .querySelectorAll(".btnExcluir")
      .forEach((btn) => btn.addEventListener("click", excluirSenha));
  }

  function abrirModal(event) {
    senhaSelecionada =
      event.target.parentElement.querySelector("h2").textContent;
    modalPaciente.classList.add("active");
  }

  btnCancelar.addEventListener("click", () => {
    modalPaciente.classList.remove("active");
  });

  formPaciente.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const idade = document.getElementById("idade").value;
    const especialidade = document.getElementById("especialidade").value;
    const observacao = document.getElementById("observacao").value;
    const cor = document.querySelector('input[name="cor"]:checked').value;

    const dados = {
      senha: senhaSelecionada,
      nome,
      idade,
      especialidade,
      cor,
      observacao,
    };

    fetch(
      "https://script.google.com/macros/s/AKfycbzUX_OyTervwoAr41BfOQZgynKFXRjSmV96UjsZVmqKNsqI58jiUdlxOmeFbgIKwshSjw/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      }
    )
      .then(() => {
        alert("Dados salvos!");
        modalPaciente.classList.remove("active");
      })
      .catch(() => alert("Erro ao salvar os dados."));
  });

  function excluirSenha(event) {
    const index = event.target.dataset.id;
    senhas.splice(index, 1);
    renderizarSenhas();
  }

  renderizarSenhas();
});
