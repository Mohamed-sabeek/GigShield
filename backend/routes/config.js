const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Config = require('../models/Config');

// @route   GET api/config
// @desc    Get current global configuration
router.get('/', async (req, res) => {
    try {
        let config = await Config.findOne();
        if (!config) {
            config = await Config.create({ testMode: false });
        }
        res.json({ testMode: config.testMode });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/config/toggle
// @desc    Toggle platform mode (Production <=> Test) - Admin only
router.post('/toggle', auth, async (req, res) => {
    try {
        // Double check admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
        }

        let config = await Config.findOne();
        if (!config) {
            config = await Config.create({ testMode: false });
        }

        config.testMode = !config.testMode;
        await config.save();

        res.json({
            message: `Mode switched to ${config.testMode ? 'TEST' : 'PRODUCTION'}`,
            testMode: config.testMode
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
