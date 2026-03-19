require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.OPENWEATHER_API_KEY;
console.log("Using API Key:", apiKey);

if (!apiKey) {
    console.log("No API Key found in .env");
    process.exit(1);
}

const lat = 10.37;
const lon = 78.82;

const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

axios.get(url)
  .then(res => {
      console.log("STATUS:", res.status);
      console.log("DATA:", res.data);
      process.exit(0);
  })
  .catch(err => {
      console.error("AXIOS ERROR CODE:", err.response ? err.response.status : "No Response");
      console.error("AXIOS ERROR DATA:", err.response ? err.response.data : err.message);
      process.exit(1);
  });
