// routes/monitorRoutes.js
//const { execFile } = require('child_process');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Monitoring = require('../models/userModel');
const mlModel = require('../mlModel');
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
const {User} = require('./models/UserSchema');
const {MonitoringDataSchema} = require('./models/database');
const {checkInitialConditions} = require('./initialConditions');
//const fs = require('fs');

// Constants for thresholds
const INITIAL_SCORE_THRESHOLD = 70;  // Below this, ML check is required
const EXISTING_USER_HIGH_TRUST = 85; // Above this, only initial conditions needed
const EXISTING_USER_LOW_TRUST = 60;  // Below this, direct to enhanced interaction
// Generate JWT token
/*const generateToken = (sessionId) => {
    return jwt.sign(
        { sessionId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

router.post('/monitor', async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        // Find or create session
        let session = await Monitoring.findOne({ sessionId });
        if (!session) {
            session = new Monitoring({
                sessionId,
                deviceInfo: req.body.deviceInfo,
                behaviorMetrics: []
            });
        }

        // Add new behavior metrics
        session.behaviorMetrics.push({
            timestamp: new Date(),
            mouseMetrics: req.body.features.mouseMetrics,
            touchMetrics: req.body.features.touchMetrics,
            scrollMetrics: req.body.features.scrollMetrics
        });

        // Only predict if we have enough data
        if (session.behaviorMetrics.length >= 3) {
            const isHuman = await mlModel.predict(session);
            
            if (isHuman && session.verificationStatus === 'pending') {
                session.verificationStatus = 'verified';
                const token = generateToken(sessionId);
                
                // Set secure cookie
                res.cookie('verification_status', 'verified', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 86400000 // 24 hours
                });

                await session.save();
                return res.json({ status: 'verified', token });
            }
        }

        await session.save();
        res.json({ status: 'monitoring' });
    } catch (error) {
        console.error('Monitor error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});*/
