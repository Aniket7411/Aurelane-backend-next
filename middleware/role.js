// Middleware to check user roles
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, please login'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${roles.join(' or ')} role required.`
            });
        }

        next();
    };
};

module.exports = { checkRole };



