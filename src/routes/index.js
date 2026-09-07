const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const funcionariosRoutes = require('./funcionarios');
const contatosRoutes = require('./contatos');
const orcamentosRoutes = require('./orcamentos');
const ambientesRoutes = require('./ambientes');
const visitasRoutes = require('./visitas');
const projetosRoutes = require('./projetos');
const empresasRoutes = require('./empresas');
const arquivosRoutes = require('./arquivos');
const prospeccoesRoutes = require('./prospeccoes');
const statusesRoutes = require('./statuses');

router.use('/auth', authRoutes);
router.use('/funcionarios', funcionariosRoutes);
router.use('/contatos', contatosRoutes);
router.use('/orcamentos', orcamentosRoutes);
router.use('/ambientes', ambientesRoutes);
router.use('/visitas', visitasRoutes);
router.use('/projetos', projetosRoutes);
router.use('/empresas', empresasRoutes);
router.use('/arquivos', arquivosRoutes);
router.use('/prospeccoes', prospeccoesRoutes);
router.use('/statuses', statusesRoutes);

module.exports = router;
