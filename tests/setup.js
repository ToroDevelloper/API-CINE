const mongoose = require('mongoose');

exports.connect = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api_cine_test';
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
    await mongoose.connect(uri);
};

exports.closeDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
};

exports.clearDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }
};
