const fs = require('fs');
const path = require('path');
const arquivoService = require('../services/arquivoService');
const { uploadRoot } = require('../middlewares/upload');

function caminhoSeguro(caminho) {
  const full = path.resolve(uploadRoot, caminho);
  return full.startsWith(uploadRoot + path.sep) ? full : null;
}

async function create(req,res,next){ try{ const { IDOrcamento, NomeArquivo, Caminho, Tipo } = req.body; if(!IDOrcamento || !NomeArquivo || !Caminho) return res.status(400).json({error:'Campos obrigatórios ausentes'}); const r = await arquivoService.createArquivo({ IDOrcamento, NomeArquivo, Caminho, Tipo }); res.status(201).json(r);}catch(err){next(err);} }
async function list(req,res,next){ try{ const rows = await arquivoService.listArquivos(req.query.limit); res.json(rows);}catch(err){next(err);} }
async function getById(req,res,next){ try{ const r = await arquivoService.getById(req.params.id); if(!r) return res.status(404).json({error:'Not found'}); res.json(r);}catch(err){next(err);} }
async function listByOrcamento(req,res,next){ try{ const rows = await arquivoService.listByOrcamento(req.params.id); res.json(rows);}catch(err){next(err);} }
async function download(req,res,next){ try{ const r = await arquivoService.getById(req.params.id); const full = r && caminhoSeguro(r.Caminho); if(!full || !fs.existsSync(full)) return res.status(404).json({error:'Arquivo não encontrado'}); res.download(full, r.NomeArquivo);}catch(err){next(err);} }
async function remove(req,res,next){ try{ const r = await arquivoService.getById(req.params.id); await arquivoService.deleteArquivo(req.params.id); const full = r && caminhoSeguro(r.Caminho); if(full) fs.unlink(full, () => {}); res.status(204).end(); }catch(err){next(err);} }
module.exports = { create, list, getById, listByOrcamento, download, remove };
