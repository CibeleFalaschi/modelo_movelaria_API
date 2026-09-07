const pool = require('../database/connection');
const table = 'Orcamento';

async function create(orc) {
  const cols = ['IDContato','IDStatusOrcamento','IDFuncionario','NumeroOrcamento','DataSolicitacao','NecessitaProjeto','NecessitaVisita','Observacao','Valor','DataEntregaOrcamento','DataFechamento','NumeroSequencial','Mes','Ano','IDEmpresa'];
  const vals = cols.map(c => orc[c] === undefined ? null : orc[c]);
  const placeholders = cols.map(() => '?').join(', ');
  const [result] = await pool.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`, vals);
  return { ID: result.insertId };
}

async function findById(id) {
  const sql = `SELECT o.*, c.nome AS contatoNome, f.nome AS funcionarioNome, s.descricao AS statusDescricao, e.Nome AS empresaNome FROM ${table} o
    LEFT JOIN Contato c ON o.IDContato = c.ID
    LEFT JOIN Funcionario f ON o.IDFuncionario = f.ID
    LEFT JOIN StatusOrcamento s ON o.IDStatusOrcamento = s.ID
    LEFT JOIN Empresa e ON o.IDEmpresa = e.ID
    WHERE o.ID = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
}

async function update(id, data) {
  const allowed = ['IDContato','IDStatusOrcamento','IDFuncionario','NumeroOrcamento','DataSolicitacao','NecessitaProjeto','NecessitaVisita','Observacao','Valor','DataEntregaOrcamento','DataFechamento','NumeroSequencial','Mes','Ano','IDEmpresa'];
  const fields = [];
  const values = [];
  for (const k of allowed) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]); }
  }
  if (fields.length === 0) return;
  values.push(id);
  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE ID = ?`;
  await pool.query(sql, values);
}

async function list(limit = 100) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 1000);
  const [rows] = await pool.query(`SELECT o.*, s.descricao AS statusDescricao
    FROM ${table} o
    LEFT JOIN StatusOrcamento s ON o.IDStatusOrcamento = s.ID
    ORDER BY o.ID DESC
    LIMIT ?`, [safeLimit]);
  return rows;
}

async function updateStatus(id, statusId) {
  const sql = `UPDATE ${table} SET IDStatusOrcamento = ? WHERE ID = ?`;
  await pool.query(sql, [statusId, id]);
}

module.exports = { create, findById, update, list, updateStatus };
