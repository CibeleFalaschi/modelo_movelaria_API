const pool = require('../database/connection');
const table = 'Empresa';

async function create(emp) {
  const { Nome, CNPJ } = emp;
  const [result] = await pool.query(`INSERT INTO ${table} (Nome, CNPJ) VALUES (?, ?)`, [Nome, CNPJ]);
  return { ID: result.insertId };
}

async function findById(id) { const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ID = ? LIMIT 1`, [id]); return rows[0]; }
async function update(id, data) {
  const allowed = ['Nome','CNPJ']; const fields = []; const values = [];
  for (const k of allowed) { if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); } }
  if (fields.length === 0) return; values.push(id); await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`, values);
}
async function list(limit=100) { const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT ?`, [parseInt(limit,10)]); return rows; }

module.exports = { create, findById, update, list };
