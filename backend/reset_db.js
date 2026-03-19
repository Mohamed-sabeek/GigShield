const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

async function resetDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Drop Database
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped/cleared');

        // 2. Create Default Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const admin = new User({
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('\n✅ Database reset complete!');
        console.log('--- Default Admin Credentials ---');
        console.log('Email: admin@gmail.com');
        console.log('Password: password123');
        console.log('Role: Admin');

        // Optional: Create a Test Worker so they have someone to test with immediately
        const workerHashedPassword = await bcrypt.hash('password123', salt);
        const worker = new User({
            name: 'Test Worker',
            email: 'worker@gmail.com',
            password: workerHashedPassword,
            role: 'worker',
            platform: 'Swiggy',
            city: 'Chennai',
            workingArea: 'T Nagar',
            averageDailyIncome: 500
        });
        await worker.save();
        console.log('\n--- Default Worker Credentials ---');
        console.log('Email: worker@gmail.com');
        console.log('Password: password123');
        console.log('Role: Worker');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Reset Error:', err);
        process.exit(1);
    }
}

resetDB();
