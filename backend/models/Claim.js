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
    payoutAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    weatherSnapshot: {
        rain: { type: Number },
        temp: { type: Number },
        wind: { type: Number }
    },
    autoProcessed: { type: Boolean, default: true },
    type: { type: String } // RAIN, HEATWAVE etc.
}, { timestamps: true });

module.exports = mongoose.model('Claim', ClaimSchema);
