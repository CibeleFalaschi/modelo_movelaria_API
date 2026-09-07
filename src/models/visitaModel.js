const pool = require('../database/connection');
const table = 'Visita';

async function create(visita) {
  const { IDOrcamento, IDStatus, DataAgendada, DataRealizada, Observacao } = visita;
  const [result] = await pool.query(`INSERT INTO ${table} (IDOrcamento, IDStatus, DataAgendada, DataRealizada, Observacao) VALUES (?, ?, ?, ?, ?)`, [IDOrcamento, IDStatus, DataAgendada, DataRealizada, Observacao]);
  return { ID: result.insertId };
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT v.*, s.descricao AS status FROM ${table} v LEFT JOIN StatusVisita s ON v.IDStatus = s.ID WHERE v.ID = ? LIMIT 1`, [id]);
  return rows[0];
}

async function update(id, data) {
  const allowed = ['IDOrcamento','IDStatus','DataAgendada','DataRealizada','Observacao'];
  const fields = [];
  const values = [];
  for (const k of allowed) { if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); } }
  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`, values);
}

async function list(limit = 100) {
  const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT ?`, [parseInt(limit,10)]);
  return rows;
}

async function updateStatus(id, statusId) { await pool.query(`UPDATE ${table} SET IDStatus = ? WHERE ID = ?`, [statusId, id]); }

module.exports = { create, findById, update, list, updateStatus };
