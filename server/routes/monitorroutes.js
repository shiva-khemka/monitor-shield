// server/routes/monitorroutes.js
import express from 'express';
import { User } from '../models/userSchema.js';
import BehaviorData from '../models/database.js';
import { checkInitialConditions } from './initialConditions.js';  


// Constants
const EXISTING_USER_LOW_TRUST = 30;
const EXISTING_USER_HIGH_TRUST = 80;
const INITIAL_SCORE_THRESHOLD = 50;

const router = express.Router();

// Middleware function defined inline for now
const verifyRequest = (req, res, next) => {
    const hashedId = req.headers['x-hashed-id'];
    if (!hashedId) {
        return res.status(401).json({ error: 'Missing hashed ID' });
    }
    req.hashedId = hashedId;
    next();
};

// Utility functions
const encryptData = (data) => {
    // Implement encryption logic here
    return JSON.stringify(data); // Temporary placeholder
};

/*const checkInitialConditions = (data) => {
    let score = 50; // Default score
    // Implement your initial conditions check logic here
    return score;
};*/

router.post('/collect', verifyRequest, async (req, res) => {
    try {
        const { hashedId } = req;
        const monitoringData = req.body;

        // Initialize scores
        let finalTrustScore = 0;
        let initialScore = 0;

        // Check if user exists
        const existingUser = await User.findOne({ hashedId });

        /*if (existingUser) {
            if (existingUser.trustScore < EXISTING_USER_LOW_TRUST) {
                finalTrustScore = existingUser.trustScore;
            } else if (existingUser.trustScore > EXISTING_USER_HIGH_TRUST) {
                finalTrustScore = existingUser.trustScore;
                initialScore = checkInitialConditions(monitoringData);
            } else {
                initialScore = checkInitialConditions(monitoringData);
                if (initialScore <= INITIAL_SCORE_THRESHOLD) {
                    finalTrustScore = EXISTING_USER_LOW_TRUST;
                } else {
                    // Temporary placeholder for ML model
                    const mlScore = 70; // Default score since mlModel is not defined
                    finalTrustScore = Math.round(existingUser.trustScore * 0.7 + mlScore * 0.3);
                }
            }
        } else {
            // Temporary placeholder for ML model
            const mlScore = 70; // Default score since mlModel is not defined
            finalTrustScore = mlScore;
        }*/
            fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(monitoringData),
              })
              .then(response => response.json())
              .then(data=>{mlScore=data[0];
                console.log(mlScore)
              });

            finalTrustScore = Math.round(existingUser.trustScore * 0.7 + mlScore * 0.3);
        // Update or create user record
        if (existingUser) {
            existingUser.trustScore = (existingUser.trustScore + finalTrustScore) / 2;
            existingUser.lastUpdated = new Date();
            await existingUser.save();
        } else {
            await User.create({ hashedId, trustScore: finalTrustScore });
        }

        // Save behavior data
        await BehaviorData.create({
            timestamp: new Date(),
            fingerprint: monitoringData.fingerprint,
            session_id: hashedId,
            user: {
                ip: req.ip,
                session_id: hashedId,
                user_agent: req.headers['user-agent'],
                auth_token: req.headers.authorization,
            },
            interactions: monitoringData.interactions || {},
            features: monitoringData.features || {},
        });

        // Encrypt and set cookie
        const verificationData = {
            hashedId,
            trustScore: finalTrustScore,
            exp: Date.now() + 24 * 60 * 60 * 1000, // 1 day expiry
        };
        const encryptedData = encryptData(verificationData);
        res.cookie('monitor_verification', encryptedData, {
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            path: '/',
            maxAge: 86400000, // 1 day expiry
        });

        res.json({
            status: 'success',
            trustScore: finalTrustScore,
            isVerified: finalTrustScore >= 80,
        });
    } catch (error) {
        console.error('Error processing monitoring data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cleanup job for expired data
setInterval(async () => {
    try {
        await BehaviorData.deleteMany({
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });
    } catch (error) {
        console.error('Error cleaning up expired data:', error);
    }
}, 24 * 60 * 60 * 1000);

export default router;