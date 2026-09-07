require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../src/database/connection');

async function main() {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

  const [result] = await pool.query(
    'UPDATE Funcionario SET senhaHash = ?, Ativo = 1 WHERE login = ?',
    [hash, process.env.ADMIN_LOGIN]
  );

  if (result.affectedRows === 0) {
    throw new Error('Usuário admin não encontrado.');
  }

  console.log('Senha do administrador redefinida.');
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());