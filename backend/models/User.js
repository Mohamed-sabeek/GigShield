const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true }, // Added & Required for production
    role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
    platform: { type: String }, // Swiggy, Zomato etc.
    jobType: { type: String }, // Added
    district: { type: String }, // Added
    city: { type: String }, // Keeping for backwards compatibility if any
    workingArea: { type: String },
    averageDailyIncome: { type: Number, default: 0 },
    location: {
        lat: { type: Number },
        lon: { type: Number }
    } // Added
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
