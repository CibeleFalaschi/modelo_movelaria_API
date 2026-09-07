const pool = require('../database/connection');
const table = 'Projeto';

async function create(proj) {
  const { IDOrcamento, IDStatus, NomeProjeto, DataInicio, DataConclusao, Observacao } = proj;
  const [result] = await pool.query(`INSERT INTO ${table} (IDOrcamento, IDStatus, NomeProjeto, DataInicio, DataConclusao, Observacao) VALUES (?, ?, ?, ?, ?, ?)`, [IDOrcamento, IDStatus, NomeProjeto, DataInicio, DataConclusao, Observacao]);
  return { ID: result.insertId };
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT p.*, s.descricao AS status FROM ${table} p LEFT JOIN StatusProjeto s ON p.IDStatus = s.ID WHERE p.ID = ? LIMIT 1`, [id]);
  return rows[0];
}

async function update(id, data) {
  const allowed = ['IDOrcamento','IDStatus','NomeProjeto','DataInicio','DataConclusao','Observacao'];
  const fields = [];
  const values = [];
  for (const k of allowed) { if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); } }
  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`, values);
}

async function list(limit = 100) { const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT ?`, [parseInt(limit,10)]); return rows; }
async function updateStatus(id, statusId) { await pool.query(`UPDATE ${table} SET IDStatus = ? WHERE ID = ?`, [statusId, id]); }

module.exports = { create, findById, update, list, updateStatus };
