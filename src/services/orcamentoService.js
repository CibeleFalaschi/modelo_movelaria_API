const pool = require('../database/connection');
const orcamentoModel = require('../models/orcamentoModel');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Data local (YYYY-MM-DD). toISOString() usa UTC e, no Brasil, vira "amanhã" após as 21h.
function hoje() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Aceita camelCase (frontend) e PascalCase (contrato antigo da API).
function pick(data, camel) {
  const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  return data[camel] !== undefined ? data[camel] : data[pascal];
}

function mapOrcamento(row) {
  if (!row) return row;
  return {
    ...row,
    id: row.ID,
    numeroOrcamento: row.NumeroOrcamento,
    dataSolicitacao: row.DataSolicitacao,
    dataEntregaOrcamento: row.DataEntregaOrcamento,
    dataFechamento: row.DataFechamento,
    observacao: row.Observacao,
    idEmpresa: row.IDEmpresa,
    idFuncionario: row.IDFuncionario,
    idStatusOrcamento: row.IDStatusOrcamento,
    necessitaVisita: Boolean(row.NecessitaVisita),
    necessitaProjeto: Boolean(row.NecessitaProjeto),
    valor: Number(row.Valor),
    status: row.statusDescricao,
    empresaNome: row.empresaNome,
    empresaCodigo: row.empresaCodigo,
    contato: row.contato || (row.contatoNome ? { nome: row.contatoNome } : undefined)
  };
}

function validarDatas(solicitacao, entrega, fechamento) {
  if (entrega && entrega < solicitacao) throw httpError(400, 'A data de entrega não pode ser anterior à data de solicitação');
  if (fechamento && fechamento < solicitacao) throw httpError(400, 'A data de fechamento não pode ser anterior à data de solicitação');
}

function validarAmbientes(ambientes) {
  const lista = [];
  for (const ambiente of ambientes || []) {
    const nome = String(ambiente.nome || '').trim();
    if (!nome) continue;
    const valor = Number(ambiente.valor) || 0;
    if (valor < 0) throw httpError(400, `Valor do ambiente "${nome}" é inválido`);
    lista.push({ nome, valor, observacao: ambiente.observacao || null });
  }
  return lista;
}

// Um contato só vira cliente quando o orçamento é fechado (regra de negócio).
async function converterEmCliente(connection, idContato, idEmpresa) {
  await connection.query(`INSERT INTO Cliente (IDContato, IDEmpresa, DataCadastro)
    SELECT ?, ?, CURDATE() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM Cliente WHERE IDContato = ?)`,
  [idContato, idEmpresa, idContato]);
}

async function codigoDoStatus(connection, idStatus) {
  const [rows] = await connection.query('SELECT codigo FROM StatusOrcamento WHERE ID = ?', [idStatus]);
  if (!rows[0]) throw httpError(400, 'Status de orçamento inválido');
  return rows[0].codigo;
}

