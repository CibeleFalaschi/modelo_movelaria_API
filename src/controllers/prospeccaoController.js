const prospeccaoService = require('../services/prospeccaoService');

function erro(status, message) { const e = new Error(message); e.status = status; return e; }
function normalizar(p) { return { IDFuncionario: p.IDFuncionario || p.idFuncionario, IDEmpresa: p.IDEmpresa || p.idEmpresa, NomeProspecto: p.NomeProspecto || p.nomeProspecto, Telefone: p.Telefone || p.telefone, Origem: p.Origem || p.origem, Status: p.Status || p.status }; }
function mapear(p) { return { ...p, id: p.ID, nomeProspecto: p.NomeProspecto, telefone: p.Telefone, origem: p.Origem, status: p.Status, idOrcamento: p.IDOrcamento, funcionario: { id: p.IDFuncionario, nome: p.funcionarioNome }, empresa: { id: p.IDEmpresa, nome: p.empresaNome, codigo: p.empresaCodigo } }; }

// Regra: a prospecção só vira "Convertido" quando o orçamento é gerado a partir dela (POST /orcamentos com idProspeccao).
async function create(req,res,next){ try{ const p = normalizar(req.body); if(!p.IDFuncionario || !p.IDEmpresa || !p.NomeProspecto) return res.status(400).json({error:'Nome, empresa e vendedor são obrigatórios'}); if (p.Status === 'Convertido') throw erro(400, 'Para converter, gere o orçamento a partir da prospecção'); const r = await prospeccaoService.createProspeccao(p); res.status(201).json(r);}catch(err){next(err);} }
async function list(req,res,next){ try{ const rows = await prospeccaoService.listProspeccoes(req.query.limit); res.json(rows.map(mapear));}catch(err){next(err);} }
async function getById(req,res,next){ try{ const r = await prospeccaoService.getById(req.params.id); if(!r) return res.status(404).json({error:'Not found'}); res.json(mapear(r));}catch(err){next(err);} }
async function update(req,res,next){ try{
  const atual = await prospeccaoService.getById(req.params.id);
  if (!atual) throw erro(404, 'Prospecção não encontrada');
  const dados = normalizar(req.body);
  if (dados.Status !== undefined && dados.Status !== atual.Status) {
    if (atual.IDOrcamento) throw erro(409, 'Prospecção já convertida em orçamento; o status não pode ser alterado');
    if (dados.Status === 'Convertido') throw erro(400, 'Para converter, gere o orçamento a partir da prospecção');
  }
  await prospeccaoService.updateProspeccao(req.params.id, dados); res.status(204).end();
}catch(err){next(err);} }
async function createHistorico(req,res,next){ try{ const id = req.params.id; const { TipoAcao, Observacao, ProximoContato } = req.body; if(!TipoAcao) return res.status(400).json({error:'TipoAcao obrigatório'}); const r = await prospeccaoService.createHistorico({ IDProspeccao: id, TipoAcao, Observacao, ProximoContato }); res.status(201).json(r);}catch(err){next(err);} }
async function listHistorico(req,res,next){ try{ const rows = await prospeccaoService.listHistorico(req.params.id); res.json(rows.map((h) => ({ id: h.ID, dataAcao: h.DataAcao, tipoAcao: h.TipoAcao, observacao: h.Observacao, proximoContato: h.ProximoContato })));}catch(err){next(err);} }
module.exports = { create, list, getById, update, createHistorico, listHistorico };
