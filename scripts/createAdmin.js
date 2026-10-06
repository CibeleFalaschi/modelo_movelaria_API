require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../src/database/connection');

// Cria o administrador (ou redefine a senha se o login já existir), usando ADMIN_* do .env.
async function main() {
  const { ADMIN_NAME, ADMIN_LOGIN, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_LOGIN || !ADMIN_PASSWORD) throw new Error('Defina ADMIN_LOGIN e ADMIN_PASSWORD no .env');
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const [result] = await pool.query(
    "UPDATE Funcionario SET senhaHash = ?, Perfil = 'admin', Ativo = 1 WHERE login = ?",
    [hash, ADMIN_LOGIN]
  );

  if (result.affectedRows === 0) {
    await pool.query(
      "INSERT INTO Funcionario (nome, cargo, login, senhaHash, Perfil, Ativo) VALUES (?, ?, ?, ?, 'admin', 1)",
      [ADMIN_NAME || 'Administrador', 'Administrador', ADMIN_LOGIN, hash]
    );
    console.log('Administrador criado.');
  } else {
    console.log('Senha do administrador redefinida.');
  }
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
