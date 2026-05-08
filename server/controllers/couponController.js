const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa' });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: 'Mã giảm giá này đã hết hạn' });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá này đã hết lượt sử dụng' });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu ₫${coupon.minPurchase.toLocaleString('vi-VN')} để áp dụng mã này` });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate, usageLimit } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại' });
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
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      res.json(coupon);
    } else {
      res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate, usageLimit, isActive } = req.body;

  try {
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
      res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Đã xóa mã giảm giá thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  validateCoupon,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
};