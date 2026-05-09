const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getFlashSaleProducts, createProduct, updateProduct, deleteProduct, createProductReview } = require('../controllers/productController');
const { protect, isAdmin, isStaff, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Route GET: Public - Ai cũng có thể xem sản phẩm
// optionalProtect allows identifying vendor for filtering when logged in
router.get('/', optionalProtect, getProducts);
router.get('/flashsale', getFlashSaleProducts);
router.get('/:id', getProductById);

// Route POST: Private/Staff - Admin và Vendor đều có thể thêm sản phẩm
router.post('/', protect, isStaff, upload.single('image'), createProduct);

// Route POST: Private - Ai đăng nhập cũng có thể review
router.post('/:id/reviews', protect, createProductReview);

// Route PUT & DELETE: Private/Staff
router.route('/:id')
  .put(protect, isStaff, upload.single('image'), updateProduct)
  .delete(protect, isStaff, deleteProduct);

module.exports = router;
