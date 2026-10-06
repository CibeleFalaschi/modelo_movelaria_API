const pool = require('../database/connection');

const fields = ['IDContato', 'Logradouro', 'Numero', 'Complemento', 'Bairro', 'Cidade', 'Estado', 'CEP', 'Tipo', 'Principal'];

async function create(data, connection = pool) {
  const values = fields.map((field) => data[field] ?? null);
  const [result] = await connection.query(
    `INSERT INTO Endereco (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
    values
  );
  return { ID: result.insertId };
}

async function findByContato(idContato) {
  const [rows] = await pool.query('SELECT * FROM Endereco WHERE IDContato = ? ORDER BY Principal DESC, ID DESC', [idContato]);
  return rows;
}

async function update(id, data) {
  const changed = fields.filter((field) => data[field] !== undefined);
  if (!changed.length) return;
  await pool.query(`UPDATE Endereco SET ${changed.map((field) => `${field} = ?`).join(', ')} WHERE ID = ?`, [
    ...changed.map((field) => data[field]), id
  ]);
}

module.exports = { create, findByContato, update };
