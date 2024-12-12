/*import express from 'express';
import MLService from '../services/mlService';
import { validateApiKey, rateLimiter } from '../middleware';
import { User } from '../models/userSchema'; // Assuming the User model is being used here
import { MonitoringData } from '../models/database'; // Assuming the MonitoringData model is used here

const router = express.Router();
const mlService = new MLService();

router.post('/collect', 
  //validateApiKey, 
  //rateLimiter, 
  async (req, res) => {
    try {
      const { hashedId } = req.headers;
      const decryptedData = decrypt(req.body);
      
      // Analyze behavior using ML
      const mlAnalysis = await mlService.analyzeBehavior(decryptedData);
      
      // Update user profile
      const profile = await UserProfile.findOneAndUpdate(
        { hashedId },
        {
          $inc: { visitCount: 1 },
          $set: { 
            lastSeen: new Date(),
            trustScore: mlAnalysis.score
          }
        },
        { upsert: true, new: true }
      );

      // Save monitoring data with ML score
      const monitoringEntry = new MonitoringData({
        ...decryptedData,
        hashedId,
        mlScore: mlAnalysis.score,
        anomalyFlags: mlAnalysis.anomalies
      });
      await monitoringEntry.save();

      // Generate verification token if trust score is high enough
      let verificationToken = null;
      if (mlAnalysis.score >= 80 && !profile.verificationStatus === 'verified') {
        verificationToken = generateVerificationToken(hashedId);
        profile.verificationStatus = 'verified';
        await profile.save();
      }

      res.json({
        success: true,
        trustScore: mlAnalysis.score,
        verified: profile.verificationStatus === 'verified',
        token: verificationToken
      });
      
    } catch (error) {
      console.error('Error processing monitoring data:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
*/