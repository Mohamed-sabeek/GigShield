const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// @route   GET api/weather/current
// @desc    Get live parametric weather data
// @access  Private (Worker)
router.get('/current', auth, async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ msg: 'Coordinates (lat, lon) are required' });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey || apiKey === 'your_openweather_api_key_here') {
            return res.status(500).json({ msg: 'Weather API key not configured' });
        }

        // OpenWeather URL
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;

        // Extract metrics
        const rain = data.rain ? data.rain['1h'] || 0 : 0;
        const temp = data.main.temp;
        const wind = data.wind.speed * 3.6; // Convert m/s to km/h
        const location = data.name;

        // Parametric Risk Logic
        let risk = 'LOW';
        let riskColor = 'green';
        let alertMessage = null;

        if (rain >= 2) {
            risk = 'HIGH';
            riskColor = 'red';
            alertMessage = 'Heavy rain detected. You are eligible for an instant claim.';
        } else if (temp >= 40) {
            risk = 'HEATWAVE';
            riskColor = 'orange';
            alertMessage = 'Extreme temperature detected. Health safety protocol active.';
        }

        res.json({
            rain,
            temp,
            wind,
            risk,
            riskColor,
            alertMessage,
            location,
            timestamp: new Date()
        });

    } catch (err) {
        console.error('Weather Fetch Error:', err.message);
        res.status(500).json({ msg: 'Weather system synchronization failed' });
    }
});

module.exports = router;
