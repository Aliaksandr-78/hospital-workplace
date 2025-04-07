const jwt = require('jsonwebtoken')
require('dotenv').config()

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' })
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(400).json({ success: false, error: 'Invalid token.' })
    }
}

module.exports = authMiddleware
