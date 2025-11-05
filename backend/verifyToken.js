import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const VerifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.user = decoded; // Attach decoded token data to `req.user`
        next();
    });
};

export default VerifyToken;