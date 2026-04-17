const User = require('../models/User');
const Claim = require('../models/Claim');

/**
 * Calculates and updates the fraud score and status for a specific user.
 * @param {string} userId - ID of the user to evaluate.
 */
const calculateFraudScore = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const claims = await Claim.find({ userId }).sort({ createdAt: -1 });
        
        const totalClaims = claims.length;
        if (totalClaims === 0) {
            user.fraudScore = 0;
            user.fraudStatus = "safe";
            user.lastFraudCheck = new Date();
            await user.save();
            return;
        }

        const approvedClaims = claims.filter(c => c.status === 'Approved').length;
        const rejectedClaims = claims.filter(c => c.status === 'Rejected').length;

        const rejectionRatio = rejectedClaims / totalClaims;
        const approvalRatio = approvedClaims / totalClaims;

        let score = 0;

        // 🔺 FRAUD SCORE INCREASE RULES

        // RULE 1: High Rejection Ratio (AGGRESSIVE FOR TESTING)
        if (totalClaims >= 3 && rejectionRatio >= 0.5) {
            score += 30;
        }

        // RULE 2: Continuous Claiming (3+ consecutive days)
        if (totalClaims >= 3) {
            const claimDates = [...new Set(claims.map(c => new Date(c.createdAt).toDateString()))]
                .map(d => new Date(d));
            
            let consecutiveCount = 1;
            let maxConsecutive = 1;
            
            for (let i = 0; i < claimDates.length - 1; i++) {
                const diffTime = Math.abs(claimDates[i] - claimDates[i+1]);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    consecutiveCount++;
                    maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
                } else {
                    consecutiveCount = 1;
                }
            }

            if (maxConsecutive >= 3) {
                score += 20;
            }
        }

        // RULE 3: Frequent Rejected Claims
        if (rejectedClaims >= 3) {
            score += 25;
        }

        // 🔻 FRAUD SCORE DECREASE RULES
        if (approvedClaims >= 1) {
            score -= 10;
        }

        // =========================
        // 🧠 RULE 8: ML-BASED PREDICTION (AGGRESSIVE FOR TESTING)
        // 🧠 RULE 8: ML-BASED PREDICTION (BALANCED)
        // =========================
        if (totalClaims >= 5) {
            try {
                const { execSync } = require('child_process');
                const path = require('path');
                const scriptPath = path.join(__dirname, '..', '..', 'ml', 'predict.py');
                const cmd = `python "${scriptPath}" ${totalClaims} ${approvedClaims} ${rejectedClaims}`;
                const prediction = execSync(cmd).toString().trim();

                if (prediction === "1") {
                    score += 30; // Solid weight for ML detection
                    console.log(`ML System flagged user ${userId} as Potential Risk (+30)`);
                }
            } catch (mlErr) {
                console.error("ML Prediction failed, skipping rule...", mlErr.message);
            }
        }

        // ⚙️ FINAL SCORE HANDLING
        score = Math.max(0, score);

        // 📊 FRAUD STATUS CLASSIFICATION (STRICT PER REQUIREMENTS)
        let fraudStatus = "safe";
        if (score >= 80) {
            fraudStatus = "high_risk";
        } else if (score >= 50) {
            fraudStatus = "suspicious";
        }

        // 🛑 FREEZE SYSTEM (STRICT PER REQUIREMENTS)
        if (score >= 80) {
            user.isFrozen = true;
            const freezeDuration = 3 * 24 * 60 * 60 * 1000; // 3 Days in MS
            user.freezeUntil = new Date(Date.now() + freezeDuration);
            console.log(`[FREEZE] User ${userId} has been frozen until ${user.freezeUntil}`);
        } else if (user.isFrozen && score < 50) {
            // Optional: Auto-thaw if score drops significantly (Good UX)
            user.isFrozen = false;
            user.freezeUntil = null;
        }

        // 💾 UPDATE USER
        user.fraudScore = score;
        user.fraudStatus = fraudStatus;
        user.lastFraudCheck = new Date();

        await user.save();
        return { score, fraudStatus };
    } catch (err) {
        console.error('Fraud Engine Error:', err);
    }
};

module.exports = { calculateFraudScore };
