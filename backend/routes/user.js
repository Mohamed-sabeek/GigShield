const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Policy = require('../models/Policy');

// @route   GET api/users/profile
// @desc    Get current user profile with policy status
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const activePolicy = await Policy.findOne({ userId: req.user.id, status: 'Active' });

        // Deterministic Tamil Nadu Risk Model
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
            coverage: 500,
            planName: 'GigShield Basic'
        };

        res.json({
            profile: {
                ...user._doc,
                lat: user.location?.lat,
                lon: user.location?.lon,
                policyActive: !!activePolicy,
                activePolicy: activePolicy || null
            },
            recommendedPolicy
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    const { name, phone, district, workingArea, averageDailyIncome, lat, lon } = req.body;

    try {
        const activePolicy = await Policy.findOne({ 
            userId: req.user.id, 
            status: 'Active',
            endDate: { $gt: new Date() } 
        });

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Allow update if active policy exists ONLY IF:
        // 1. Current location coordinates are missing/incomplete OR
        // 2. The district and workingArea are NOT being changed (just syncing GPS)
        const isLocationMissing = !user.location?.lat || !user.location?.lon;
        const isAreaUnchanged = (!district || district === user.district) && (!workingArea || workingArea === user.workingArea);

        if (activePolicy && !isLocationMissing && !isAreaUnchanged) {
            return res.status(400).json({ message: "Regional location cannot be changed during an active policy to prevent fraud. You can only sync GPS for your current area." });
        }

        // Build profile object
        const profileFields = {};
        if (name) profileFields.name = name;
        if (phone) profileFields.phone = phone;
        if (district) profileFields.district = district;
        if (workingArea) profileFields.workingArea = workingArea;
        if (averageDailyIncome !== undefined) profileFields.averageDailyIncome = averageDailyIncome;
        
        profileFields.location = {};
        if (lat) profileFields.location.lat = lat;
        if (lon) profileFields.location.lon = lon;

        // Update
        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users/update-location
// @desc    One-time location sync for new users
// @access  Private
router.post("/update-location", auth, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.latitude = latitude;
        user.longitude = longitude;
        
        // Also update the legacy location object for backwards compatibility
        user.location = { lat: latitude, lon: longitude };
        
        user.locationSynced = true;

        await user.save();

        res.json({ message: "Location synced successfully", profile: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
