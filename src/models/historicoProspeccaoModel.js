const pool = require('../database/connection');
const table = 'HistoricoProspeccao';

async function create(h) {
  const { IDProspeccao, TipoAcao, Observacao, ProximoContato } = h;
  const [result] = await pool.query(`INSERT INTO ${table} (IDProspeccao, TipoAcao, Observacao, ProximoContato) VALUES (?, ?, ?, ?)`, [IDProspeccao, TipoAcao, Observacao, ProximoContato]);
  return { ID: result.insertId };
}

async function listByProspeccao(id) { const [rows] = await pool.query(`SELECT * FROM ${table} WHERE IDProspeccao = ? ORDER BY ID DESC`, [id]); return rows; }

module.exports = { create, listByProspeccao };
