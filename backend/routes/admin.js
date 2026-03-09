const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');

// @route   GET api/admin/dashboard
router.get('/dashboard', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized as admin' });
        }

        const totalWorkers = await User.countDocuments({ role: 'worker' });
        const activePoliciesCount = await Policy.countDocuments({ status: 'Active' });
        const totalClaims = await Claim.countDocuments();

        const claims = await Claim.find({ status: 'Approved' });
        const totalPayoutAmount = claims.reduce((acc, curr) => acc + curr.payoutAmount, 0);

        // Simulate high risk zones from dummy data calculation
        const highRiskZones = [
            { city: 'Chennai', risk: 'Flood Risk' },
            { city: 'Madurai', risk: 'Extreme Heat Risk' },
            { city: 'Coimbatore', risk: 'Low Risk' },
            { city: 'Pudukkottai', risk: 'Moderate Rain Risk' }
        ];

        res.json({
            totalWorkers,
            activePolicies: activePoliciesCount,
            totalClaims,
            totalPayoutAmount,
            highRiskZones
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   GET api/admin/claims
router.get('/claims', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const claims = await Claim.find({ status: 'Pending' })
            .populate('userId', 'name city')
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/claim/approve/:id
router.post('/claim/approve/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ msg: 'Claim not found' });

        const policy = await Policy.findById(claim.policyId);

        claim.status = 'Approved';
        claim.payoutAmount = policy ? policy.coverage : 500;
        await claim.save();

        if (policy) {
            policy.status = 'Claimed';
            await policy.save();
        }

        res.json({ msg: 'Claim Approved', claim });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/claim/reject/:id
router.post('/claim/reject/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ msg: 'Claim not found' });

        claim.status = 'Rejected';
        await claim.save();

        res.json({ msg: 'Claim Rejected', claim });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/workers
router.get('/workers', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized as admin' });
        }

        const workers = await User.find({ role: 'worker' }).select('-password');

        const workersData = await Promise.all(workers.map(async (worker) => {
            const policy = await Policy.findOne({ userId: worker._id, status: 'Active' });
            return {
                id: worker._id,
                name: worker.name,
                city: worker.city || 'Unknown',
                platform: worker.platform || 'Unknown',
                joined: worker.createdAt,
                status: policy ? 'Active Policy' : 'Unprotected'
            };
        }));

        res.json(workersData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/claims/history
router.get('/claims/history', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const claims = await Claim.find({ status: { $in: ['Approved', 'Rejected'] } })
            .populate('userId', 'name city platform')
            .sort({ updatedAt: -1 });

        res.json(claims);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
