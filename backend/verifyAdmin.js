import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { mongoDBConnection } from './dbConnection.js';
import mongoose from 'mongoose';

dotenv.config();

const VerifyAdmin = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;

        // Verify user is admin in database - check admin_details collection
        const { admin_details } = await mongoDBConnection();
        const admin = await admin_details.findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });
        
        if (!admin) {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export default VerifyAdmin;

