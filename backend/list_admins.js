const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admins = await User.find({ role: 'admin' });
        console.log('--- ADMIN USERS ---');
        admins.forEach(u => console.log(`Email: ${u.email}, Name: ${u.name}`));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listUsers();
