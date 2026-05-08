const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    shippingPrice,
    discountPrice,
    note
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    try {
      // Find the vendor of the first product (Simplified: 1 vendor per order)
      const firstProduct = await Product.findById(orderItems[0].product).populate('vendor');
      const vendor = firstProduct?.vendor;

      const order = new Order({
        orderItems: orderItems.map((x) => ({
          ...x,
          product: x.product || x._id,
          _id: undefined,
        })),
        user: req.user._id,
        vendor: vendor?._id || null,
        commissionRate: vendor?.commissionRate || 5, // 5% default
        shippingAddress,
        paymentMethod,
        totalPrice,
        shippingPrice,
        discountPrice,
        note
      });

      const createdOrder = await order.save();

      // Send Confirmation Email
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #ee4d2d;">Cảm ơn bạn đã đặt hàng!</h2>
          <p>Xin chào ${req.user.username},</p>
          <p>Đơn hàng của bạn <strong>#${createdOrder._id.toString().slice(-6)}</strong> đã được tiếp nhận thành công.</p>
          <hr/>
          <h4>Chi tiết đơn hàng:</h4>
          <ul>
            ${orderItems.map(item => `<li>${item.name} x ${item.quantity} - ₫${item.price.toLocaleString('vi-VN')}</li>`).join('')}
          </ul>
          <p><strong>Tổng cộng: ₫${totalPrice.toLocaleString('vi-VN')}</strong></p>
          <p>Phương thức thanh toán: ${paymentMethod}</p>
          <hr/>
          <p>Chúng tôi sẽ sớm liên hệ để giao hàng cho bạn.</p>
          <p style="font-size: 12px; color: #888;">Đây là email tự động, vui lòng không phản hồi.</p>
        </div>
      `;

      try {
        await sendEmail({
          email: req.user.email,
          subject: `Xác nhận đơn hàng #${createdOrder._id.toString().slice(-6)}`,
          html: emailHtml
        });
      } catch (err) {
        console.error('Email sending failed:', err.message);
      }

      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/Vendor
const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'vendor') {
       query.vendor = req.user._id;
    }
    
    const orders = await Order.find(query).populate('user', 'id username').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin/Vendor
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';

      if (order.isPaid) {
        await calculateCommission(order);
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';

      if (order.isDelivered) {
        await calculateCommission(order);
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin/Vendor
const getOrderStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'vendor') {
       query.vendor = req.user._id;
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query);
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalPaidOrders = orders.filter(order => order.isPaid).length;

    res.json({
      totalOrders,
      totalRevenue,
      totalPaidOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate commission
const calculateCommission = async (order) => {
  if (order.vendorEarnings > 0) return;

  const netItemsPrice = order.totalPrice - order.shippingPrice;
  const adminCommission = (netItemsPrice * (order.commissionRate || 5)) / 100;
  const vendorEarnings = netItemsPrice - adminCommission;

  order.adminCommission = adminCommission;
  order.vendorEarnings = vendorEarnings;

  if (order.vendor) {
     const vendorUser = await User.findById(order.vendor);
     if (vendorUser) {
        vendorUser.balance += vendorEarnings;
        await vendorUser.save();
     }
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  getMyOrders,
  getOrderStats
};