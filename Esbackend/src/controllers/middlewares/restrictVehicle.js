const Vehicle = require('../models/Vehicle');

module.exports = async function (req, res, next) {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle || vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Acesso negado ao veículo' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};