async function createOrcamento(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Regra: a prospecção só vira orçamento quando a pessoa aceita e envia os dados para cotação.
    const idProspeccao = Number(pick(data, 'idProspeccao')) || null;
    if (idProspeccao) {
      const [prospeccoes] = await connection.query('SELECT IDOrcamento FROM Prospeccao WHERE ID = ? FOR UPDATE', [idProspeccao]);
      if (!prospeccoes[0]) throw httpError(400, 'Prospecção não encontrada');
      if (prospeccoes[0].IDOrcamento) throw httpError(409, 'Esta prospecção já gerou um orçamento');
    }
    let idContato = pick(data, 'idContato');
    if (!idContato) {
      const contato = data.dadosContato || {};
      if (!contato.nome || !contato.telefone || !contato.email || !contato.origem) {
        throw httpError(400, 'Dados completos do contato são obrigatórios');
      }
      const [result] = await connection.query('INSERT INTO Contato (nome, telefone, email, origem) VALUES (?, ?, ?, ?)',
        [contato.nome, contato.telefone, contato.email, contato.origem]);
      idContato = result.insertId;
    }
    const idEmpresa = Number(pick(data, 'idEmpresa'));
    const idStatus = Number(pick(data, 'idStatusOrcamento'));
    const idFuncionario = Number(pick(data, 'idFuncionario'));
    if (!idEmpresa || !idStatus || !idFuncionario) throw httpError(400, 'Empresa, status e responsável são obrigatórios');

    const [empresas] = await connection.query('SELECT Codigo FROM Empresa WHERE ID = ?', [idEmpresa]);
    if (!empresas[0]) throw httpError(400, 'Empresa não encontrada');
    const statusCodigo = await codigoDoStatus(connection, idStatus);

    const dataSolicitacao = pick(data, 'dataSolicitacao') || hoje();
    const dataEntrega = pick(data, 'dataEntregaOrcamento') || null;
    let dataFechamento = pick(data, 'dataFechamento') || null;
    if (statusCodigo === 'fechado' && !dataFechamento) dataFechamento = hoje();
    validarDatas(dataSolicitacao, dataEntrega, dataFechamento);

    const ambientes = validarAmbientes(data.ambientes);
    let valor = Number(pick(data, 'valor'));
    if (ambientes.length) valor = ambientes.reduce((total, item) => total + item.valor, 0);
    if (!Number.isFinite(valor) || valor < 0) throw httpError(400, 'Valor do orçamento é inválido');

    const ano = Number(pick(data, 'ano') || dataSolicitacao.slice(0, 4));
    const mes = Number(pick(data, 'mes') || dataSolicitacao.slice(5, 7));
    const [sequenceRows] = await connection.query(
      'SELECT COALESCE(MAX(NumeroSequencial), 0) + 1 AS proximo FROM Orcamento WHERE IDEmpresa = ? AND Ano = ? FOR UPDATE', [idEmpresa, ano]);
    const numeroSequencial = Number(pick(data, 'numeroSequencial') || sequenceRows[0].proximo);
    // O código da empresa entra no número: NumeroOrcamento é único no banco inteiro e a
    // sequência reinicia por empresa/ano (sem isso, a 2ª empresa não conseguiria salvar o 1º orçamento).
    const numeroOrcamento = pick(data, 'numeroOrcamento')
      || `${empresas[0].Codigo.toUpperCase()}-${ano}-${String(numeroSequencial).padStart(4, '0')}`;

    const [orcamento] = await connection.query(
      `INSERT INTO Orcamento (IDContato, IDStatusOrcamento, IDFuncionario, IDEmpresa, NumeroOrcamento, DataSolicitacao, NecessitaProjeto, NecessitaVisita, Observacao, Valor, DataEntregaOrcamento, DataFechamento, NumeroSequencial, Mes, Ano)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idContato, idStatus, idFuncionario, idEmpresa, numeroOrcamento, dataSolicitacao,
        Boolean(pick(data, 'necessitaProjeto')), Boolean(pick(data, 'necessitaVisita')), pick(data, 'observacao') ?? null,
        valor, dataEntrega, dataFechamento, numeroSequencial, mes, ano]);
    const idOrcamento = orcamento.insertId;

    for (const ambiente of ambientes) {
      await connection.query('INSERT INTO Ambiente (IDOrcamento, Nome, Valor, Observacao) VALUES (?, ?, ?, ?)',
        [idOrcamento, ambiente.nome, ambiente.valor, ambiente.observacao]);
    }
    if (data.visita) await connection.query('INSERT INTO Visita (IDOrcamento, IDStatus, DataAgendada, Observacao) VALUES (?, ?, ?, ?)',
      [idOrcamento, data.visita.idStatus, data.visita.dataAgendada || null, data.visita.observacao || null]);
    if (data.projeto) await connection.query('INSERT INTO Projeto (IDOrcamento, IDStatus, NomeProjeto, Observacao) VALUES (?, ?, ?, ?)',
      [idOrcamento, data.projeto.idStatus, data.projeto.nomeProjeto || null, data.projeto.observacao || null]);
    if (data.obsHistorico) await connection.query('INSERT INTO HistoricoOrcamento (IDOrcamento, IDFuncionario, Observacao, ProximoContato) VALUES (?, ?, ?, ?)',
      [idOrcamento, idFuncionario, data.obsHistorico, data.proximoContato || null]);
    if (statusCodigo === 'fechado') await converterEmCliente(connection, idContato, idEmpresa);
    if (idProspeccao) await connection.query("UPDATE Prospeccao SET Status = 'Convertido', IDContato = ?, IDOrcamento = ? WHERE ID = ?",
      [idContato, idOrcamento, idProspeccao]);

    await connection.commit();
    return { ID: idOrcamento, id: idOrcamento, numeroOrcamento };
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

// Edição a partir da tela de briefing: atualiza dados, substitui ambientes e trata visita/projeto/histórico.
async function updateOrcamento(id, data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [atuais] = await connection.query('SELECT * FROM Orcamento WHERE ID = ? FOR UPDATE', [id]);
    const atual = atuais[0];
    if (!atual) throw httpError(404, 'Orçamento não encontrado');

    const idStatus = Number(pick(data, 'idStatusOrcamento') || atual.IDStatusOrcamento);
    const idFuncionario = Number(pick(data, 'idFuncionario') || atual.IDFuncionario);
    const statusCodigo = await codigoDoStatus(connection, idStatus);
    const statusAnterior = await codigoDoStatus(connection, atual.IDStatusOrcamento);

    const dataEntrega = pick(data, 'dataEntregaOrcamento') !== undefined ? (pick(data, 'dataEntregaOrcamento') || null) : atual.DataEntregaOrcamento;
    let dataFechamento = pick(data, 'dataFechamento') !== undefined ? (pick(data, 'dataFechamento') || null) : atual.DataFechamento;
    if (statusCodigo === 'fechado' && !dataFechamento) dataFechamento = hoje();
    if (statusCodigo !== 'fechado' && statusAnterior === 'fechado') dataFechamento = null;
    validarDatas(atual.DataSolicitacao, dataEntrega, dataFechamento);

    let valor = pick(data, 'valor') !== undefined ? Number(pick(data, 'valor')) : Number(atual.Valor);
    if (Array.isArray(data.ambientes)) {
      const ambientes = validarAmbientes(data.ambientes);
      await connection.query('DELETE FROM Ambiente WHERE IDOrcamento = ?', [id]);
      for (const ambiente of ambientes) {
        await connection.query('INSERT INTO Ambiente (IDOrcamento, Nome, Valor, Observacao) VALUES (?, ?, ?, ?)',
          [id, ambiente.nome, ambiente.valor, ambiente.observacao]);
      }
      valor = ambientes.reduce((total, item) => total + item.valor, 0);
    }
    if (!Number.isFinite(valor) || valor < 0) throw httpError(400, 'Valor do orçamento é inválido');

    const necessitaVisita = pick(data, 'necessitaVisita') !== undefined ? Boolean(pick(data, 'necessitaVisita')) : Boolean(atual.NecessitaVisita);
    const necessitaProjeto = pick(data, 'necessitaProjeto') !== undefined ? Boolean(pick(data, 'necessitaProjeto')) : Boolean(atual.NecessitaProjeto);
    const observacao = pick(data, 'observacao') !== undefined ? pick(data, 'observacao') : atual.Observacao;

    await connection.query(`UPDATE Orcamento SET IDStatusOrcamento = ?, IDFuncionario = ?, NecessitaVisita = ?, NecessitaProjeto = ?,
      Observacao = ?, Valor = ?, DataEntregaOrcamento = ?, DataFechamento = ? WHERE ID = ?`,
    [idStatus, idFuncionario, necessitaVisita, necessitaProjeto, observacao, valor, dataEntrega, dataFechamento, id]);

    const contato = data.dadosContato;
    if (contato) {
      await connection.query('UPDATE Contato SET nome = COALESCE(?, nome), telefone = COALESCE(?, telefone), email = COALESCE(?, email), origem = COALESCE(?, origem) WHERE ID = ?',
        [contato.nome || null, contato.telefone || null, contato.email || null, contato.origem || null, atual.IDContato]);
    }

    if (data.visita) {
      const [visitas] = await connection.query('SELECT ID FROM Visita WHERE IDOrcamento = ? ORDER BY ID DESC LIMIT 1', [id]);
      if (visitas[0]) await connection.query('UPDATE Visita SET IDStatus = ?, DataAgendada = ? WHERE ID = ?',
        [data.visita.idStatus, data.visita.dataAgendada || null, visitas[0].ID]);
      else await connection.query('INSERT INTO Visita (IDOrcamento, IDStatus, DataAgendada, Observacao) VALUES (?, ?, ?, ?)',
        [id, data.visita.idStatus, data.visita.dataAgendada || null, data.visita.observacao || null]);
    }
    if (data.projeto) {
      const [projetos] = await connection.query('SELECT ID FROM Projeto WHERE IDOrcamento = ? ORDER BY ID DESC LIMIT 1', [id]);
      if (projetos[0]) await connection.query('UPDATE Projeto SET IDStatus = ?, Observacao = ? WHERE ID = ?',
        [data.projeto.idStatus, data.projeto.observacao || null, projetos[0].ID]);
      else await connection.query('INSERT INTO Projeto (IDOrcamento, IDStatus, NomeProjeto, Observacao) VALUES (?, ?, ?, ?)',
        [id, data.projeto.idStatus, data.projeto.nomeProjeto || null, data.projeto.observacao || null]);
    }
    if (data.obsHistorico) await connection.query('INSERT INTO HistoricoOrcamento (IDOrcamento, IDFuncionario, Observacao, ProximoContato) VALUES (?, ?, ?, ?)',
      [id, idFuncionario, data.obsHistorico, data.proximoContato || null]);

    if (statusCodigo === 'fechado') await converterEmCliente(connection, atual.IDContato, atual.IDEmpresa);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

async function getOrcamentoById(id) { return mapOrcamento(await orcamentoModel.findById(id)); }
async function listOrcamentos(limit) { return (await orcamentoModel.list(limit)).map(mapOrcamento); }

async function updateStatus(id, statusId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [atuais] = await connection.query('SELECT * FROM Orcamento WHERE ID = ? FOR UPDATE', [id]);
    if (!atuais[0]) { await connection.rollback(); return undefined; }
    const statusCodigo = await codigoDoStatus(connection, statusId);
    let dataFechamento = atuais[0].DataFechamento;
    if (statusCodigo === 'fechado' && !dataFechamento) dataFechamento = hoje();
    if (statusCodigo !== 'fechado') dataFechamento = null;
    await connection.query('UPDATE Orcamento SET IDStatusOrcamento = ?, DataFechamento = ? WHERE ID = ?', [statusId, dataFechamento, id]);
    if (statusCodigo === 'fechado') await converterEmCliente(connection, atuais[0].IDContato, atuais[0].IDEmpresa);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  return getOrcamentoById(id);
}

module.exports = { createOrcamento, getOrcamentoById, updateOrcamento, listOrcamentos, updateStatus };
