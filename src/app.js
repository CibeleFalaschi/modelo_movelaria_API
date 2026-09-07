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

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', status: 404 });
});

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err instanceof SyntaxError && err.type === 'entity.parse.failed' ? 400 : 500);
  res.status(status).json({
    error: status === 400 ? 'Invalid JSON body' : (err.message || 'Internal Server Error'),
    status
  });
});

module.exports = app;
