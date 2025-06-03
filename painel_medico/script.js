const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbz8D8c5HhGpaMmfuP42vjdfSI_-zX1J6iOhrWFtAURl-ldnXpC6tn7bopv8kZADicBftg/exec"; // Substitua pela URL real do Apps Script

let senhas = [];
let consultorioSelecionado = "";
let especialidadesSelecionadas = [];

const tbody = document.querySelector("#senhaTable tbody");
const spanConsultorio = document.getElementById("spanConsultorio");
const filtroContainer = document.getElementById("filtroEspecialidades");
const selectAll = document.getElementById("selectAll");

document.getElementById("btnEngrenagem").onclick = () => {
  const input = prompt("Digite o número do consultório (1 a 12):");
  if (input >= 1 && input <= 12) {
    consultorioSelecionado = `Consultório ${input}`;
    spanConsultorio.textContent = consultorioSelecionado;
    render();
  }
};

document.getElementById("btnFiltro").onclick = () => {
  filtroContainer.style.display =
    filtroContainer.style.display === "block" ? "none" : "block";
};

selectAll.addEventListener("change", () => {
  const checkboxes = document.querySelectorAll(".especialidade");
  checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
  atualizarFiltro();
});

document.querySelectorAll(".especialidade").forEach((cb) => {
  cb.addEventListener("change", atualizarFiltro);
});

function atualizarFiltro() {
  const checked = Array.from(
    document.querySelectorAll(".especialidade:checked")
  );
  especialidadesSelecionadas = checked.map((cb) => cb.value);
  render();
}

function render() {
  tbody.innerHTML = "";
  senhas
    .filter((s) => s.status === "Aguardando Médico")
    .filter((s) => especialidadesSelecionadas.includes(s.especialidade))
    .forEach(({ senha, nome, data, status, especialidade, cor }) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${senha}</td>
        <td>${nome || "-"}</td>
        <td>${data}</td>
        <td>${status}</td>
        <td>${especialidade}</td>
        <td><span class="cor-bolinha cor-${cor}"></span></td>
        <td>
          <button class="chamarBtn">Chamar</button>
          <button class="liberarBtn">Liberar</button>
        </td>
      `;

      tr.querySelector(".chamarBtn").onclick = () => chamarPaciente(senha);
      tr.querySelector(".liberarBtn").onclick = () => liberarPaciente(senha);
      tbody.appendChild(tr);
    });
}

function chamarPaciente(senha) {
  alert(`Chamando paciente: ${senha}`);
}

function liberarPaciente(senha) {
  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({
      acao: "liberar_paciente",
      senha: senha,
      consultorio: consultorioSelecionado,
      novo_status: "Atendimento Finalizado",
    }),
  })
    .then((r) => r.json())
    .then(() => carregarDados());
}

function carregarDados() {
  fetch(WEB_APP_URL + "?acao=listar")
    .then((r) => r.json())
    .then((dados) => {
      senhas = dados;
      render();
    });
}

setInterval(carregarDados, 5000);
carregarDados();
