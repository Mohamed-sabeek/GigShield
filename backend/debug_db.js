const mongoose = require('mongoose');
require('dotenv').config();
const Policy = require('./models/Policy');

const debugPolicies = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected...');

        const allPolicies = await Policy.find({});
        console.log(`Total Policies in DB: ${allPolicies.length}`);

        const statuses = await Policy.distinct('status');
        console.log('Unique statuses found:', statuses);

        for (const status of statuses) {
            const count = await Policy.countDocuments({ status });
            console.log(`Count for status "${status}": ${count}`);
        }

        const activeCount = await Policy.countDocuments({ status: 'Active' });
        const activeLowerCount = await Policy.countDocuments({ status: 'active' });
        console.log(`Strict "Active" count: ${activeCount}`);
        console.log(`Strict "active" count: ${activeLowerCount}`);

        const User = require('./models/User');
        const totalWorkers = await User.countDocuments({ role: 'worker' });
        console.log(`Total Workers (role='worker') in DB: ${totalWorkers}`);

        const allUserIds = await User.distinct('_id');
        const workerIds = await User.distinct('_id', { role: 'worker' });

        const policyUserIds = await Policy.distinct('userId', { status: 'Active' });
        console.log(`Policy User IDs: ${policyUserIds.length}`);

        let orphanCount = 0;
        let nonWorkerCount = 0;
        for (const pUid of policyUserIds) {
            const user = await User.findById(pUid);
            if (!user) {
                orphanCount++;
            } else if (user.role !== 'worker') {
                nonWorkerCount++;
                console.log(`Policy found for non-worker: ${user.email} (Role: ${user.role})`);
            }
        }
        console.log(`Active policies belonging to non-existent users: ${orphanCount}`);
        console.log(`Active policies belonging to non-workers (admins?): ${nonWorkerCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugPolicies();
