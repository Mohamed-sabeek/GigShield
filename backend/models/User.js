const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
    platform: { type: String }, // Swiggy, Zomato, Amazon etc.
    city: { type: String },
    workingArea: { type: String },
    averageDailyIncome: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
