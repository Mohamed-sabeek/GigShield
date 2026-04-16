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

        const approvedClaims = await Claim.find({ status: 'Approved' });
        const totalPayoutAmount = approvedClaims.reduce((acc, curr) => acc + curr.payoutAmount, 0);
        const pendingClaims = await Claim.countDocuments({ status: { $in: ['Pending', 'Verified'] } });

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
            pendingClaims,
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

        const claims = await Claim.find()
            .populate('userId', 'name city district workingArea platform')
            .sort({ createdAt: -1 });

        res.json(claims);
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
            
            // Fetch claim stats for this specific worker
            const claims = await Claim.find({ userId: worker._id });
            
            const claimStats = {
                total: claims.length,
                approved: claims.filter(c => c.status === 'Approved').length,
                rejected: claims.filter(c => c.status === 'Rejected').length,
                totalEarnings: claims
                    .filter(c => c.status === 'Approved')
                    .reduce((sum, curr) => sum + (curr.payoutAmount || 0), 0)
            };

            return {
                id: worker._id,
                name: worker.name,
                email: worker.email, 
                city: worker.district || worker.city || 'Unknown',
                platform: worker.platform || 'Unknown',
                joined: worker.createdAt,
                status: policy ? 'Active Policy' : 'Unprotected',
                claimStats: claimStats,
                fraudScore: worker.fraudScore || 0,
                fraudStatus: worker.fraudStatus || 'safe'
            };
        }));

        res.json(workersData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/claim/:id
router.delete('/claim/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        await Claim.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Claim record deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
