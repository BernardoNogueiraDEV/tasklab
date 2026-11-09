const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("assets/js/app.js", "utf8");

// Cada execução representa uma nova página, compartilhando apenas o armazenamento.
function abrir(storage = new Map(), falhas = {}) {
    const elementos = new Map();
    class Elemento {
        constructor() {
            this.value = "";
            this.children = [];
            this.dataset = {};
            this.listeners = {};
        }
        append(...filhos) { this.children.push(...filhos); }
        replaceChildren() { this.children = []; }
        addEventListener(evento, callback) { this.listeners[evento] = callback; }
        focus() {}
        contains() { return true; }
        reset() {
            for (const id of ["titulo", "descricao", "prioridade", "data"]) pegar(`#${id}`).value = "";
        }
    }
    function pegar(id) {
        if (!elementos.has(id)) elementos.set(id, new Elemento());
        return elementos.get(id);
    }
    pegar("#filtro-situacao").value = "todas";
    pegar("#filtro-prioridade").value = "todas";
    pegar("#ordenacao").value = "cadastro";
    const contexto = vm.createContext({
        document: { querySelector: pegar, createElement: () => new Elemento() },
        console: { log() {}, error() {} },
        window: { confirm: () => !falhas.cancelar },
        localStorage: {
            getItem(chave) {
                if (falhas.leitura) throw new Error("Acesso bloqueado");
                return storage.get(chave) ?? null;
            },
            setItem(chave, valor) {
                if (falhas.escrita) throw new Error("Sem espaço");
                storage.set(chave, String(valor));
            },
            removeItem(chave) { storage.delete(chave); }
        }
    });
    vm.runInContext(source, contexto);
    const executar = codigo => vm.runInContext(codigo, contexto);
    return {
        pegar, executar,
        tarefas: () => JSON.parse(executar("JSON.stringify(tarefas)")),
        cadastrar(titulo = "Revisar acentuação: ação e conclusão") {
            pegar("#titulo").value = titulo;
            pegar("#descricao").value = "Descrição em português";
            pegar("#prioridade").value = "alta";
            pegar("#data").value = "2026-11-09";
            pegar("#form-tarefa").listeners.submit({ preventDefault() {} });
        }
    };
}

test("CRUD persiste entre execuções; edição é temporária e preserva id e conclusão", () => {
    const storage = new Map();
    let app = abrir(storage);
    app.cadastrar();
    app = abrir(storage);
    assert.equal(app.tarefas().length, 1);
    assert.match(app.tarefas()[0].titulo, /acentuação/);
    app.executar("alternarConclusao(tarefas[0])");
    app = abrir(storage);
    assert.equal(app.tarefas()[0].concluida, true);
    app.executar("preencherFormulario(tarefas[0])");
    app.cadastrar("Título atualizado");
    app = abrir(storage);
    assert.equal(app.tarefas()[0].titulo, "Título atualizado");
    assert.equal(app.tarefas()[0].id, 1);
    assert.equal(app.tarefas()[0].concluida, true);
    app.executar("preencherFormulario(tarefas[0])");
    app = abrir(storage);
    assert.equal(app.executar("idEmEdicao"), null);
    app.executar("alternarConclusao(tarefas[0])");
    app = abrir(storage);
    assert.equal(app.tarefas()[0].concluida, false);
    app.executar("preencherFormulario(tarefas[0]); excluirTarefa(1)");
    assert.equal(app.executar("idEmEdicao"), null);
    assert.deepEqual(abrir(storage).tarefas(), []);
});

test("cancelamentos e dados inválidos não alteram o armazenamento", () => {
    const storage = new Map();
    const falhas = {};
    const app = abrir(storage, falhas);
    app.cadastrar("ab");
    assert.equal(storage.has("tasklab:tarefas"), false);
    app.cadastrar();
    const antes = storage.get("tasklab:tarefas");
    app.executar("preencherFormulario(tarefas[0])");
    app.pegar("#titulo").value = "Descartar";
    app.pegar("#botao-cancelar").listeners.click();
    falhas.cancelar = true;
    app.executar("excluirTarefa(1); apagarTodasTarefas()");
    assert.equal(storage.get("tasklab:tarefas"), antes);
});

test("ausência, JSON inválido, formatos inesperados e falhas de leitura não impedem inicialização", () => {
    assert.deepEqual(abrir().tarefas(), []);
    for (const valor of ["{", "null", "{}", '[null]', '[{"id":1}]', ""]) {
        const storage = new Map([["tasklab:tarefas", valor]]);
        const app = abrir(storage);
        assert.deepEqual(app.tarefas(), []);
        assert.equal(storage.get("tasklab:tarefas"), valor);
        assert.match(app.pegar("#aviso-armazenamento").textContent, /Não foi possível/);
    }
    assert.deepEqual(abrir(new Map(), { leitura: true }).tarefas(), []);
});

test("falha de escrita avisa e mantém CRUD utilizável; próxima tentativa salva", () => {
    const storage = new Map();
    const falhas = { escrita: true };
    const app = abrir(storage, falhas);
    app.cadastrar();
    assert.equal(app.tarefas().length, 1);
    assert.match(app.pegar("#aviso-armazenamento").textContent, /apenas nesta aba/);
    falhas.escrita = false;
    app.executar("alternarConclusao(tarefas[0])");
    assert.equal(app.pegar("#aviso-armazenamento").textContent, "");
    assert.equal(abrir(storage).tarefas()[0].concluida, true);
});

test("filtro persiste separado; limpeza preserva outras chaves e exemplos não reaparecem", () => {
    const storage = new Map([["outra-aplicacao", "preservar"]]);
    let app = abrir(storage);
    assert.equal(app.pegar("#botao-exemplos").hidden, false);
    app.pegar("#botao-exemplos").listeners.click();
    assert.equal(abrir(storage).tarefas().length, 2);
    app.pegar("#filtro-situacao").value = "concluidas";
    app.pegar("#filtro-situacao").listeners.change();
    app = abrir(storage);
    assert.equal(app.pegar("#filtro-situacao").value, "concluidas");
    assert.equal(app.executar("obterTarefasVisiveis().length"), 1);
    app.executar("apagarTodasTarefas()");
    app = abrir(storage);
    assert.deepEqual(app.tarefas(), []);
    assert.equal(app.pegar("#botao-exemplos").hidden, true);
    assert.equal(storage.get("outra-aplicacao"), "preservar");
    assert.equal(storage.get("tasklab:tarefas"), "[]");
    app.pegar("#filtro-situacao").value = "todas";
    app.pegar("#filtro-situacao").listeners.change();
    assert.equal(storage.has("tasklab:filtro"), false);
});

test("arquivos de aplicação são UTF-8 válido e mantêm os acentos", () => {
    for (const arquivo of ["index.html", "assets/js/app.js", "assets/css/style.css", "README.md"]) {
        const texto = new TextDecoder("utf-8", { fatal: true }).decode(fs.readFileSync(arquivo));
        assert.equal(texto.includes("\uFFFD"), false, arquivo);
        assert.equal(/Ã[£§©³]|â€/.test(texto), false, arquivo);
    }
    assert.match(source, /Tarefa concluída/);
    assert.match(fs.readFileSync("index.html", "utf8"), /charset="UTF-8"/);
});
