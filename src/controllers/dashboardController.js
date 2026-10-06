const dashboardModel = require('../models/dashboardModel');

async function agenda(req, res, next) {
  try {
    const [proximosContatos, visitas] = await Promise.all([dashboardModel.proximosContatos(), dashboardModel.visitas()]);
    res.json({ proximosContatos, visitas });
  } catch (err) { next(err); }
}

module.exports = { agenda };
