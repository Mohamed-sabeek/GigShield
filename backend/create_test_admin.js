const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const email = 'admin@test.com';
        const password = 'admin123';
        
        let user = await User.findOne({ email });
        if (user) {
            console.log('Admin already exists. Updating password...');
        } else {
            user = new User({
                name: 'Test Admin',
                email: email,
                phone: '1234567890',
                role: 'admin'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        console.log(`✅ Admin created/updated: ${email} / ${password}`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

createAdmin();
