const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use in-memory database for development if no MongoDB URI is provided
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/monopoly';
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Running without database - data will not persist');
  }
};

module.exports = connectDB;
