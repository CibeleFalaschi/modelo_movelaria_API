const express = require('express');
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/', authMiddleware, statusController.list);

module.exports = router;
