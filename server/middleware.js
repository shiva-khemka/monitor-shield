// Middleware to verify request authentication
export const verifyRequest = async (req, res, next) => {
    const hashedId = req.headers['x-hashed-id'];
    if (!hashedId) {
        return res.status(401).json({ error: 'Missing hashed ID' });
    }
    req.hashedId = hashedId;
    next();
};
