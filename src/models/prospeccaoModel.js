const pool = require('../database/connection');
const table = 'Prospeccao';
const SELECT = `SELECT p.*, f.nome AS funcionarioNome, e.Nome AS empresaNome, e.Codigo AS empresaCodigo
  FROM ${table} p JOIN Funcionario f ON f.ID = p.IDFuncionario JOIN Empresa e ON e.ID = p.IDEmpresa`;

async function create(p) {
  const { IDFuncionario, IDEmpresa, NomeProspecto, Telefone, Origem, IDContato, Status } = p;
  const [result] = await pool.query(`INSERT INTO ${table} (IDFuncionario, IDEmpresa, NomeProspecto, Telefone, Origem, IDContato, Status) VALUES (?, ?, ?, ?, ?, ?, ?)`, [IDFuncionario, IDEmpresa, NomeProspecto, Telefone, Origem, IDContato, Status]);
  return { ID: result.insertId };
}

async function findById(id) { const [rows] = await pool.query(`${SELECT} WHERE p.ID = ? LIMIT 1`, [id]); return rows[0]; }
// IDOrcamento e IDContato não entram aqui: só a geração do orçamento (orcamentoService) os define.
async function update(id, data) { const allowed = ['IDFuncionario','IDEmpresa','NomeProspecto','Telefone','Origem','Status']; const fields=[]; const values=[]; for (const k of allowed) { if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); } } if (fields.length===0) return; values.push(id); await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`, values); }
async function list(limit=100) { const [rows] = await pool.query(`${SELECT} ORDER BY p.ID DESC LIMIT ?`, [parseInt(limit,10)]); return rows; }

module.exports = { create, findById, update, list };
