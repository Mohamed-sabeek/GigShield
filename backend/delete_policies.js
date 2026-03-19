const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({}, { strict: false });
const Policy = mongoose.model('Policy5', PolicySchema, 'policies');

const MONGO_URI = 'mongodb://127.0.0.1:27017/gigshield';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const res = await Policy.deleteMany({});
    console.log('Deleted policies count:', res.deletedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
