const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const passport = require('passport');

router.post('/', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

// Google Auth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleAuthCallback
);

// Facebook Auth Routes
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  googleAuthCallback // Reusing the same callback as logic is identical
);

router.get('/', protect, isAdmin, getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/register-vendor', protect, registerVendor);
router.put('/:id/approve-vendor', protect, isAdmin, approveVendor);

router.post('/wishlist', protect, toggleWishlist);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, removeAddress);

module.exports = router;
