# Regras de Negócio e Status Codes — Modelo Movelaria API

Este documento descreve as regras de negócio implementadas na API e os códigos de status HTTP retornados pelos endpoints atualmente disponíveis.

Observação: os endpoints estão agrupados por recurso. Para detalhes de parâmetros e modelos JSON, ver `resources/swagger.yaml`.

## Regras gerais
- Autenticação: todas as rotas administrativas exigem JWT via header `Authorization: Bearer <token>`.
- Senhas: armazenadas como `senhaHash` (bcrypt). A API nunca retorna `senhaHash` nas respostas.
- Criação inicial de `Funcionario`: se a tabela `Funcionario` estiver vazia, `POST /api/funcionarios` permite criar o primeiro usuário sem token (bootstrap). Após existir ao menos um funcionário, a criação passa a exigir token válido.
- Validação: a API valida campos obrigatórios e retorna `400 Bad Request` quando faltam dados obrigatórios.

## Convenções de status HTTP usadas
- 200 OK — respostas de leitura bem-sucedidas (GET, listagens).
- 201 Created — recurso criado com sucesso (POST que cria recurso).
- 204 No Content — atualização ou deleção bem-sucedida sem conteúdo de retorno (PUT, PATCH, DELETE quando não retornam o recurso atualizado).
- 400 Bad Request — dados inválidos ou campos obrigatórios ausentes.
- 401 Unauthorized — autenticação ausente ou inválida (token inválido/expirado).
- 403 Forbidden — não utilizado atualmente (sem regras de autorização por papéis implementadas).
- 404 Not Found — recurso não encontrado.
- 409 Conflict — utilizado quando houver conflito lógico (não aplicado em muitos pontos atualmente).
- 500 Internal Server Error — erro inesperado do servidor.
- 503 Service Unavailable — serviço ou banco de dados indisponível (`GET /api/health`).

## Regras e status por recurso

### /auth
- POST /auth/login
  - Valida `login` e `senha`.
  - 200 OK + `{ token }` quando credenciais válidas.
  - 400 Bad Request quando `login` ou `senha` ausentes.
  - 401 Unauthorized quando credenciais inválidas.

- GET /auth/me
  - Requer JWT.
  - 200 OK + dados do funcionário autenticado.
  - 401 Unauthorized quando token ausente/expirado.

### /funcionarios
- POST /funcionarios
  - Cria funcionário. Se não houver funcionários existentes, permite criação pública (bootstrap).
  - 201 Created quando criado.
  - 400 Bad Request quando campos obrigatórios ausentes.
  - 401 Unauthorized quando criação não é permitido (após bootstrap) e token ausente/inválido.

- GET /funcionarios
  - Requer JWT.
  - 200 OK lista de funcionários.

- GET /funcionarios/{id}
  - Requer JWT.
  - 200 OK com dados públicos do funcionário.
  - 404 Not Found se não existir.

- PUT /funcionarios/{id}
  - Requer JWT.
  - 204 No Content em sucesso.
  - 400 Bad Request para dados inválidos.
  - 404 Not Found se não existir.

### /contatos
- POST /contatos
  - Cria contato (público).
  - 201 Created em sucesso.
  - 400 Bad Request quando campos obrigatórios ausentes.

- GET /contatos
  - Requer JWT.
  - 200 OK lista de contatos.

- GET /contatos/{id}
  - Requer JWT.
  - 200 OK ou 404 Not Found.

- PUT /contatos/{id}
  - Requer JWT.
  - 204 No Content em sucesso.

### /orcamentos
- POST /orcamentos
  - Requer JWT.
  - Campos obrigatórios: `IDContato`, `IDStatusOrcamento`, `IDFuncionario`, `NumeroOrcamento`, `Valor`, `DataSolicitacao`.
  - 201 Created em sucesso.
  - 400 Bad Request quando dados faltando ou inválidos.

- GET /orcamentos
  - Requer JWT.
  - 200 OK lista de orçamentos.

- GET /orcamentos/{id}
  - Requer JWT.
  - 200 OK com detalhes (inclui joins com `Contato`, `Funcionario`, `StatusOrcamento`, `Empresa` quando aplicável).
  - 404 Not Found se não existir.

- PUT /orcamentos/{id}
  - Requer JWT.
  - 204 No Content em sucesso.

- PATCH /orcamentos/{id}/status
  - Requer JWT.
  - Corpo: `{ IDStatusOrcamento }`.
  - 204 No Content em sucesso.

### /ambientes
- POST /ambientes
  - Requer JWT.
  - 201 Created em sucesso.
- GET /ambientes/orcamento/{id}
  - Requer JWT.
  - 200 OK lista de ambientes para o orçamento.
- PUT /ambientes/{id}
  - Requer JWT.
  - 204 No Content em sucesso.
- DELETE /ambientes/{id}
  - Requer JWT.
  - 204 No Content em sucesso.

### /visitas
- POST /visitas
  - Requer JWT.
  - 201 Created em sucesso.
- GET /visitas
  - Requer JWT.
  - 200 OK.
- GET /visitas/{id}
  - Requer JWT.
  - 200 OK ou 404.
- PUT /visitas/{id}
  - Requer JWT.
  - 204 No Content.
- PATCH /visitas/{id}/status
  - Requer JWT.
  - 204 No Content.

### /projetos
- POST /projetos — 201 Created
- GET /projetos — 200 OK
- GET /projetos/{id} — 200 OK / 404
- PUT /projetos/{id} — 204 No Content
- PATCH /projetos/{id}/status — 204 No Content

### /empresas
- POST /empresas — 201 Created
- GET /empresas — 200 OK
- GET /empresas/{id} — 200 OK / 404
- PUT /empresas/{id} — 204 No Content

### /arquivos
- POST /arquivos — 201 Created (apenas metadados)
- GET /arquivos — 200 OK
- GET /arquivos/{id} — 200 OK / 404
- GET /arquivos/orcamento/{id} — 200 OK
- DELETE /arquivos/{id} — 204 No Content

### /prospeccoes
- POST /prospeccoes — 201 Created
- GET /prospeccoes — 200 OK
- GET /prospeccoes/{id} — 200 OK / 404
- PUT /prospeccoes/{id} — 204 No Content
- POST /prospeccoes/{id}/historico — 201 Created
- GET /prospeccoes/{id}/historico — 200 OK

### /statuses
- GET /statuses — requer JWT e retorna os catálogos de status de orçamentos, visitas e projetos.
- PATCH de status dos três recursos valida o ID informado e retorna o recurso atualizado com `200 OK`; status inexistente retorna `400 Bad Request` e recurso inexistente retorna `404 Not Found`.

## Observações finais
- Os status codes usados nos controllers foram padronizados conforme acima. Caso identifique um endpoint com comportamento diferente do documentado, informe qual rota para que eu corrija o controller.
- Erros e exceções não tratadas caem no handler central (`app.js`) que retorna `500 Internal Server Error` com a mensagem do erro.

Arquivo mantido em `resources/business_rules.md` e referenciado no `README.md`.
