const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    disruptionType: { type: String, required: true }, // Heavy Rain, Flood, Pollution
    payoutAmount: { type: Number, default: 0 }, // Assigned by admin on approval
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Claim', ClaimSchema);
