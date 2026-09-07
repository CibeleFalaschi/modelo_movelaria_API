const prospeccaoService = require('../services/prospeccaoService');

async function create(req,res,next){ try{ const p = req.body; if(!p.IDFuncionario || !p.NomeProspecto) return res.status(400).json({error:'Campos obrigatórios'}); const r = await prospeccaoService.createProspeccao(p); res.status(201).json(r);}catch(err){next(err);} }
async function list(req,res,next){ try{ const rows = await prospeccaoService.listProspeccoes(req.query.limit); res.json(rows);}catch(err){next(err);} }
async function getById(req,res,next){ try{ const r = await prospeccaoService.getById(req.params.id); if(!r) return res.status(404).json({error:'Not found'}); res.json(r);}catch(err){next(err);} }
async function update(req,res,next){ try{ await prospeccaoService.updateProspeccao(req.params.id, req.body); res.status(204).end(); }catch(err){next(err);} }
async function createHistorico(req,res,next){ try{ const id = req.params.id; const { TipoAcao, Observacao, ProximoContato } = req.body; if(!TipoAcao) return res.status(400).json({error:'TipoAcao obrigatório'}); const r = await prospeccaoService.createHistorico({ IDProspeccao: id, TipoAcao, Observacao, ProximoContato }); res.status(201).json(r);}catch(err){next(err);} }
async function listHistorico(req,res,next){ try{ const rows = await prospeccaoService.listHistorico(req.params.id); res.json(rows);}catch(err){next(err);} }
module.exports = { create, list, getById, update, createHistorico, listHistorico };
