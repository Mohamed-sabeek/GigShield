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

        // RULE 1: High Rejection Ratio
        if (totalClaims >= 5 && rejectionRatio >= 0.8) {
            score += 20;
        }

        // RULE 2: Continuous Claiming (5-7 consecutive days)
        // We check if the user has claims on 5 distinct consecutive days in their history
        if (totalClaims >= 5) {
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

            if (maxConsecutive >= 5) {
                score += 15;
            }
        }

        // RULE 3: High Total Claims
        if (totalClaims >= 10) {
            score += 10;
        }

        // RULE 4: Perfect Timing (LOW WEIGHT)
        if (approvalRatio >= 0.9 && totalClaims >= 5) {
            score += 5;
        }

        // 🔻 FRAUD SCORE DECREASE RULES

        // RULE 5: Good Behavior (Approved Claims)
        if (approvedClaims >= 2) {
            score -= 5;
        }

        // RULE 6: Improved Claim Ratio
        if (rejectionRatio < 0.5 && totalClaims >= 5) {
            score -= 10;
        }

        // RULE 7: Time-Based Decay
        // If no suspicious activity (rejected claims) in last 3 days
        const lastThreeDays = new Date();
        lastThreeDays.setDate(lastThreeDays.getDate() - 3);
        const recentBadClaims = claims.filter(c => c.status === 'Rejected' && new Date(c.createdAt) > lastThreeDays);
        
        if (recentBadClaims.length === 0) {
            score -= 10;
        }

        // ⚙️ FINAL SCORE HANDLING
        score = Math.max(0, score);

        // 📊 FRAUD STATUS CLASSIFICATION
        let fraudStatus = "safe";
        if (score > 60) {
            fraudStatus = "high_risk";
        } else if (score >= 31) {
            fraudStatus = "suspicious";
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
