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

        const claims = await Claim.find({ status: { $in: ['Pending', 'Verified'] } })
            .populate('userId', 'name city district workingArea platform')
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

        // Reset claimUsed in policy
        const policy = await Policy.findById(claim.policyId);
        if (policy) {
            policy.claimUsed = false;
            await policy.save();
        }

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
                city: worker.district || worker.city || 'Unknown',
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
            .populate('userId', 'name city district workingArea platform')
            .sort({ updatedAt: -1 });

        res.json(claims);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/verify-claim
router.post('/verify-claim', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const { lat, lon, date, claimId } = req.body;
        console.log("VERIFY INPUT:", { lat, lon, date, claimId });

        if (!lat || !lon || !date || !claimId) {
            return res.status(400).json({ success: false, message: "Missing required fields (lat, lon, date, claimId)" });
        }

        if (isNaN(new Date(date).getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        const claim = await Claim.findById(claimId);
        if (!claim) return res.status(404).json({ msg: 'Claim not found' });

        // Prevent Re-Verification
        if (claim.status === 'Verified' || claim.weatherVerification?.verifiedAt) {
            return res.status(400).json({ success: false, msg: 'Claim is already verified' });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey || apiKey === 'your_openweather_api_key_here') {
            return res.status(500).json({ success: false, msg: 'Weather API is not configured in .env' });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const weatherRes = await fetch(url);
        
        if (!weatherRes.ok) {
            const errorText = await weatherRes.text();
            console.error("OpenWeather API Error Response:", errorText);
            return res.status(weatherRes.status).json({ success: false, message: `Weather API Error: ${errorText}` });
        }

        const data = await weatherRes.json();
        console.log("WEATHER RESPONSE:", data);

        const mainCondition = data.weather[0]?.main || 'Clear';
        const rain1h = data.rain?.['1h'] || 0;

        // Classification Logic
        // rain < 2 mm → "Low Rain" → INVALID
        // rain 2–5 mm → "Moderate Rain" → VALID
        // rain > 5 mm → "Heavy Rain" → VALID
        let category = 'No Rain';
        let isValid = false;

        if (rain1h >= 5 || mainCondition === 'Rain') { // Note: OpenWeather main condition fallback
             category = 'Heavy Rain';
             isValid = true;
        } else if (rain1h >= 2) {
             category = 'Moderate Rain';
             isValid = true;
        } else if (rain1h > 0) {
             category = 'Low Rain';
        }

        // Save verification data to DB
        claim.weatherVerification = {
            isValid,
            rainfall: rain1h,
            condition: mainCondition,
            category,
            verifiedAt: new Date()
        };
        claim.status = 'Verified';
        await claim.save();

        res.json({
            success: true,
            isValid,
            rainfall: rain1h,
            condition: mainCondition,
            category,
            verifiedAt: claim.weatherVerification.verifiedAt
        });

    } catch (err) {
        console.error('Weather Verification Error:', err.message);
        res.status(500).json({ success: false, msg: 'Weather API Failure', error: err.message });
    }
});

module.exports = router;
