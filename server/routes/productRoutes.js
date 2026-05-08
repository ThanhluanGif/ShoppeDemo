const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getFlashSaleProducts, createProduct, updateProduct, deleteProduct, createProductReview } = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Route GET: Public - Ai cũng có thể xem sản phẩm
router.get('/', getProducts);
router.get('/flashsale', getFlashSaleProducts);
router.get('/:id', getProductById);

// Route POST: Private/Admin - Chỉ Admin mới có thể thêm sản phẩm
router.post('/', protect, isAdmin, upload.single('image'), createProduct);

// Route POST: Private - Ai đăng nhập cũng có thể review
router.post('/:id/reviews', protect, createProductReview);

// Route PUT & DELETE: Private/Admin
router.route('/:id')
  .put(protect, isAdmin, upload.single('image'), updateProduct)
  .delete(protect, isAdmin, deleteProduct);

module.exports = router;
