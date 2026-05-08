const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, getOrders, updateOrderToDelivered, updateOrderToPaid, getMyOrders, getOrderStats } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, isAdmin, getOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, isAdmin, getOrderStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/deliver', protect, isAdmin, updateOrderToDelivered);
router.put('/:id/pay', protect, isAdmin, updateOrderToPaid);

module.exports = router;
