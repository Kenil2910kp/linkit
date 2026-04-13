const jwt = require('jsonwebtoken');
require('dotenv').config();

// Like jwt.middleware but doesn't reject unauthenticated requests.
// Sets req.userId and req.userEmail if a valid token is present.
module.exports = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next(); // anonymous — continue

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        next(); // invalid token treated as anonymous
    }
};
