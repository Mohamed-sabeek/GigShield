const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// @route   GET api/location/geocode
// @desc    Convert city/place name to coordinates
// @access  Private
router.get('/geocode', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ msg: 'Search query is required' });

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) return res.status(500).json({ msg: 'Weather API key not configured' });

        // OpenWeather Geocoding API
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${apiKey}`;
        const response = await axios.get(url);

        if (response.data.length === 0) {
            return res.status(404).json({ msg: 'Location not found. Please try a different city name.' });
        }

        const location = response.data[0];
        res.json({
            city: location.name,
            state: location.state,
            country: location.country,
            lat: location.lat,
            lon: location.lon
        });

    } catch (err) {
        console.error('Geocoding Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
