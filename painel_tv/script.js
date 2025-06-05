const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxJWpNLB5weojI2iO_EBZSZYzReeE_zNrscPv3v7F7ICcwOyrNgbtvLxN6KFfNILw2Jcw/exec";

const ultimaSenhaElem = document.getElementById("ultimaSenha");
const ultimaNomeElem = document.getElementById("ultimaNome");

const modal = document.getElementById("modalChamada");
const modalSenha = document.getElementById("modal-senha");
const modalNome = document.getElementById("modal-nome");
const modalMaquina = document.getElementById("modal-maquina");

const listaClassificacao = document.getElementById("historicoClassificacao");
const listaRecepcao = document.getElementById("historicoRecepcao");
const listaMedico = document.getElementById("historicoMedico");

let ultimaChamada = null;

function atualizarUI(chamadas) {
  if (!chamadas || chamadas.length === 0) return;

  const chamadaAtual = chamadas[0];
  if (!ultimaChamada || chamadaAtual.senha !== ultimaChamada.senha) {
    ultimaChamada = chamadaAtual;
    mostrarModal(chamadaAtual);
  }

  ultimaSenhaElem.textContent = chamadaAtual.senha;
  ultimaNomeElem.textContent = chamadaAtual.nome;

  const classificacao = chamadas
    .filter(
      (c) => c.maquina && c.maquina.toLowerCase().includes("classificacao")
    )
    .slice(0, 3);

  const recepcao = chamadas
    .filter(
      (c) =>
        c.maquina &&
        (c.maquina.toLowerCase().includes("recep") ||
          c.maquina.toLowerCase().includes("guiche"))
    )
    .slice(0, 3);

  const medico = chamadas
    .filter(
      (c) =>
        c.maquina &&
        (c.maquina.toLowerCase().includes("consult") ||
          c.maquina.toLowerCase().includes("medic"))
    )
    .slice(0, 3);

  preencherLista(listaClassificacao, classificacao);
  preencherLista(listaRecepcao, recepcao);
  preencherLista(listaMedico, medico);
}

function preencherLista(elemento, dados) {
  elemento.innerHTML = "";
  dados.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `${c.senha} - ${c.nome}`;
    elemento.appendChild(li);
  });
}

function mostrarModal(chamada) {
  modalSenha.textContent = chamada.senha;
  modalNome.textContent = chamada.nome;
  modalMaquina.textContent = chamada.maquina;

  modal.classList.add("show");

  const audio = document.getElementById("somChamada");
  if (audio) {
    audio.play().catch((err) => console.warn("Erro ao tocar som:", err));
  }

  setTimeout(() => {
    modal.classList.remove("show");
  }, 10000);
}

async function carregarChamadas() {
  try {
    const resp = await fetch(`${WEB_APP_URL}?action=chamadas`);
    const dados = await resp.json();
    atualizarUI(dados);
  } catch (e) {
    console.error("Erro ao buscar chamadas:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarChamadas();
  setInterval(carregarChamadas, 5000);
});
