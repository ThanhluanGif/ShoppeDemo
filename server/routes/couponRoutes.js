const express = require('express');
const router = express.Router();
const { 
  validateCoupon, 
  createCoupon, 
  getCoupons, 
  getCouponById, 
  updateCoupon, 
  deleteCoupon 
} = require('../controllers/couponController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/validate', protect, validateCoupon);

router.route('/')
  .post(protect, isAdmin, createCoupon)
  .get(protect, isAdmin, getCoupons);

router.route('/:id')
  .get(protect, isAdmin, getCouponById)
  .put(protect, isAdmin, updateCoupon)
  .delete(protect, isAdmin, deleteCoupon);

module.exports = router;