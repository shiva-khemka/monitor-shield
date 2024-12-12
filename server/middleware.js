// middleware.js
/*export const verifyRequest = (req, res, next) => {
    const hashedId = req.headers['x-hashed-id'];
    if (!hashedId) {
        return res.status(401).json({ error: 'Missing hashed ID' });
    }
    req.hashedId = hashedId;
    next();
};*/