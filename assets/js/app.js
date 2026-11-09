console.log("TaskLab iniciado.");

const CHAVE_TAREFAS = "tasklab:tarefas";
let avisoArmazenamento = "";
let tarefas = carregarTarefas();
let idEmEdicao = null;
const formulario = document.querySelector("#form-tarefa");
const campoTitulo = document.querySelector("#titulo");
const campoDescricao = document.querySelector("#descricao");
const campoPrioridade = document.querySelector("#prioridade");
const campoData = document.querySelector("#data");
const mensagemFormulario = document.querySelector("#mensagem-formulario");
const listaTarefas = document.querySelector("#lista-tarefas");
const prioridades = { baixa: "Baixa", normal: "Normal", alta: "Alta" };

function salvarTarefas() {
    try {
        localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
        avisoArmazenamento = "";
        return true;
    } catch (erro) {
        console.error("Não foi possível salvar as tarefas.", erro);
        avisoArmazenamento = "Não foi possível salvar no navegador. As alterações estão apenas nesta aba; tente novamente antes de fechá-la.";
        return false;
    }
}

function carregarTarefas() {
    try {
        const dados = localStorage.getItem(CHAVE_TAREFAS);
        if (dados === null) return [];
        const tarefasSalvas = JSON.parse(dados);
        if (!Array.isArray(tarefasSalvas)) throw new Error("A coleção salva não é um array.");
        const ids = new Set();
        for (const tarefa of tarefasSalvas) {
            if (!tarefa || !Number.isSafeInteger(tarefa.id) || tarefa.id < 1 || ids.has(tarefa.id) ||
                typeof tarefa.titulo !== "string" || tarefa.titulo.trim().length < 3 ||
                typeof tarefa.descricao !== "string" ||
                !["baixa", "normal", "alta"].includes(tarefa.prioridade) ||
                typeof tarefa.data !== "string" || !/^\d{4,}-\d{2}-\d{2}$/.test(tarefa.data) ||
                Number.isNaN(Date.parse(tarefa.data)) || typeof tarefa.concluida !== "boolean") {
                throw new Error("A coleção contém uma tarefa inválida ou um identificador repetido.");
            }
            ids.add(tarefa.id);
        }
        return tarefasSalvas;
    } catch (erro) {
        console.error("Não foi possível carregar as tarefas.", erro);
        avisoArmazenamento = "Não foi possível recuperar as tarefas salvas. A lista foi iniciada vazia; os dados anteriores não foram sobrescritos.";
        return [];
    }
}

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
    document.querySelector("#aviso-armazenamento").textContent = avisoArmazenamento;
    listaTarefas.replaceChildren();
    atualizarResumo();
    if (tarefas.length === 0) {
        listaTarefas.append(criarTexto("p", "Nenhuma tarefa cadastrada."));
        return;
    }
    const visiveis = obterTarefasVisiveis();
    if (visiveis.length === 0) listaTarefas.append(criarTexto("p", "Nenhuma tarefa corresponde aos filtros."));
    visiveis.forEach(tarefa => listaTarefas.append(criarCardTarefa(tarefa)));
}

function obterTarefasVisiveis() {
    const situacao = document.querySelector("#filtro-situacao").value;
    const prioridade = document.querySelector("#filtro-prioridade").value;
    const ordenacao = document.querySelector("#ordenacao").value;
    // filter cria uma nova coleção; sort não modifica o array original.
    const visiveis = tarefas.filter(tarefa => {
        const correspondeSituacao = situacao === "todas" ||
            (situacao === "concluidas" ? tarefa.concluida : !tarefa.concluida);
        return correspondeSituacao && (prioridade === "todas" || tarefa.prioridade === prioridade);
    });
    const pesos = { alta: 3, normal: 2, baixa: 1 };
    if (ordenacao === "data") visiveis.sort((a, b) => a.data.localeCompare(b.data));
    if (ordenacao === "titulo") visiveis.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    if (ordenacao === "prioridade") visiveis.sort((a, b) => pesos[b.prioridade] - pesos[a.prioridade]);
    return visiveis;
}

for (const seletor of ["#filtro-situacao", "#filtro-prioridade", "#ordenacao"]) {
    document.querySelector(seletor).addEventListener("change", renderizarTarefas);
}

function cadastrarTarefa(dados) {
    tarefas.push({ id: gerarProximoId(), ...dados, concluida: false });
    atualizarAplicacao();
}

function atualizarAplicacao() {
    salvarTarefas();
    renderizarTarefas();
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
    mensagemFormulario.textContent = editando ? "Tarefa atualizada com sucesso." : "Tarefa cadastrada com sucesso.";
});

renderizarTarefas();

function alternarConclusao(tarefa) {
    tarefa.concluida = !tarefa.concluida;
    atualizarAplicacao();
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
    if (botao.dataset.acao === "excluir") excluirTarefa(id);
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
    if (indice === -1) return;
    tarefas[indice] = { ...tarefas[indice], ...dados };
    atualizarAplicacao();
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

function excluirTarefa(id) {
    const indice = tarefas.findIndex(tarefa => tarefa.id === id);
    if (indice === -1) return;
    if (!window.confirm("Deseja excluir esta tarefa?")) return;
    tarefas.splice(indice, 1);
    if (idEmEdicao === id) resetarFormulario();
    atualizarAplicacao();
    mensagemFormulario.textContent = "Tarefa excluída com sucesso.";
}
