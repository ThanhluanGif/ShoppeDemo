const express = require('express');
const router = express.Router();
const { createPaymentUrl, vnpayIpn, vnpayReturn } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create_payment_url', protect, createPaymentUrl);
router.get('/vnpay_ipn', vnpayIpn);
router.get('/vnpay_return', vnpayReturn);

module.exports = router;
