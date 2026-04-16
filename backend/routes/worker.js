const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/worker/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -fraudScore');
        if (!user) return res.status(404).json({ msg: 'Worker not found' });

        // Deterministic Tamil Nadu Risk Model (Lowercase to match securely)
        const cityRiskMap = {
            'coimbatore': { riskLevel: 'Low Risk', riskScore: 20, premium: 20 },
            'chennai': { riskLevel: 'High Flood Risk', riskScore: 75, premium: 40 },
            'madurai': { riskLevel: 'Medium Heat Risk', riskScore: 45, premium: 30 },
            'pudukkottai': { riskLevel: 'Moderate Rain Risk', riskScore: 30, premium: 25 },
            'trichy': { riskLevel: 'Medium Risk', riskScore: 40, premium: 25 },
            'tirunelveli': { riskLevel: 'Moderate Risk', riskScore: 35, premium: 25 }
        };

        const locationKey = (user.city || user.district || 'Unknown').toLowerCase();
        const cityData = cityRiskMap[locationKey] || { riskLevel: 'Safe Zone', riskScore: 10, premium: 15 };

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
