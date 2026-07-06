const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'admin@mediconnect.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit();
    }

    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@mediconnect.com',
      password: 'password123',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
