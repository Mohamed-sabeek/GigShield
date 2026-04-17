const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const axios = require('axios');
const User = require('../models/User');
const Config = require('../models/Config');

// @route   GET api/claim/history
router.get('/history', auth, async (req, res) => {
    try {
        const claims = await Claim.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(claims);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/claim/trigger
router.post('/trigger', auth, async (req, res) => {
    try {
        const { disruptionType } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // ✅ PART 7.5: AUTO UNFREEZE (Requirement #7)
        if (user.isFrozen && user.freezeUntil && Date.now() > new Date(user.freezeUntil).getTime()) {
            user.isFrozen = false;
            user.freezeUntil = null;
            await user.save();
        }

        // ✅ PART 7: FREEZE SYSTEM CHECK (Requirement #6)
        if (user.isFrozen && Date.now() < new Date(user.freezeUntil).getTime()) {
            return res.status(403).json({
                message: "🚫 Account frozen due to suspicious activity. Try again later.",
                isFrozen: true,
                freezeUntil: user.freezeUntil
            });
        }

        const activePolicy = await Policy.findOne({ userId: req.user.id, status: 'Active' });

        // 3. BASE REQUIREMENT CHECKS
        if (!user.isVerified) {
            return res.status(403).json({ msg: 'Account not verified. Please verify your email first.' });
        }

        if (!activePolicy || new Date() > new Date(activePolicy.endDate)) {
            return res.status(400).json({ msg: 'Policy expired or not found. Please purchase a new plan.' });
        }

        // ✅ PART 3: ENABLE MULTIPLE CLAIMS (TEST_MODE)
        let config = await Config.findOne();
        if (!config) config = await Config.create({ testMode: false });
        const TEST_MODE = config.testMode;

        if (!TEST_MODE) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const existingClaim = await Claim.findOne({
                userId: req.user.id,
                createdAt: { $gte: today }
            });

            if (existingClaim) {
                return res.status(400).json({ msg: 'You have already submitted a claim today.' });
            }
        }

        // 5. FETCH REAL-TIME WEATHER DATA
        const lat = user.location?.lat || user.lat;
        const lon = user.location?.lon || user.lon;

        if (!lat || !lon) {
            return res.status(400).json({ msg: 'GPS coordinates missing. Please sync in profile page.' });
        }

        let weatherData;
        try {
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
            const weatherRes = await axios.get(weatherUrl);
            weatherData = weatherRes.data;
        } catch (weatherErr) {
            return res.status(503).json({ msg: 'Weather verification service unavailable.' });
        }
        
        const rain = weatherData.rain ? (weatherData.rain['1h'] || 0) : 0;
        const temp = weatherData.main.temp;
        const wind = weatherData.wind.speed;

        // ✅ PART 1 & 2: REAL WEATHER VALIDATION (NO AUTO-APPROVE)
        let status = 'rejected';
        let amount = 0;
        let reason = 'Conditions not met for payout.';
        let claimType = (disruptionType || "").toLowerCase();

        if (claimType.includes('rain')) {
            if (rain >= 2) {
                status = "approved";
                reason = "Rainfall threshold met";
            } else {
                status = "rejected";
                reason = "Rainfall below threshold";
            }
        } else if (claimType.includes('heat') || claimType.includes('temperature')) {
            if (temp >= 40) {
                status = "approved";
                reason = "Temperature threshold met";
            } else {
                status = "rejected";
                reason = "Temperature below threshold";
            }
        } else if (claimType.includes('flood')) {
            if (rain >= 10) {
                status = "approved";
                reason = "Flood threshold met";
            } else {
                status = "rejected";
                reason = "Conditions below flood threshold";
            }
        }

        // Note: status is either "approved" or "rejected" (lowercase to match requirement prompt Part 8/9)
        amount = status === "approved" ? (activePolicy.coverage || 500) : 0;

        // ✅ PART 4: FRAUD SCORING LOGIC (CORE)
        let scoreIncrease = 0;
        let breakdown = [];

        // 1. Rejection factor
        if (status === "rejected") {
            scoreIncrease += 10;
            breakdown.push("Weather Rejected +10");
        }

        // Get latest user state to prevent race conditions during concurrent requests
        const latestUser = await User.findById(req.user.id);
        if (!latestUser) return res.status(404).json({ msg: 'User context lost' });

        // Get recent claim history for sophisticated rules
        const recentClaims = await Claim.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
        
        // 2. Repeated rejection
        const recentRejectedClaimsCount = recentClaims.slice(0, 5).filter(c => c.status.toLowerCase() === 'rejected').length;
        if (recentRejectedClaimsCount >= 3) {
            scoreIncrease += 25;
            breakdown.push(`Repeated Rejections (${recentRejectedClaimsCount}) +25`);
        }

        // 3. High frequency
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const claimsInLast10Minutes = await Claim.countDocuments({
            userId: req.user.id,
            createdAt: { $gte: tenMinutesAgo }
        });
        if (claimsInLast10Minutes >= 5) {
            scoreIncrease += 30;
            breakdown.push(`High Frequency (${claimsInLast10Minutes} in 10m) +30`);
        }

        // 4. Same pattern repetition
        if (recentClaims.length >= 2) {
            const sameTypeCount = recentClaims.slice(0, 3).filter(c => c.disruptionType === disruptionType).length;
            if (sameTypeCount >= 2) {
                scoreIncrease += 15;
                breakdown.push("Pattern Repetition +15");
            }
        }

        // ✅ Update user fraud score (Additive, NOT reset)
        latestUser.fraudScore = (latestUser.fraudScore || 0) + scoreIncrease;

        // 🧠 ===== FRAUD DEBUG START =====
        console.log("🧠 ===== FRAUD DEBUG START =====");
        console.log("User ID:", latestUser._id);
        console.log("Score Added:", scoreIncrease);
        console.log("Breakdown:", breakdown);
        console.log("Total Score:", latestUser.fraudScore);
        console.log("🧠 ===== FRAUD DEBUG END =====");

        // ✅ PART 5: FRAUD STATUS LEVELS
        if (latestUser.fraudScore >= 80) {
            latestUser.fraudStatus = "high_risk";
        } else if (latestUser.fraudScore >= 50) {
            latestUser.fraudStatus = "suspicious";
        } else {
            latestUser.fraudStatus = "safe";
        }

        // ✅ PART 6: WARNING SYSTEM
        let warningMessage = null;
        if (latestUser.fraudStatus === "suspicious") {
            warningMessage = "⚠️ Unusual activity detected. Continued actions may lead to account restriction.";
        }

        // ✅ PART 7: FREEZE SYSTEM (3 DAYS)
        if (latestUser.fraudStatus === "high_risk") {
            latestUser.isFrozen = true;
            latestUser.freezeUntil = new Date(Date.now() + (3 * 24 * 60 * 60 * 1000));
        }

        await latestUser.save();

        // ✅ PART 8: ALWAYS SAVE CLAIM (IMPORTANT)
        const newClaim = new Claim({
            userId: user._id,
            policyId: activePolicy._id,
            disruptionType: disruptionType || 'Weather Disruption',
            location: {
                lat, lon,
                details: { city: user.workingArea, region: user.district }
            },
            payoutAmount: amount,
            status: status.charAt(0).toUpperCase() + status.slice(1), // Store as "Approved"/"Rejected" for DB consistency
            weatherSnapshot: { rain, temp, wind },
            autoProcessed: true,
            fraudScoreAtTime: user.fraudScore,
            reason: reason,
            type: disruptionType?.split(' ')[0]?.toUpperCase() || 'WEATHER'
        });

        const savedClaim = await newClaim.save();

        // ✅ PART 9: RESPONSE TO FRONTEND
        res.json({
            status: savedClaim.status, // "Approved" or "Rejected"
            message: reason,
            fraudScore: latestUser.fraudScore,
            fraudStatus: latestUser.fraudStatus,
            warning: warningMessage,
            weather: { rain, temp, wind }
        });

    } catch (err) {
        console.error('CRITICAL CLAIM ERROR:', err);
        res.status(500).json({ msg: 'Claim processing failed' });
    }
});

module.exports = router;
