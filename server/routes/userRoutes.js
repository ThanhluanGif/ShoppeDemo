const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail, loginUser, getUserProfile, toggleWishlist, addAddress, removeAddress, getUsers, forgotPassword, resetPassword } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/', protect, isAdmin, getUsers);
router.get('/profile', protect, getUserProfile);
router.post('/wishlist', protect, toggleWishlist);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, removeAddress);

module.exports = router;
