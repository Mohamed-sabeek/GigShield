const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({}, { strict: false });
const Claim = mongoose.model('Claim2', ClaimSchema, 'claims');

const MONGO_URI = 'mongodb://127.0.0.1:27017/gigshield';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const res = await Claim.deleteMany({});
    console.log('Deleted Claims count:', res.deletedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
