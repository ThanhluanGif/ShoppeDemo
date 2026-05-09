const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      const field = userExists.email === email ? 'Email' : 'Username';
      return res.status(400).json({ message: `${field} already exists` });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
      verificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    if (user) {
      // Send Verification Email
      const verifyUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #ee4d2d;">Xác nhận đăng ký tài khoản</h2>
          <p>Xin chào <strong>${user.username}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại ThanhLuanShop. Vui lòng nhấn vào nút bên dưới để xác nhận email của bạn:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #ee4d2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xác nhận Email</a>
          </div>
          <p>Link này sẽ hết hạn sau 24 giờ.</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">Đây là email tự động, vui lòng không phản hồi.</p>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Xác nhận đăng ký tài khoản',
          html: emailHtml
        });
      } catch (err) {
        console.error('Verification email failed:', err.message);
      }

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Link xác thực không hợp lệ hoặc đã hết hạn' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    res.json({ message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const fs = require('fs');
  const log = (msg) => fs.appendFileSync('login_debug.log', `${new Date().toISOString()} - ${msg}\n`);

  try {
    log(`Attempting login for: ${email}`);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      log(`User not found: ${email}`);
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await user.comparePassword(password);
    log(`Password match for ${email}: ${isMatch}`);

    if (isMatch) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
  } catch (error) {
    log(`Error during login for ${email}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price image');

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        vendorStatus: user.vendorStatus,
        shopName: user.shopName,
        shopDescription: user.shopDescription,
        shopLogo: user.shopLogo,
        balance: user.balance,
        wishlist: user.wishlist,
        addresses: user.addresses,
        googleId: user.googleId,
        facebookId: user.facebookId
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register as a vendor
// @route   PUT /api/users/register-vendor
// @access  Private
const registerVendor = async (req, res) => {
  const { shopName, shopDescription } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'vendor' || user.role === 'admin') {
      return res.status(400).json({ message: 'Bạn đã là người bán hoặc admin' });
    }

    user.vendorStatus = 'pending';
    user.shopName = shopName;
    user.shopDescription = shopDescription;
    
    await user.save();

    res.json({ 
      message: 'Yêu cầu đăng ký bán hàng đã được gửi và đang chờ duyệt.',
      vendorStatus: user.vendorStatus 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject vendor
// @route   PUT /api/users/:id/approve-vendor
// @access  Private/Admin
const approveVendor = async (req, res) => {
  const { status, commissionRate } = req.body; 

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (status === 'approved') {
      user.role = 'vendor';
      user.vendorStatus = 'approved';
      user.commissionRate = commissionRate || user.commissionRate;
    } else {
      user.vendorStatus = 'rejected';
    }

    await user.save();
    res.json({ message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu bán hàng.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(productId);

    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ message: 'Wishlist updated', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  const { street, city, phone, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ street, city, phone, isDefault });
    await user.save();
    
    res.status(201).json({ message: 'Address added', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove an address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const removeAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    await user.save();
    res.json({ message: 'Address removed', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetpassword/${resetToken}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #ee4d2d;">Khôi phục mật khẩu</h2>
        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #ee4d2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
        </div>
        <p>Link này sẽ hết hạn sau 10 phút.</p>
        <hr/>
        <p style="font-size: 12px; color: #888;">Đây là email tự động, vui lòng không phản hồi.</p>
      </div>
    `;

    try {
      await sendEmail({ email: user.email, subject: 'Khôi phục mật khẩu', html: emailHtml });
      res.json({ message: 'Email sent successfully' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth Callback
// @route   GET /api/users/auth/google/callback
// @access  Public
const googleAuthCallback = async (req, res) => {
  const token = generateToken(req.user._id);
  const userData = JSON.stringify({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    token: token
  });

  // Redirect to frontend with token and user data in URL or cookie
  // For simplicity, we'll use a redirect to a frontend "auth-success" page
  // You need to adjust the FRONTEND_URL in your .env
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth-success?token=${token}&user=${encodeURIComponent(userData)}`);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;

      // Vendor-specific fields
      if (user.role === 'vendor' || user.role === 'admin') {
        user.shopName = req.body.shopName || user.shopName;
        user.shopDescription = req.body.shopDescription || user.shopDescription;
        user.shopLogo = req.body.shopLogo || user.shopLogo;
        user.shopBanner = req.body.shopBanner || user.shopBanner;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        shopName: updatedUser.shopName,
        shopDescription: updatedUser.shopDescription,
        shopLogo: updatedUser.shopLogo,
        shopBanner: updatedUser.shopBanner,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
  addAddress,
  removeAddress,
  getUsers,
  forgotPassword,
  resetPassword,
  registerVendor,
  approveVendor,
  googleAuthCallback
};