router.post('/collect', verifyRequest, async (req, res) => {
    try {
        const { hashedId } = req;
        const monitoringData = req.body;

        // Find or create user
        /*let user = await User.findOne({ hashedId });
        if (!user) {
            user = new User({ hashedId });
            await user.save();
        }*/
       
        const verificationData = {
            hashedId: hashedId,
            trustScore: finalTrustScore,
            exp: Date.now() + 24 * 60 * 60 * 1000, // Expiry time (1 day)
        };
    
        const encryptedData = encryptData(verificationData);  // Encrypt the data
    
        // Set the cookie securely on the response
        res.cookie('monitor_verification', encryptedData, {
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            path: '/',
            maxAge: 86400000  // 1 day expiry
        });

        let finalTrustScore;
        let existingUser = await User.findOne({ hashedId });
       const initialScore ;
           // Different flow based on whether user exists and their trust score
        if (existingUser) {
            if (existingUser.trustScore < EXISTING_USER_LOW_TRUST) {
                // Direct to enhanced interaction for low trust users
                finalTrustScore =existingUser.trustScore;
                // You might want to add additional verification steps here
                
            } else if (existingUser.trustScore > EXISTING_USER_HIGH_TRUST) {
                initialScore = checkInitialConditions(monitoringData);
                finalTrustScore = existingUser.trustScore;
                
            } else {
                // Medium trust users - check initial score first
                initialScore = checkInitialConditions(monitoringData);
                if (initialScore <= INITIAL_SCORE_THRESHOLD) {
                    // Run ML model only if initial score is concerning
                    finalTrustScore=EXISTING_USER_LOW_TRUST;
                    
                } 
                else{
                    const mlScore = await mlModel.predict(monitoringData);
                    finalTrustScore = Math.round(
                        existingUser.trustScore * 0.7 + mlScore * 0.3);
                }
            }
            
       /* const features = await new Promise((resolve, reject) => {
            const inputPath = './temp_input.json';
            const outputPath = './temp_output.json';
            fs.writeFileSync(inputPath, JSON.stringify(monitoringData));

            execFile('python3', ['extract_features.py', inputPath, outputPath], (error) => {
                if (error) {
                    return reject(error);
                }

                const extractedFeatures = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
                resolve(extractedFeatures);
            });
        });*/

        if(initialScore<=70){

        }
       //ml

        // Step 3: Calculate final trust score
      /*  if (existingUser) {
            // Combine existing score with new ML score
            finalTrustScore = Math.round(
                existingUser.trustScore * 0.7 + mlScore * 0.3
            );
        } else {
            finalTrustScore = mlScore;
        }*/
    
    // Step 4: Determine interaction level
    const interactionLevel = determineInteractionLevel(finalTrustScore);

    // Update or create user
    if (existingUser) {
        existingUser.trustScore =(existingUser.trustScore+ finalTrustScore);
        existingUser.lastUpdated = new Date();
        await existingUser.save();
    } else {
        await User.create({
            hashedId,
            trustScore: finalTrustScore
        });
    }
    
        await BehaviorData.create({
            timestamp: new Date(),
            fingerprint: monitoringData.fingerprint,
            session_id: hashedId, // Using hashedId as session_id since it's required
            user: {
                ip: req.ip,
                session_id: hashedId,
                user_agent: req.headers['user-agent'],
                auth_token: req.headers.authorization
            },
            ipData: {
                ip: req.ip,
                location: {
                    country: monitoringData.ipData?.location?.country,
                    region: monitoringData.ipData?.location?.region,
                    city: monitoringData.ipData?.location?.city,
                    lat: monitoringData.ipData?.location?.lat,
                    lng: monitoringData.ipData?.location?.lng,
                    postalCode: monitoringData.ipData?.location?.postalCode,
                    timezone: monitoringData.ipData?.location?.timezone,
                    geonameId: monitoringData.ipData?.location?.geonameId
                },
                as: monitoringData.ipData?.as,
                isp: monitoringData.ipData?.isp,
                proxy: monitoringData.ipData?.proxy
            },
            timeSpent: monitoringData.timeSpent,
            requestMetrics: {
                endpoints: monitoringData.requestMetrics?.endpoints,
                totalRequests: monitoringData.requestMetrics?.totalRequests,
                averageResponseTime: monitoringData.requestMetrics?.averageResponseTime
            },
            request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body
            },
            response: {
                status_code: res.statusCode,
                response_time_ms: Date.now() - req._startTime // Assuming _startTime was set on request
            },
            interactions: {
                mouseMovements: monitoringData.interactions?.mouseMovements?.map(movement => ({
                    x: movement.x,
                    y: movement.y,
                    timestamp: new Date(movement.timestamp)
                })) || [],
                scrolls: monitoringData.interactions?.scrolls?.map(scroll => ({
                    scrollY: scroll.scrollY,
                    timestamp: new Date(scroll.timestamp)
                })) || [],
                clicks: monitoringData.interactions?.clicks?.map(click => ({
                    x: click.x,
                    y: click.y,
                    timestamp: new Date(click.timestamp)
                })) || [],
                keypresses: monitoringData.interactions?.keypresses?.map(keypress => ({
                    timestamp: new Date(keypress.timestamp)
                })) || [],
                touches: monitoringData.interactions?.touches?.map(touch => ({
                    touches: touch.touches,
                    timestamp: new Date(touch.timestamp)
                })) || [],
                swipes: monitoringData.interactions?.swipes?.map(swipe => ({
                    touches: swipe.touches,
                    x: swipe.x,
                    y: swipe.y,
                    timestamp: new Date(swipe.timestamp)
                })) || [],
                rotations: monitoringData.interactions?.rotations?.map(rotation => ({
                    orientation: rotation.orientation,
                    timestamp: new Date(rotation.timestamp)
                })) || []
            },
            features: monitoringData.features || {}
        });

   

    res.json({
        status: 'success',
        trustScore: finalTrustScore,
        interactionLevel,
        isVerified: finalTrustScore >= 80
    });

} catch (error) {
    console.error('Error processing monitoring data:', error);
    res.status(500).json({ error: 'Internal server error' });
}});


    // Cleanup job for expired data
setInterval(async () => {
    try {
        await BehaviorData.deleteMany({
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
    } catch (error) {
        console.error('Error cleaning up expired data:', error);
    }
}, 24 * 60 * 60 * 1000);


module.exports = router;