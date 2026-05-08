const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (adminExists) {
      console.log('Tài khoản Admin đã tồn tại!');
      process.exit();
    }

    const admin = new User({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'password123',
      role: 'admin'
    });

    await admin.save();
    console.log('--- TẠO TÀI KHOẢN ADMIN THÀNH CÔNG ---');
    console.log('Email: admin@gmail.com');
    console.log('Password: password123');
    console.log('--------------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('Lỗi khi tạo Admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
