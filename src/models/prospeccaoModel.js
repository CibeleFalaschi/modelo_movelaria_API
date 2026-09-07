const pool = require('../database/connection');
const table = 'Prospeccao';

async function create(p) {
  const { IDFuncionario, NomeProspecto, Telefone, Origem, IDContato, Status } = p;
  const [result] = await pool.query(`INSERT INTO ${table} (IDFuncionario, NomeProspecto, Telefone, Origem, IDContato, Status) VALUES (?, ?, ?, ?, ?, ?)`, [IDFuncionario, NomeProspecto, Telefone, Origem, IDContato, Status]);
  return { ID: result.insertId };
}

async function findById(id) { const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ID = ? LIMIT 1`, [id]); return rows[0]; }
async function update(id, data) { const allowed = ['IDFuncionario','NomeProspecto','Telefone','Origem','IDContato','Status']; const fields=[]; const values=[]; for (const k of allowed) { if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); } } if (fields.length===0) return; values.push(id); await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`, values); }
async function list(limit=100) { const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT ?`, [parseInt(limit,10)]); return rows; }

module.exports = { create, findById, update, list };
