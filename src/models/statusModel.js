const pool = require('../database/connection');

const statusTables = {
  orcamentos: 'StatusOrcamento',
  visitas: 'StatusVisita',
  projetos: 'StatusProjeto'
};

async function listAll() {
  const result = {};

  for (const [resource, table] of Object.entries(statusTables)) {
    const [rows] = await pool.query(`SELECT ID, codigo, descricao FROM ${table} ORDER BY ID`);
    result[resource] = rows;
  }

  return result;
}

async function exists(resource, id) {
  const table = statusTables[resource];
  if (!table) return false;

  const [rows] = await pool.query(`SELECT ID FROM ${table} WHERE ID = ? LIMIT 1`, [id]);
  return rows.length > 0;
}

module.exports = { listAll, exists };
