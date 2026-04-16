const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planName: { type: String, default: 'GigShield Basic' },
    premium: { type: Number, required: true },
    coverage: { type: Number, required: true }, // Default ₹500
    riskScore: { type: Number },
    riskLevel: { type: String }, // Removed strict enum to allow dynamic Tamil Nadu cities
    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    startDate: { type: Date, default: Date.now },
    endDate: {
        type: Date,
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 1 week
    }
}, { timestamps: true });

module.exports = mongoose.model('Policy', PolicySchema);
