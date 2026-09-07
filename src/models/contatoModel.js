const pool = require('../database/connection');
const table = 'Contato';

async function create(contato) {
  const { nome, telefone, email, origem } = contato;
  const [result] = await pool.query(`INSERT INTO ${table} (nome, telefone, email, origem) VALUES (?, ?, ?, ?)`, [nome, telefone, email, origem]);
  return { ID: result.insertId };
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ID = ? LIMIT 1`, [id]);
  return rows[0];
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const k of ['nome','telefone','email','origem']) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); }
  }
  if (fields.length === 0) return;
  values.push(id);
  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`;
  await pool.query(sql, values);
}

async function list() {
  const [rows] = await pool.query(`SELECT * FROM ${table}`);
  return rows;
}

module.exports = { create, findById, update, list };
