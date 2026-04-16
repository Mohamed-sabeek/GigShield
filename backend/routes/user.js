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

        res.json({
            user: {
                ...user._doc,
                policyActive: !!activePolicy,
                activePolicy: activePolicy || null
            }
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
    const { name, phone, district, workingArea, lat, lon } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (phone) profileFields.phone = phone;
    if (district) profileFields.district = district;
    if (workingArea) profileFields.workingArea = workingArea;
    
    profileFields.location = {};
    if (lat) profileFields.location.lat = lat;
    if (lon) profileFields.location.lon = lon;

    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

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

module.exports = router;
