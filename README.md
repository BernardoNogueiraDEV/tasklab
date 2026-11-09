# TaskLab

Gerenciador de tarefas desenvolvido para o laboratório de Desenvolvimento de Interfaces Web, com HTML, CSS e JavaScript puro.

## Executar

Abra `index.html` em um navegador. Não é necessário instalar dependências ou executar um build.

## Funcionalidades

- Cadastro com título obrigatório de pelo menos 3 caracteres, descrição opcional, prioridade e data obrigatórias.
- Listagem com quantidade total, estado vazio e feedback das ações.
- Concluir e reabrir tarefas.
- Editar mantendo o identificador e a situação, com opção de cancelar.
- Excluir com confirmação; excluir a tarefa em edição restaura o formulário.
- Filtros combinados por situação e prioridade.
- Ordenação por cadastro, data, prioridade ou título sem modificar a coleção original.
- Persistência automática de todas as alterações no `localStorage`.
- Recuperação das tarefas e da preferência de situação ao reabrir a página.
- Apagar todas com confirmação, preservando dados de outras aplicações.
- Exemplos opcionais no primeiro acesso; não reaparecem após apagar a coleção.
- Tratamento de JSON inválido, registros inconsistentes e falhas de acesso ou gravação.

Na versão `v1.1.0`, as tarefas são armazenadas como JSON na chave `tasklab:tarefas`. Cadastro, edição, exclusão, conclusão e reabertura passam pela função `atualizarAplicacao()`, que salva e renderiza o estado. Ao abrir a página, `carregarTarefas()` recupera a coleção; uma chave ausente inicia a lista vazia.

A situação selecionada fica em `tasklab:filtro`; selecionar Todas remove somente essa preferência com `removeItem()`. A edição em andamento, os campos do formulário e as mensagens continuam temporários. Apagar todas salva `[]`, distinguindo uma coleção apagada do primeiro acesso. O botão de exemplos aparece somente quando não há coleção armazenada.

O carregamento usa `try/catch` e valida o array e seus registros antes de renderizar. Dados inválidos iniciam uma lista vazia com aviso, sem sobrescrever automaticamente o conteúdo anterior. Se uma gravação falhar, a aplicação continua em memória e exibe um aviso separado do feedback da ação.

O armazenamento pertence ao navegador e à origem usada para abrir a aplicação; não há sincronização entre dispositivos. Não armazene senhas, tokens ou dados confidenciais. Se o navegador bloquear o armazenamento ao abrir o arquivo diretamente, sirva a pasta por um servidor HTTP local e mantenha o mesmo endereço nos testes.

Todos os arquivos de texto são mantidos em **UTF-8** e o HTML declara `<meta charset="UTF-8">`.

## Estrutura

```text
tasklab/
├── index.html
├── README.md
└── assets/
    ├── css/style.css
    └── js/app.js
tests/app.test.cjs
```

O JavaScript separa validação, cadastro, renderização, edição, exclusão e conclusão em funções. As ações dos cards usam `data-acao`, `data-id` e um único listener na lista. Conteúdo digitado é inserido com `textContent`.

## Verificação manual

1. Verifique a mensagem de lista vazia e o resumo de 0 tarefas.
2. Envie campos vazios e títulos curtos; os dados devem permanecer no formulário com feedback.
3. Cadastre várias tarefas e confira os dados e o singular/plural do resumo.
4. Conclua e reabra uma tarefa.
5. Edite tarefas pendentes e concluídas; confira a preservação da situação.
6. Cancele uma edição e verifique que a tarefa não mudou.
7. Cancele uma exclusão e depois confirme outra.
8. Exclua a tarefa que está em edição; o formulário deve voltar a Nova tarefa.
9. Combine os filtros, teste resultados vazios e todas as ordenações.
10. Atualize a página após cada operação e confirme que tarefas, identificadores e situações permanecem.
11. Feche e reabra a aba; confira as tarefas e a preferência de situação. A edição em andamento deve ser descartada.
12. Cancele Apagar todas, depois confirme; atualize e verifique que os exemplos não reaparecem.
13. No primeiro acesso, use Carregar exemplos se desejar uma coleção demonstrativa.
14. No DevTools, em Application → Local Storage, inspecione `tasklab:tarefas` durante as operações.
15. Remova somente a coleção com `localStorage.removeItem("tasklab:tarefas")` e atualize: a lista inicia vazia.
16. Experimente `localStorage.setItem("tasklab:tarefas", "JSON inválido")` e atualize: a aplicação deve apresentar um aviso e continuar utilizável. Isso substitui os dados locais, portanto faça esse teste com tarefas de exemplo.

## Testes automatizados

Com Node.js instalado, execute:

```sh
node --test tests/app.test.cjs
node --check assets/js/app.js
```

Os testes usam DOM e armazenamento simulados, recriando a aplicação entre operações. Cobrem persistência do CRUD, cancelamentos, coleção vazia, JSON inválido, falhas de leitura e gravação, preferência de filtro, limpeza, exemplos e integridade UTF-8. Não substituem a conferência visual e os testes do armazenamento em um navegador real.

## Versionamento e entrega

As unidades foram implementadas em branches de funcionalidade e correção, com Conventional Commits e merges na `main`. As branches concluídas são removidas. A primeira versão é `v1.0.0` (CRUD em memória); a versão `v1.1.0` adiciona persistência local compatível com as funcionalidades anteriores.

Repositório para entrega no Canvas: https://github.com/BernardoNogueiraDEV/tasklab
