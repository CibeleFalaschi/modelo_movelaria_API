const express = require('express');
const controller = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
router.get('/agenda', authMiddleware, controller.agenda);

module.exports = router;
