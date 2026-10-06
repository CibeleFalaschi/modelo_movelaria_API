const pool = require('../database/connection');

const fields = ['IDContato', 'CPF_CNPJ', 'DataNascimento', 'Profissao', 'EstadoCivil', 'Observacao', 'CodigoCliente', 'IDEmpresa', 'DataCadastro', 'RG'];

async function create(data, connection = pool) {
  const values = fields.map((field) => data[field] ?? null);
  const [result] = await connection.query(
    `INSERT INTO Cliente (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, values
  );
  return { ID: result.insertId };
}

async function findByContato(idContato, connection = pool) {
  const [rows] = await connection.query('SELECT * FROM Cliente WHERE IDContato = ? LIMIT 1', [idContato]);
  return rows[0];
}

async function update(id, data) {
  const changed = fields.filter((field) => field !== 'IDContato' && data[field] !== undefined);
  if (!changed.length) return;
  await pool.query(`UPDATE Cliente SET ${changed.map((field) => `${field} = ?`).join(', ')} WHERE ID = ?`, [
    ...changed.map((field) => data[field]), id
  ]);
}

async function list() {
  const [rows] = await pool.query(`SELECT cl.*, c.nome AS contatoNome, c.telefone AS contatoTelefone, c.email AS contatoEmail,
    e.ID AS enderecoId, e.Logradouro, e.Numero, e.Complemento, e.Bairro, e.Cidade, e.Estado, e.CEP,
    em.ID AS empresaId, em.Nome AS empresaNome, em.Codigo AS empresaCodigo,
    COUNT(o.ID) AS totalOrcamentos
    FROM Cliente cl
    JOIN Contato c ON c.ID = cl.IDContato
    LEFT JOIN Endereco e ON e.IDContato = c.ID AND e.Principal = TRUE
    LEFT JOIN Empresa em ON em.ID = cl.IDEmpresa
    LEFT JOIN Orcamento o ON o.IDContato = c.ID
    GROUP BY cl.ID, c.ID, e.ID, em.ID
    ORDER BY cl.ID DESC`);
  return rows;
}

module.exports = { create, findByContato, update, list };
