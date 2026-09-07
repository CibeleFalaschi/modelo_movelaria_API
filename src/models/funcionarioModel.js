const pool = require('../database/connection');

const table = 'Funcionario';

async function findByLogin(login) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE login = ? LIMIT 1`, [login]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ID, nome, cargo, login, Ativo FROM ${table} WHERE ID = ? LIMIT 1`, [id]);
  return rows[0];
}

async function create(func) {
  const { nome, cargo, login, senhaHash, Ativo } = func;
  const [result] = await pool.query(`INSERT INTO ${table} (nome, cargo, login, senhaHash, Ativo) VALUES (?, ?, ?, ?, ?)`,
    [nome, cargo, login, senhaHash || null, Ativo === undefined ? 1 : Ativo]);
  return { ID: result.insertId };
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const k of ['nome','cargo','login','senhaHash','Ativo']) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); }
  }
  if (fields.length === 0) return;
  values.push(id);
  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`;
  await pool.query(sql, values);
}

async function list() {
  const [rows] = await pool.query(`SELECT ID, nome, cargo, login, Ativo FROM ${table}`);
  return rows;
}

module.exports = { findByLogin, findById, create, update, list };
