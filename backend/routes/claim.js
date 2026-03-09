const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

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

        const activePolicy = await Policy.findOne({ userId: req.user.id, status: 'Active' });

        if (!activePolicy) {
            return res.status(400).json({ msg: 'No active policy found. Claim rejected.' });
        }

        if (activePolicy.claimUsed) {
            return res.status(400).json({ msg: 'Claim already submitted for this week\'s policy.' });
        }

        const claim = new Claim({
            userId: req.user.id,
            policyId: activePolicy.id,
            disruptionType,
            payoutAmount: 0, // Wait for admin to set or it defaults to 0
            status: 'Pending'
        });

        await claim.save();

        activePolicy.claimUsed = true;
        await activePolicy.save();

        res.json({ msg: 'Claim request submitted. Waiting for admin verification.', claim });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
