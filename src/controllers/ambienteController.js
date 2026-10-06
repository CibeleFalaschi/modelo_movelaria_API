const ambienteService = require('../services/ambienteService');

async function create(req,res,next){ try{ const { IDOrcamento, Nome, Valor, Observacao } = req.body; if(!IDOrcamento || !Nome || Valor===undefined) return res.status(400).json({error:'Campos obrigatórios ausentes'}); const r = await ambienteService.createAmbiente({IDOrcamento,Nome,Valor,Observacao}); res.status(201).json(r); }catch(err){next(err);} }
async function listByOrcamento(req,res,next){ try{ const id = req.params.id; const rows = await ambienteService.listByOrcamento(id); res.json(rows);}catch(err){next(err);} }
async function update(req,res,next){ try{ await ambienteService.updateAmbiente(req.params.id, req.body); res.status(204).end(); }catch(err){next(err);} }
async function remove(req,res,next){ try{ await ambienteService.deleteAmbiente(req.params.id); res.status(204).end(); }catch(err){next(err);} }
module.exports = { create, listByOrcamento, update, remove };
