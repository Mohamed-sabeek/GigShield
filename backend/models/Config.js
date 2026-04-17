const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    testMode: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Config', ConfigSchema);
