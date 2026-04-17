const mongoose = require('mongoose');
require('dotenv').config();
const Policy = require('./models/Policy');

const cleanupPolicies = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for cleanup...');

        // Step 1: Normalize - Mark expired policies as "Expired"
        const expiredRes = await Policy.updateMany(
            { status: "Active", endDate: { $lte: new Date() } },
            { status: "Expired" }
        );
        console.log(`Normalized database: ${expiredRes.modifiedCount} formerly active policies marked as Expired.`);

        // Step 2: Remove duplicates for remaining active policies
        const duplicates = await Policy.aggregate([
            { $match: { status: { $regex: /^active$/i } } },
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 },
                    docs: { $push: "$_id" }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);

        console.log(`Found ${duplicates.length} users with duplicate active policies.`);

        let deletedCount = 0;
        for (const user of duplicates) {
            // Keep the first (newest or oldest depending on index, usually oldest if push)
            const [keep, ...remove] = user.docs;
            const res = await Policy.deleteMany({ _id: { $in: remove } });
            deletedCount += res.deletedCount;
        }

        console.log(`Successfully removed ${deletedCount} duplicate active policies.`);

        // Step 3: Remove orphans (policies belonging to deleted users)
        const User = require('./models/User');
        const allUserIds = await User.distinct('_id');
        const orphansRes = await Policy.deleteMany({
            userId: { $nin: allUserIds }
        });
        console.log(`Orphan cleanup: Removed ${orphansRes.deletedCount} policies belonging to non-existent users.`);

        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
};

cleanupPolicies();
