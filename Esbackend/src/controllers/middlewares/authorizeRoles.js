module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acesso negado: sem permissão' });
    }
    next();
  };
};
