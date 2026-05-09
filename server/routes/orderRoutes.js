const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getOrderById, 
  getOrders, 
  updateOrderToDelivered, 
  updateOrderToPaid, 
  updateOrderStatus, 
  getMyOrders, 
  getOrderStats,
  getAdvancedStats
} = require('../controllers/orderController');
const { protect, isAdmin, isStaff } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, isStaff, getOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, isStaff, getOrderStats);
router.get('/advanced-stats', protect, isStaff, getAdvancedStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/deliver', protect, isStaff, updateOrderToDelivered);
router.put('/:id/pay', protect, isAdmin, updateOrderToPaid);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
