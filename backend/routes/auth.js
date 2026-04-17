const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { sendOTP } = require('../utils/emailService');

const generateToken = (userId, role) => {
    const payload = { user: { id: userId, role } };
    return jwt.sign(payload, process.env.JWT_SECRET || 'supersecret12345', { expiresIn: '7d' });
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role, platform, city, workingArea, averageDailyIncome, phone, jobType, district, location, lat, lon } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Format location correctly if passed as flat lat/lon
        const userLocation = location || {};
        if (lat) userLocation.lat = lat;
        if (lon) userLocation.lon = lon;

        user = new User({
            name, email, password, role, platform, city, workingArea, averageDailyIncome,
            phone, jobType, district, 
            location: userLocation,
            otp, otpExpiry, isVerified: false
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Send OTP via email
        try {
            await sendOTP(email, otp);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Optionally: could delete user if email fails, but better to allow "resend"
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, isVerified: user.isVerified } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.isVerified) return res.status(400).json({ msg: 'User already verified' });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid verification code' });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: 'Code expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ msg: 'Account verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.isVerified) return res.status(400).json({ msg: 'User already verified' });

        // Step 1: Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Step 2 & 3: Reset status and set new expiry (5 minutes)
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        // Step 4: Send OTP email
        await sendOTP(email, otp);

        // Step 5: Response
        res.json({ message: "New OTP sent successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, isVerified: user.isVerified } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
