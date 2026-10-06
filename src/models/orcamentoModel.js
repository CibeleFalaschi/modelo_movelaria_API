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
  const sql = `SELECT o.*, c.nome AS contatoNome, c.telefone AS contatoTelefone, c.email AS contatoEmail, c.origem AS contatoOrigem,
    f.nome AS funcionarioNome, s.descricao AS statusDescricao, e.Nome AS empresaNome, e.Codigo AS empresaCodigo FROM ${table} o
    LEFT JOIN Contato c ON o.IDContato = c.ID
    LEFT JOIN Funcionario f ON o.IDFuncionario = f.ID
    LEFT JOIN StatusOrcamento s ON o.IDStatusOrcamento = s.ID
    LEFT JOIN Empresa e ON o.IDEmpresa = e.ID
    WHERE o.ID = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [id]);
  if (!rows[0]) return undefined;
  const row = rows[0];
  const [enderecos] = await pool.query('SELECT * FROM Endereco WHERE IDContato = ? ORDER BY Principal DESC, ID DESC LIMIT 1', [row.IDContato]);
  const [ambientes] = await pool.query('SELECT * FROM Ambiente WHERE IDOrcamento = ? ORDER BY ID', [id]);
  const [visitas] = await pool.query('SELECT * FROM Visita WHERE IDOrcamento = ? ORDER BY ID DESC LIMIT 1', [id]);
  const [projetos] = await pool.query('SELECT * FROM Projeto WHERE IDOrcamento = ? ORDER BY ID DESC LIMIT 1', [id]);
  const [historico] = await pool.query('SELECT h.ID, h.DataRegistro, h.Observacao, h.ProximoContato, f.nome AS funcionarioNome FROM HistoricoOrcamento h LEFT JOIN Funcionario f ON f.ID = h.IDFuncionario WHERE h.IDOrcamento = ? ORDER BY h.ID DESC LIMIT 10', [id]);
  row.visita = visitas[0] ? { id: visitas[0].ID, idStatus: visitas[0].IDStatus, dataAgendada: visitas[0].DataAgendada, observacao: visitas[0].Observacao } : null;
  row.projeto = projetos[0] ? { id: projetos[0].ID, idStatus: projetos[0].IDStatus, nomeProjeto: projetos[0].NomeProjeto, observacao: projetos[0].Observacao } : null;
  row.historico = historico.map((h) => ({ id: h.ID, dataRegistro: h.DataRegistro, observacao: h.Observacao, proximoContato: h.ProximoContato, funcionario: h.funcionarioNome }));
  row.contato = { id: row.IDContato, nome: row.contatoNome, telefone: row.contatoTelefone, email: row.contatoEmail, origem: row.contatoOrigem,
    endereco: enderecos[0] ? { id: enderecos[0].ID, endereco: enderecos[0].Logradouro, cidade: enderecos[0].Cidade, estado: enderecos[0].Estado, cep: enderecos[0].CEP } : null };
  row.ambientes = ambientes.map((ambiente) => ({ id: ambiente.ID, nome: ambiente.Nome, valor: Number(ambiente.Valor), observacao: ambiente.Observacao }));
  return row;
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
  const [rows] = await pool.query(`SELECT o.*, s.descricao AS statusDescricao, c.nome AS contatoNome, e.Nome AS empresaNome, e.Codigo AS empresaCodigo
    FROM ${table} o
    LEFT JOIN StatusOrcamento s ON o.IDStatusOrcamento = s.ID
    LEFT JOIN Contato c ON o.IDContato = c.ID
    LEFT JOIN Empresa e ON o.IDEmpresa = e.ID
    ORDER BY o.ID DESC
    LIMIT ?`, [safeLimit]);
  return rows;
}

async function updateStatus(id, statusId) {
  const sql = `UPDATE ${table} SET IDStatusOrcamento = ? WHERE ID = ?`;
  await pool.query(sql, [statusId, id]);
}

module.exports = { create, findById, update, list, updateStatus };
