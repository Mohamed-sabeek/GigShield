const User = require('../models/User');

/**
 * Middleware to check if a user is currently frozen due to fraud detection.
 * Automatically handles unfreezing if the time has passed.
 */
const checkFreeze = async (req, res, next) => {
    try {
        const userId = req.user.id; // Assuming auth middleware is used before this
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is frozen
        if (user.isFrozen && user.freezeUntil) {
            const currentTime = new Date();
            const freezeTime = new Date(user.freezeUntil);

            // AUTO UNFREEZE LOGIC
            if (currentTime > freezeTime) {
                user.isFrozen = false;
                user.freezeUntil = null;
                await user.save();
                return next(); // Proceed to action
            }

            // STILL FROZEN
            const remainingMS = freezeTime - currentTime;
            const remainingHours = Math.ceil(remainingMS / (1000 * 60 * 60));

            return res.status(403).json({
                message: "Your account is temporarily restricted due to unusual activity. Please try again later.",
                isFrozen: true,
                freezeUntil: user.freezeUntil,
                remainingHours: remainingHours
            });
        }

        next();
    } catch (err) {
        console.error('CheckFreeze Middleware Error:', err);
        res.status(500).json({ message: "Internal Server Error during security check" });
    }
};

module.exports = checkFreeze;
