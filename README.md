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

Os dados ficam somente no array `tarefas` durante a execução. **Atualizar ou fechar a página apaga todas as tarefas**, propositalmente: persistência será abordada no próximo laboratório.

## Estrutura

```text
tasklab/
├── index.html
├── README.md
└── assets/
    ├── css/style.css
    └── js/app.js
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
10. Atualize a página e confirme o reinício da lista vazia.

## Versionamento e entrega

As unidades foram implementadas em branches de funcionalidade, com Conventional Commits e merges na `main`. As branches concluídas são removidas. A primeira versão é `v1.0.0`.

Repositório para entrega no Canvas: https://github.com/BernardoNogueiraDEV/tasklab
