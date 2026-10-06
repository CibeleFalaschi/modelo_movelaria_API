const pool = require('../database/connection');

// Próximos contatos pendentes: só o último registro de cada orçamento/prospecção em andamento.
async function proximosContatos() {
  const [orcamentos] = await pool.query(`SELECT h.ProximoContato AS data, h.Observacao AS observacao, c.nome AS contato, c.telefone,
      f.nome AS responsavel, o.ID AS idOrcamento, o.NumeroOrcamento AS numero
    FROM HistoricoOrcamento h
    JOIN Orcamento o ON o.ID = h.IDOrcamento
    JOIN StatusOrcamento s ON s.ID = o.IDStatusOrcamento AND s.codigo IN ('aberto', 'elaboracao')
    JOIN Contato c ON c.ID = o.IDContato
    LEFT JOIN Funcionario f ON f.ID = COALESCE(h.IDFuncionario, o.IDFuncionario)
    WHERE h.ProximoContato IS NOT NULL
      AND h.ID = (SELECT MAX(h2.ID) FROM HistoricoOrcamento h2 WHERE h2.IDOrcamento = h.IDOrcamento)`);
  const [prospeccoes] = await pool.query(`SELECT h.ProximoContato AS data, h.Observacao AS observacao, p.NomeProspecto AS contato,
      p.Telefone AS telefone, f.nome AS responsavel, p.ID AS idProspeccao
    FROM HistoricoProspeccao h
    JOIN Prospeccao p ON p.ID = h.IDProspeccao AND p.Status = 'Em andamento'
    JOIN Funcionario f ON f.ID = p.IDFuncionario
    WHERE h.ProximoContato IS NOT NULL
      AND h.ID = (SELECT MAX(h2.ID) FROM HistoricoProspeccao h2 WHERE h2.IDProspeccao = h.IDProspeccao)`);
  return [
    ...orcamentos.map((item) => ({ ...item, origem: 'orcamento' })),
    ...prospeccoes.map((item) => ({ ...item, origem: 'prospeccao' }))
  ].sort((a, b) => String(a.data).localeCompare(String(b.data))).slice(0, 50);
}

async function visitas() {
  const [rows] = await pool.query(`SELECT v.ID AS id, v.DataAgendada AS data, sv.descricao AS status, c.nome AS contato, c.telefone,
      f.nome AS responsavel, o.ID AS idOrcamento, o.NumeroOrcamento AS numero
    FROM Visita v
    JOIN StatusVisita sv ON sv.ID = v.IDStatus AND sv.codigo IN ('pendente', 'agendada')
    JOIN Orcamento o ON o.ID = v.IDOrcamento
    JOIN StatusOrcamento so ON so.ID = o.IDStatusOrcamento AND so.codigo <> 'perdido'
    JOIN Contato c ON c.ID = o.IDContato
    LEFT JOIN Funcionario f ON f.ID = o.IDFuncionario
    ORDER BY v.DataAgendada IS NULL, v.DataAgendada, v.ID
    LIMIT 50`);
  return rows;
}

module.exports = { proximosContatos, visitas };
