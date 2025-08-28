const { verifyToken } = require('../config/jwt')

const authenticateToken =  (req, res, next)=> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try{
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (erro){
        return res.status(403).json({
            success: false,
            message:'Invalid or expired token'
        });
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};