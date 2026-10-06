const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const pool = require('./database/connection');

const swaggerDocument = YAML.load(__dirname + '/../resources/swagger.yaml');

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'modelo-movelaria-api' });
});

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'modelo-movelaria-api', database: 'ok' });
  } catch (err) {
    console.error('Database health check failed:', err.message);
    res.status(503).json({
      status: 'degraded',
      service: 'modelo-movelaria-api',
      database: 'unavailable'
    });
  }
});

app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Opcional: serve o frontend estático pela própria API (uma única URL/processo em produção).
if (process.env.FRONTEND_DIR) {
  app.use(express.static(path.resolve(process.env.FRONTEND_DIR), { index: 'index.html' }));
}

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', status: 404 });
});

// Erros de banco que o usuário pode causar viram 4xx com mensagem clara (nunca vazam SQL).
const dbErrors = {
  ER_DUP_ENTRY: [409, 'Já existe um registro com esses dados (valor duplicado).'],
  ER_NO_REFERENCED_ROW_2: [400, 'Registro relacionado não encontrado (verifique empresa, funcionário, status ou contato).'],
  ER_ROW_IS_REFERENCED_2: [409, 'Este registro está em uso e não pode ser removido.'],
  ER_DATA_TOO_LONG: [400, 'Algum campo excede o tamanho permitido.'],
  ER_TRUNCATED_WRONG_VALUE: [400, 'Algum campo possui valor inválido.'],
  ER_CHECK_CONSTRAINT_VIOLATED: [400, 'Algum campo possui valor inválido.'],
  LIMIT_FILE_SIZE: [413, 'Arquivo maior que 15 MB.'],
  LIMIT_UNEXPECTED_FILE: [400, 'Envie apenas um arquivo por vez.'],
  ER_BAD_NULL_ERROR: [400, 'Preencha os campos obrigatórios.']
};

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  const mapped = dbErrors[err.code];
  const status = mapped ? mapped[0] : err.status || (err instanceof SyntaxError && err.type === 'entity.parse.failed' ? 400 : 500);
  let error;
  if (mapped) error = mapped[1];
  else if (status === 400 && err instanceof SyntaxError) error = 'Invalid JSON body';
  else if (status >= 500) error = 'Erro interno do servidor';
  else error = err.message;
  res.status(status).json({ error, status });
});

module.exports = app;
