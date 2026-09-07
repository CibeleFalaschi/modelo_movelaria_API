const pool = require('../database/connection');
const table = 'Arquivo';

async function create(file) {
  const { IDOrcamento, NomeArquivo, Caminho, Tipo } = file;
  const [result] = await pool.query(`INSERT INTO ${table} (IDOrcamento, NomeArquivo, Caminho, Tipo) VALUES (?, ?, ?, ?)`, [IDOrcamento, NomeArquivo, Caminho, Tipo]);
  return { ID: result.insertId };
}

async function findById(id) { const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ID = ? LIMIT 1`, [id]); return rows[0]; }
async function list(limit=100) { const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT ?`, [parseInt(limit,10)]); return rows; }
async function listByOrcamento(idOrc) { const [rows] = await pool.query(`SELECT * FROM ${table} WHERE IDOrcamento = ?`, [idOrc]); return rows; }
async function remove(id) { await pool.query(`DELETE FROM ${table} WHERE ID = ?`, [id]); }

module.exports = { create, findById, list, listByOrcamento, remove };
