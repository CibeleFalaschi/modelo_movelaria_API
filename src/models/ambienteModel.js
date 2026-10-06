const pool = require('../database/connection');
const table = 'Ambiente';

async function create(amb) {
  const { IDOrcamento, Nome, Valor, Observacao = null } = amb;
  const [result] = await pool.query(`INSERT INTO ${table} (IDOrcamento, Nome, Valor, Observacao) VALUES (?, ?, ?, ?)`, [IDOrcamento, Nome, Valor, Observacao]);
  return { ID: result.insertId };
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ID = ? LIMIT 1`, [id]);
  return rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const k of ['IDOrcamento','Nome','Valor','Observacao']) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); }
  }
  if (fields.length === 0) return;
  values.push(id);
  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`;
  await pool.query(sql, values);
}

async function remove(id) {
  await pool.query(`DELETE FROM ${table} WHERE ID = ?`, [id]);
}

async function listByOrcamento(idOrc) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE IDOrcamento = ?`, [idOrc]);
  return rows;
}

module.exports = { create, findById, update, remove, listByOrcamento };
