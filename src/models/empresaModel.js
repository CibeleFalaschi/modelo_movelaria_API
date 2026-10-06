const pool = require('../database/connection');
const table = 'Empresa';
// Campos editáveis; os dados de contrato (endereço, contatos, responsável) vêm do banco, nunca do código.
const CAMPOS = ['Codigo', 'Nome', 'CNPJ', 'Endereco', 'Bairro', 'Cidade', 'CEP', 'Telefone', 'Whatsapp', 'Email', 'EmailFinanceiro', 'Responsavel'];

async function create(emp) {
  const campos = CAMPOS.filter((k) => emp[k] !== undefined);
  const [result] = await pool.query(`INSERT INTO ${table} (${campos.join(', ')}) VALUES (${campos.map(() => '?').join(', ')})`, campos.map((k) => emp[k]));
  return { ID: result.insertId };
}

async function findById(id) { const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ID = ? LIMIT 1`, [id]); return rows[0]; }
async function update(id, data) {
  const fields = []; const values = [];
  for (const k of CAMPOS) { if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); } }
  if (fields.length === 0) return; values.push(id); await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`, values);
}
async function list(limit=100) { const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT ?`, [parseInt(limit,10)]); return rows; }

module.exports = { create, findById, update, list };
