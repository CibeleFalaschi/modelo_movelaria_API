const empresaService = require('../services/empresaService');

async function create(req,res,next){ try{ const { Nome } = req.body; if(!Nome) return res.status(400).json({error:'Nome obrigatório'}); const r = await empresaService.createEmpresa(req.body); res.status(201).json(r);}catch(err){next(err);} }
async function list(req,res,next){ try{ const rows = await empresaService.listEmpresas(req.query.limit); res.json(rows);}catch(err){next(err);} }
async function getById(req,res,next){ try{ const r = await empresaService.getById(req.params.id); if(!r) return res.status(404).json({error:'Not found'}); res.json(r);}catch(err){next(err);} }
async function update(req,res,next){ try{ await empresaService.updateEmpresa(req.params.id, req.body); res.status(204).end(); }catch(err){next(err);} }
module.exports = { create, list, getById, update };
