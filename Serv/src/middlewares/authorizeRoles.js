export const authorizeRoles = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acesso proibido' });
  }
  next();
};
