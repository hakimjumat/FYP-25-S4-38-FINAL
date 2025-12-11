const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }
    // get user role from req.user (from verifyToken)
    const userRole = req.user.role;

    // check if role is allowed
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: ${req.user.role} role cannot access this resource`,
      });
    }

    // role is allowed, proceed
    next();
  };
};

module.exports = checkRole;
