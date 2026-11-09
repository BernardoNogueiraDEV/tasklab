console.log("TaskLab iniciado.");

let tarefas = [];
let idEmEdicao = null;
const formulario = document.querySelector("#form-tarefa");
const campoTitulo = document.querySelector("#titulo");
const campoDescricao = document.querySelector("#descricao");
const campoPrioridade = document.querySelector("#prioridade");
const campoData = document.querySelector("#data");
const mensagemFormulario = document.querySelector("#mensagem-formulario");
const listaTarefas = document.querySelector("#lista-tarefas");
const prioridades = { baixa: "Baixa", normal: "Normal", alta: "Alta" };

function gerarProximoId() {
    if (tarefas.length === 0) return 1;
    const ids = tarefas.map(tarefa => tarefa.id);
    return Math.max(...ids) + 1;
}

function validarTarefa({ titulo, prioridade, data }) {
    if (!titulo) return "Preencha o título da tarefa.";
    if (titulo.length < 3) return "O título deve ter pelo menos 3 caracteres.";
    if (!Object.hasOwn(prioridades, prioridade)) return "Selecione uma prioridade válida.";
    if (!/^\d{4,}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
        return "Informe uma data válida.";
    }
    return "";
}

function criarTexto(tag, texto, classe) {
    const elemento = document.createElement(tag);
    elemento.textContent = texto;
    if (classe) elemento.className = classe;
    return elemento;
}

function criarCardTarefa(tarefa) {
    const card = document.createElement("article");
    card.className = tarefa.concluida ? "tarefa tarefa-concluida" : "tarefa";
    const [ano, mes, dia] = tarefa.data.split("-");
    card.append(
        criarTexto("h3", tarefa.titulo),
        criarTexto("p", tarefa.descricao || "Sem descrição.", "tarefa-descricao"),
        criarTexto("p", `Prioridade: ${prioridades[tarefa.prioridade]}`),
        criarTexto("p", `Data: ${dia}/${mes}/${ano}`),
        criarTexto("p", `Situação: ${tarefa.concluida ? "Concluída" : "Pendente"}`)
    );
    const acoes = document.createElement("div");
    acoes.className = "tarefa-acoes";
    for (const [acao, rotulo] of [
        ["concluir", tarefa.concluida ? "Reabrir" : "Concluir"],
        ["editar", "Editar"], ["excluir", "Excluir"]
    ]) {
        const botao = criarTexto("button", rotulo);
        botao.type = "button";
        botao.dataset.acao = acao;
        botao.dataset.id = tarefa.id;
        acoes.append(botao);
    }
    card.append(acoes);
    return card;
}

function atualizarResumo() {
    document.querySelector("#resumo-tarefas").textContent =
        `${tarefas.length} ${tarefas.length === 1 ? "tarefa" : "tarefas"}`;
}

function renderizarTarefas() {
    listaTarefas.replaceChildren();
    atualizarResumo();
    if (tarefas.length === 0) {
        listaTarefas.append(criarTexto("p", "Nenhuma tarefa cadastrada."));
        return;
    }
    tarefas.forEach(tarefa => listaTarefas.append(criarCardTarefa(tarefa)));
}

function cadastrarTarefa(dados) {
    tarefas.push({ id: gerarProximoId(), ...dados, concluida: false });
}

formulario.addEventListener("submit", event => {
    event.preventDefault();
    const dados = {
        titulo: campoTitulo.value.trim(),
        descricao: campoDescricao.value.trim(),
        prioridade: campoPrioridade.value,
        data: campoData.value
    };
    const erro = validarTarefa(dados);
    if (erro) {
        mensagemFormulario.textContent = erro;
        return;
    }
    const editando = idEmEdicao !== null;
    if (editando) editarTarefa(dados);
    else cadastrarTarefa(dados);
    resetarFormulario();
    renderizarTarefas();
    mensagemFormulario.textContent = editando ? "Tarefa atualizada com sucesso." : "Tarefa cadastrada com sucesso.";
});

renderizarTarefas();

function alternarConclusao(tarefa) {
    tarefa.concluida = !tarefa.concluida;
    renderizarTarefas();
    mensagemFormulario.textContent = tarefa.concluida ? "Tarefa concluída." : "Tarefa reaberta.";
}

listaTarefas.addEventListener("click", event => {
    const botao = event.target.closest("[data-acao]");
    if (!botao || !listaTarefas.contains(botao)) return;
    const id = Number(botao.dataset.id);
    const tarefa = tarefas.find(tarefa => tarefa.id === id);
    if (!tarefa) return;
    if (botao.dataset.acao === "concluir") alternarConclusao(tarefa);
    if (botao.dataset.acao === "editar") preencherFormulario(tarefa);
});

function preencherFormulario(tarefa) {
    idEmEdicao = tarefa.id;
    campoTitulo.value = tarefa.titulo;
    campoDescricao.value = tarefa.descricao;
    campoPrioridade.value = tarefa.prioridade;
    campoData.value = tarefa.data;
    document.querySelector("#titulo-formulario").textContent = "Editar tarefa";
    document.querySelector("#botao-salvar").textContent = "Atualizar tarefa";
    document.querySelector("#botao-cancelar").hidden = false;
    mensagemFormulario.textContent = "Edite os dados e clique em Atualizar tarefa.";
    campoTitulo.focus();
}

function editarTarefa(dados) {
    const indice = tarefas.findIndex(tarefa => tarefa.id === idEmEdicao);
    if (indice !== -1) tarefas[indice] = { ...tarefas[indice], ...dados };
}

function resetarFormulario() {
    idEmEdicao = null;
    formulario.reset();
    document.querySelector("#titulo-formulario").textContent = "Nova tarefa";
    document.querySelector("#botao-salvar").textContent = "Salvar tarefa";
    document.querySelector("#botao-cancelar").hidden = true;
}

document.querySelector("#botao-cancelar").addEventListener("click", () => {
    resetarFormulario();
    mensagemFormulario.textContent = "Edição cancelada. A tarefa foi mantida.";
    campoTitulo.focus();
});
