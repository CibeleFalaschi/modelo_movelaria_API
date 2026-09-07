const statusModel = require('../models/statusModel');

async function list(req, res, next) {
  try {
    res.json(await statusModel.listAll());
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
