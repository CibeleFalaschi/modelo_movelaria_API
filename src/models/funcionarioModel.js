const pool = require('../database/connection');

const table = 'Funcionario';
const publicFields = 'ID, nome, cargo, login, Perfil, Ativo';

async function findByLogin(login) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE login = ? LIMIT 1`, [login]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${publicFields} FROM ${table} WHERE ID = ? LIMIT 1`, [id]);
  return rows[0];
}

async function create(func) {
  const { nome, cargo, login, senhaHash, Perfil, Ativo } = func;
  const [result] = await pool.query(`INSERT INTO ${table} (nome, cargo, login, senhaHash, Perfil, Ativo) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, cargo || null, login, senhaHash || null, Perfil || 'funcionario', Ativo === undefined ? 1 : Ativo]);
  return { ID: result.insertId };
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const k of ['nome', 'cargo', 'login', 'senhaHash', 'Perfil', 'Ativo']) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); }
  }
  if (fields.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`, values);
}

async function remove(id) {
  await pool.query(`DELETE FROM ${table} WHERE ID = ?`, [id]);
}

async function list() {
  const [rows] = await pool.query(`SELECT ${publicFields} FROM ${table} ORDER BY nome`);
  return rows;
}

async function count() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
  return Number(rows[0].total);
}

async function countAdminsAtivos() {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table} WHERE Perfil = 'admin' AND Ativo = 1`);
  return Number(rows[0].total);
}

module.exports = { count, countAdminsAtivos, findByLogin, findById, create, update, remove, list };
