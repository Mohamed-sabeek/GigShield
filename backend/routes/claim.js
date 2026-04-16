const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

const axios = require('axios');
const User = require('../models/User');
const { calculateFraudScore } = require('../utils/fraudEngine');

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
        const user = await User.findById(req.user.id);
        
        // 1. Requirement Checks
        if (!user.isVerified) {
            return res.status(403).json({ msg: 'Account not verified. Please verify your email first.' });
        }

        const activePolicy = await Policy.findOne({ userId: req.user.id, status: 'Active' });
        
        if (!activePolicy || new Date() > new Date(activePolicy.endDate)) {
            return res.status(400).json({ msg: 'Policy expired or not found. Please purchase a new plan.' });
        }

        // 2. Prevent Duplicate Daily Claims
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingClaim = await Claim.findOne({
            userId: req.user.id,
            createdAt: { $gte: today }
        });

        if (existingClaim) {
            return res.status(400).json({ msg: 'You have already submitted a claim today.' });
        }

        // 3. Fetch Real-time Weather Data
        const { lat, lon } = user.location;
        if (!lat || !lon) {
            return res.status(400).json({ msg: 'Profile location missing. Update your profile first.' });
        }

        const { disruptionType } = req.body;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const weatherRes = await axios.get(weatherUrl);
        const wData = weatherRes.data;

        const rain = wData.rain ? wData.rain['1h'] || 0 : 0;
        const temp = wData.main.temp;
        const wind = wData.wind.speed * 3.6;

        // 4. Parametric Rule Engine
        let approved = false;
        let amount = 0;
        let message = 'Conditions not met for payout.';

        if (disruptionType === 'Rain Disruption') {
            if (rain >= 2) {
                approved = true;
                amount = 500;
                message = `✅ Automatically Approved – Rainfall threshold met (${rain}mm)`;
            } else {
                message = `❌ Automatically Rejected – Conditions not met (Recorded: ${rain}mm)`;
            }
        } else if (disruptionType === 'Heatwave') {
            if (temp >= 40) {
                approved = true;
                amount = 500;
                message = `✅ Automatically Approved – Temperature threshold met (${temp}°C)`;
            } else {
                message = `❌ Automatically Rejected – Conditions not met (Recorded: ${temp}°C)`;
            }
        } else if (disruptionType === 'Flood Disruption') {
            if (rain >= 10) {
                approved = true;
                amount = 500;
                message = `✅ Automatically Approved – Precipitation threshold met (${rain}mm)`;
            } else {
                message = `❌ Automatically Rejected – Conditions not met (Recorded: ${rain}mm)`;
            }
        }

        // 5. Create Claim Record
        const claim = new Claim({
            userId: req.user.id,
            policyId: activePolicy.id,
            type: disruptionType || 'WEATHER',
            disruptionType: disruptionType || 'Weather Event',
            location: { lat, lon },
            weatherSnapshot: { rain, temp, wind },
            status: approved ? 'Approved' : 'Rejected',
            payoutAmount: amount,
            autoProcessed: true
        });

        await claim.save();

        // 6. Update Fraud Score
        await calculateFraudScore(req.user.id);

        res.json({
            status: approved ? 'Approved' : 'Rejected',
            amount,
            message,
            weather: { rain, temp, wind }
        });

    } catch (err) {
        console.error('Claim Automation Error:', err.message);
        res.status(500).json({ msg: 'Automated claim processing failed. Try again later.' });
    }
});

module.exports = router;
