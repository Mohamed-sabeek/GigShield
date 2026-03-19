const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    disruptionType: { type: String, required: true }, // Heavy Rain, Flood, Pollution
    incidentDate: { type: Date, default: Date.now },
    location: {
        lat: { type: Number },
        lon: { type: Number },
        source: { type: String }, // 'gps' | 'ip' | 'manual'
        accuracy: { type: Number },
        details: { city: { type: String }, region: { type: String } }
    },
    payoutAmount: { type: Number, default: 0 }, // Assigned by admin on approval
    status: { type: String, enum: ['Pending', 'Verified', 'Approved', 'Rejected'], default: 'Pending' },
    weatherVerification: {
        isValid: { type: Boolean },
        rainfall: { type: Number },
        condition: { type: String },
        category: { type: String }, // Low Rain, Moderate Rain, Heavy Rain
        verifiedAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Claim', ClaimSchema);
