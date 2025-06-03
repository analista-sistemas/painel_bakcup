const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbz8D8c5HhGpaMmfuP42vjdfSI_-zX1J6iOhrWFtAURl-ldnXpC6tn7bopv8kZADicBftg/exec";

let senhas = [];
let consultorioSelecionado = "";
let especialidadesSelecionadas = [];

// Elementos
const tbody = document.querySelector("#senhaTable tbody");
const spanMaquina = document.getElementById("spanMaquina");
const modalMaquina = document.getElementById("modalMaquina");
const btnEngrenagem = document.getElementById("btnEngrenagem");
const salvarMaquinaBtn = document.getElementById("salvarMaquinaBtn");
const cancelarMaquinaBtn = document.getElementById("cancelarMaquinaBtn");

// Filtro de especialidade
const btnFiltro = document.getElementById("btnFiltroEspecialidade");
const filtroEspecialidades = document.getElementById("filtroEspecialidades");
const selectAll = document.getElementById("selectAll");

// Abrir modal consultório
btnEngrenagem.addEventListener("click", () => {
  modalMaquina.classList.add("show");
  const maquinaSalva = localStorage.getItem("consultorioSelecionado");
  if (maquinaSalva) {
    document.querySelectorAll("input[name='consultorio']").forEach((radio) => {
      radio.checked = radio.value === maquinaSalva;
    });
  }
});

cancelarMaquinaBtn.addEventListener("click", () => {
  modalMaquina.classList.remove("show");
});

salvarMaquinaBtn.addEventListener("click", () => {
  const selecionado = document.querySelector(
    "input[name='consultorio']:checked"
  );
  if (!selecionado) {
    alert("Selecione um consultório.");
    return;
  }
  consultorioSelecionado = selecionado.value;
  localStorage.setItem("consultorioSelecionado", consultorioSelecionado);
  spanMaquina.textContent = `(Consultório atual: ${consultorioSelecionado})`;
  modalMaquina.classList.remove("show");
  carregarSenhas();
});

// Abrir filtro de especialidade
btnFiltro.addEventListener("click", () => {
  filtroEspecialidades.classList.toggle("show");
});

// Fechar filtro
document.getElementById("fecharFiltroBtn").addEventListener("click", () => {
  filtroEspecialidades.classList.remove("show");
});

// Selecionar todas
selectAll.addEventListener("change", () => {
  document.querySelectorAll(".especialidade").forEach((cb) => {
    cb.checked = selectAll.checked;
  });
  atualizarFiltroEspecialidades();
});

// Atualizar filtro individual
document.querySelectorAll(".especialidade").forEach((cb) => {
  cb.addEventListener("change", atualizarFiltroEspecialidades);
});

function atualizarFiltroEspecialidades() {
  const checkboxes = document.querySelectorAll(".especialidade:checked");
  especialidadesSelecionadas = Array.from(checkboxes).map((cb) => cb.value);
  render();
}

// Renderizar tabela
function render() {
  tbody.innerHTML = "";
  senhas
    .filter(
      (s) =>
        especialidadesSelecionadas.length === 0 ||
        especialidadesSelecionadas.includes(s.especialidade)
    )
    .forEach(({ senha, nome, data, status, especialidade, cor }) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${senha}</td>
                <td>${nome || "-"}</td>
                <td>${new Date(data).toLocaleString()}</td>
                <td>${status}</td>
                <td>${especialidade}</td>
                <td><span class="cor-bolinha cor-${cor}"></span></td>
                <td>
                    <button class="btn-primario" onclick="chamarPaciente('${senha}')">Chamar</button>
                    <button class="btn-finalizar" onclick="liberarPaciente('${senha}')">Liberar</button>
                </td>
            `;

      tbody.appendChild(tr);
    });
}

// Chamar (simples alerta, futura integração com TV)
function chamarPaciente(senha) {
  alert(`Chamando paciente: ${senha}`);
}

// Liberar paciente → muda status para "Atendimento Finalizado"
async function liberarPaciente(senha) {
  if (!consultorioSelecionado) {
    alert("Você precisa selecionar um consultório antes.");
    return;
  }

  try {
    const resp = await fetch(
      `${WEB_APP_URL}?action=liberar&senha=${encodeURIComponent(
        senha
      )}&consultorio=${encodeURIComponent(consultorioSelecionado)}`
    );
    const result = await resp.json();
    if (result.success) {
      carregarSenhas();
    } else {
      alert("Erro ao liberar: " + result.message);
    }
  } catch (err) {
    alert("Erro de conexão: " + err.message);
  }
}

// Carregar pacientes com status "Aguardando Médico"
async function carregarSenhas() {
  try {
    const resp = await fetch(`${WEB_APP_URL}?action=listar`);
    senhas = await resp.json();
    render();
  } catch (err) {
    alert("Erro ao carregar senhas: " + err.message);
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  consultorioSelecionado = localStorage.getItem("consultorioSelecionado") || "";
  if (consultorioSelecionado) {
    spanMaquina.textContent = `(Consultório atual: ${consultorioSelecionado})`;
  }

  window.chamarPaciente = chamarPaciente;
  window.liberarPaciente = liberarPaciente;

  carregarSenhas();
  setInterval(carregarSenhas, 5000);
});
