const projetoService = require('../services/projetoService');
const statusModel = require('../models/statusModel');

async function create(req,res,next){ try{ const p=req.body; if(!p.IDOrcamento || !p.IDStatus) return res.status(400).json({error:'IDOrcamento e IDStatus obrigatórios'}); const r = await projetoService.createProjeto(p); res.status(201).json(r);}catch(err){next(err);} }
async function list(req,res,next){ try{ const rows = await projetoService.listProjetos(req.query.limit); res.json(rows);}catch(err){next(err);} }
async function getById(req,res,next){ try{ const r = await projetoService.getById(req.params.id); if(!r) return res.status(404).json({error:'Not found'}); res.json(r);}catch(err){next(err);} }
async function update(req,res,next){ try{ await projetoService.updateProjeto(req.params.id, req.body); res.status(204).end(); }catch(err){next(err);} }
async function patchStatus(req,res,next){
  try {
    const { IDStatus } = req.body;
    if (!Number.isInteger(Number(IDStatus)) || Number(IDStatus) < 1) {
      return res.status(400).json({error:'IDStatus deve ser um número inteiro positivo'});
    }
    if (!await statusModel.exists('projetos', Number(IDStatus))) {
      return res.status(400).json({error:'Status de projeto inválido'});
    }
    const updated = await projetoService.updateStatus(req.params.id, Number(IDStatus));
    if (!updated) return res.status(404).json({error:'Projeto não encontrado'});
    res.json(updated);
  } catch (err) { next(err); }
}
module.exports = { create, list, getById, update, patchStatus };
