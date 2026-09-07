## Modelo Movelaria API

API REST para gerenciamento do fluxo de trabalho de uma movelaria.

Status: implementação inicial completa — endpoints principais implementados e protegidos por JWT.

Principais recursos implementados
- Autenticação de funcionários (`/auth/login`, `/auth/me`).
- CRUD de `funcionarios` (sem retorno de `senhaHash`).
- CRUD de `contatos`.
- CRUD de `orcamentos` com atualização de status.
- Gerenciamento de `ambientes`, `visitas`, `projetos`, `empresas`, `arquivos` (metadados) e `prospeccoes` + históricos.
- Documentação Swagger disponível em `/api-docs` (arquivo `resources/swagger.yaml`).

Estrutura do projeto

```
MODELO_MOVELARIA_API/
│
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── database/
│   └── app.js
│
├── resources/
│   ├── banco_movelaria.sql
│   └── swagger.yaml
│
├── server.js
├── package.json
├── .env.example
└── README.md
```

Requisitos
- Node.js 18+ (recomendado)
- MySQL disponível com o banco `modelo_movelaria` existente

Instalação e execução

1. Copie `.env.example` para `.env` e preencha os valores de conexão e `JWT_SECRET`.

2. Instale dependências:

```bash
npm install
```

3. Inicie em modo de desenvolvimento (nodemon):

```bash
npm run dev
```

ou inicie diretamente:

```bash
npm start
```

Ao iniciar, o servidor ficará disponível na porta definida em `.env` (padrão `3000`).

Endpoints principais
- POST `/api/auth/login` — login de funcionário (body: `login`, `senha`).
- GET `/api/auth/me` — dados do funcionário autenticado.
- CRUD `/api/funcionarios`, `/api/contatos`, `/api/orcamentos`, `/api/ambientes`, `/api/visitas`, `/api/projetos`, `/api/empresas`, `/api/arquivos`, `/api/prospeccoes`.
- Documentação interativa: `GET /api-docs`.
- Health check: `GET /health` (servidor) e `GET /api/health` (servidor + banco).
- Catálogo de status: `GET /api/statuses` (autenticado), retornando `orcamentos`, `visitas` e `projetos`.

Nota sobre bootstrap: se o banco não possuir nenhum registro em `Funcionario`, o endpoint `POST /api/funcionarios` permite criar o primeiro usuário sem autenticação. Depois disso, a criação de novos funcionários exige um token JWT válido.

Variáveis de ambiente (veja `.env.example`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (use `modelo_movelaria`).
- `JWT_SECRET` — secreto usado para assinar tokens JWT.
- `JWT_EXPIRES_IN` — duração do token (ex: `1h`).
- `PORT` — porta do servidor.
- `FRONTEND_URL` — origens permitidas pelo CORS, separadas por vírgula (ex.: `http://localhost:5173`).

Regras de segurança e observações
- Senhas são armazenadas como `senhaHash` (bcrypt). A API nunca retorna `senhaHash` nas respostas.
- A autenticação JWT é aplicada via middleware `src/middlewares/auth.js`.
- As rotas `PATCH /orcamentos/{id}/status`, `PATCH /visitas/{id}/status` e `PATCH /projetos/{id}/status` validam o status informado e retornam o registro atualizado (`200 OK`), facilitando a atualização imediata da interface.

Inconsistências e observações no `resources/banco_movelaria.sql`
- A tabela `Orcamento` é criada sem a coluna `IDEmpresa`, mas em seguida o arquivo usa `ALTER TABLE Orcamento ADD CONSTRAINT FK_Orcamento_Empresa FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID)` — coluna ausente causa erro se o SQL for executado sem ajustes.
- O arquivo adiciona a constraint `FK_Orcamento_Empresa` duas vezes em pontos diferentes.
- O arquivo adiciona a constraint `UK_Orcamento_NumeroEmpresa` duas vezes também.
- Há várias operações `ALTER TABLE Cliente` adicionando colunas (`CodigoCliente`, `IDEmpresa`, `DataCadastro`, `RG`) que são aplicadas depois do CREATE TABLE; é funcional se aplicadas sequencialmente, mas pode conter duplicações se executado mais de uma vez.
- Recomendo revisar e normalizar o arquivo SQL antes de executá-lo em um ambiente de produção.

- Adicionar testes automatizados.
- Implementar controle de permissões mais fino (roles) se necessário.
- Implementar upload físico de arquivos (s3/local) se o front exigir.
- Habilitar migrações gerenciadas (e.g., Knex, Sequelize migrations) para controlar alterações no banco.

Arquivo de regras de negócio
- Veja `resources/business_rules.md` para o documento completo de regras de negócio e os status codes usados por cada endpoint.

- Adicionar testes automatizados.
- Implementar controle de permissões mais fino (roles) se necessário.
- Implementar upload físico de arquivos (s3/local) se o front exigir.
- Habilitar migrações gerenciadas (e.g., Knex, Sequelize migrations) para controlar alterações no banco.

Problemas conhecidos ao iniciar
- Certifique-se de definir `JWT_SECRET` em `.env` antes de usar endpoints autenticados — o servidor retornará erro 500 se estiver ausente.

## Frontend separado

O frontend fica em um projeto separado:

```text
CIBELE/
├── modelo_movelaria/       # frontend estático
└── modelo_movelaria_API/   # backend Node.js
```

Para executar os dois projetos localmente:

1. Configure o `.env` deste projeto com `FRONTEND_URL=http://localhost:5500`.
2. Inicie o MySQL e a API nesta pasta:

```bash
npm install
npm run dev
```

3. Em outro terminal, entre na pasta `modelo_movelaria` e execute:

```bash
python -m http.server 5500
```

4. Acesse `http://localhost:5500/index.html`.

A API estará em `http://localhost:3000/api`. O frontend seleciona essa URL automaticamente
em desenvolvimento por meio de `js/config.js`. O frontend nunca acessa o MySQL diretamente.

## Versionamento

Mantenha frontend e backend em repositórios Git separados. Eles se integram exclusivamente
pelo contrato HTTP documentado em `resources/swagger.yaml`.

Em cada pasta, depois de revisar os arquivos:

```bash
git init
git add .
git commit -m "chore: inicia projeto"
```
