const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkFreeze = require('../middleware/checkFreeze');
const Policy = require('../models/Policy');

// @route   GET api/policy/active
router.get('/active', auth, async (req, res) => {
    try {
        console.log("Checking active policy for user:", req.user.id);
        console.log("Current Server Time:", new Date());

        const policy = await Policy.findOne({ 
            userId: req.user.id, 
            status: 'Active',
            endDate: { $gt: new Date() } // Ensure policy is not expired
        });

        console.log("Policy Found in DB:", policy);
        
        // Return null instead of empty if not found
        if (!policy) {
            return res.json(null);
        }

        res.json(policy);
    } catch (err) {
        console.error("Active Policy Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/policy/create
router.post('/create', [auth, checkFreeze], async (req, res) => {
    try {
        const { riskLevel, riskScore, premium, coverage, planName } = req.body;

        // Inactivate any existing policies
        await Policy.updateMany({ userId: req.user.id, status: 'Active' }, { status: 'Expired' });

        const newPolicy = new Policy({
            userId: req.user.id,
            planName,
            premium,
            coverage,
            riskLevel,
            riskScore,
            status: 'Active'
        });

        await newPolicy.save();
        res.json(newPolicy);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
