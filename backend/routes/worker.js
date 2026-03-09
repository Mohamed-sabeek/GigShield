const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/worker/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'Worker not found' });

        // Deterministic Tamil Nadu Risk Model
        const cityRiskMap = {
            'Coimbatore': { riskLevel: 'Low Risk', riskScore: 20, premium: 20 },
            'Chennai': { riskLevel: 'High Flood Risk', riskScore: 75, premium: 40 },
            'Madurai': { riskLevel: 'Medium Heat Risk', riskScore: 45, premium: 30 },
            'Pudukkottai': { riskLevel: 'Low-Medium Risk', riskScore: 30, premium: 25 }
        };

        const cityData = cityRiskMap[user.city] || { riskLevel: 'Unknown', riskScore: 0, premium: 0 };

        const recommendedPolicy = {
            riskLevel: cityData.riskLevel,
            riskScore: cityData.riskScore,
            premium: cityData.premium,
            coverage: 500, // Fixed 500 per day
            planName: 'GigShield Basic'
        };

        res.json({ profile: user, recommendedPolicy });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
