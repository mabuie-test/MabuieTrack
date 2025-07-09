const Command = require('../models/Command');

exports.createCommand = async (req, res) => {
  try {
    const cmd = new Command({ ...req.body, user: req.user.id });
    await cmd.save();
    res.json(cmd);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.getCommands = async (req, res) => {
  try {
    const commands = await Command.find({ user: req.user.id });
    res.json(commands);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};
