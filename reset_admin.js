const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./server/models/User');

dotenv.config();

const resetAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Lỗi: MONGO_URI không được tìm thấy trong file .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Đã kết nối tới MongoDB...');

    // Xóa admin cũ nếu có
    await User.deleteMany({ role: 'admin' });
    console.log('Đã xóa các tài khoản admin cũ.');

    // Tạo admin mới
    const admin = new User({
      username: 'admin_fixed',
      email: 'admin@gmail.com',
      password: 'admin12345678', // Ít nhất 8 ký tự
      role: 'admin',
      isVerified: true
    });

    await admin.save();
    
    console.log('--- KHỞI TẠO TÀI KHOẢN ADMIN THÀNH CÔNG ---');
    console.log('Email: admin@gmail.com');
    console.log('Mật khẩu: admin12345678');
    console.log('Vai trò: admin');
    console.log('------------------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('Lỗi khi reset Admin:', error.message);
    process.exit(1);
  }
};

resetAdmin();
