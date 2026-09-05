const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role_name) {
      return res.status(403).json({ success: false, message: 'Unauthorized access.' });
    }

    const hasRole = allowedRoles.includes(req.user.role_name);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

module.exports = requireRole;