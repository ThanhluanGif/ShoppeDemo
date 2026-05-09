const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) {
    res.status(404);
    throw new Error('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa');
  }

  if (new Date() > coupon.expiryDate) {
    res.status(400);
    throw new Error('Mã giảm giá này đã hết hạn');
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Mã giảm giá này đã hết lượt sử dụng');
  }

  if (cartTotal < coupon.minPurchase) {
    res.status(400);
    throw new Error(`Đơn hàng tối thiểu ₫${coupon.minPurchase.toLocaleString('vi-VN')} để áp dụng mã này`);
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountAmount) / 100;
  } else {
    discount = coupon.discountAmount;
  }

  res.json({
    code: coupon.code,
    discountAmount: discount,
    discountType: coupon.discountType,
    value: coupon.discountAmount
  });
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate, usageLimit } = req.body;

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
  if (couponExists) {
    res.status(400);
    throw new Error('Mã giảm giá này đã tồn tại');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountAmount,
    minPurchase: minPurchase || 0,
    expiryDate,
    usageLimit: usageLimit || null
  });

  res.status(201).json(coupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    res.json(coupon);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy mã giảm giá');
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate, usageLimit, isActive } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = (code || coupon.code).toUpperCase();
    coupon.discountType = discountType || coupon.discountType;
    coupon.discountAmount = discountAmount || coupon.discountAmount;
    coupon.minPurchase = minPurchase !== undefined ? minPurchase : coupon.minPurchase;
    coupon.expiryDate = expiryDate || coupon.expiryDate;
    coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy mã giảm giá');
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: 'Đã xóa mã giảm giá thành công' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy mã giảm giá');
  }
});

module.exports = {
  validateCoupon,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
};
