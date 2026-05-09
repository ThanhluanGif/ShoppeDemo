const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new orders (splits by vendor)
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
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
    res.status(400);
    throw new Error('No order items');
  }

  // 1. Group items by vendor
  const itemsByVendor = {};
  for (const item of orderItems) {
    const product = await Product.findById(item.product || item._id).populate('vendor');
    const vendorId = product.vendor?._id?.toString() || 'admin';
    
    if (!itemsByVendor[vendorId]) {
      itemsByVendor[vendorId] = {
        vendor: product.vendor,
        items: [],
        itemsPrice: 0
      };
    }
    itemsByVendor[vendorId].items.push({
      ...item,
      product: item.product || item._id,
      _id: undefined
    });
    itemsByVendor[vendorId].itemsPrice += item.price * item.quantity;
  }

  const vendorIds = Object.keys(itemsByVendor);
  const createdOrders = [];

  // 2. Create an order for each vendor
  for (let i = 0; i < vendorIds.length; i++) {
    const vId = vendorIds[i];
    const group = itemsByVendor[vId];
    const vendor = group.vendor;

    const sPrice = i === 0 ? (shippingPrice || 0) : 0;
    const dPrice = i === 0 ? (discountPrice || 0) : 0;
    const tPrice = group.itemsPrice + sPrice - dPrice;

    const order = new Order({
      orderItems: group.items,
      user: req.user._id,
      vendor: vendor?._id || null,
      commissionRate: vendor?.commissionRate || 5,
      shippingAddress,
      paymentMethod,
      itemsPrice: group.itemsPrice,
      shippingPrice: sPrice,
      discountPrice: dPrice,
      totalPrice: tPrice,
      note: i === 0 ? note : ''
    });

    // Calculate initial commission
    order.adminCommission = (order.itemsPrice * order.commissionRate) / 100;
    order.vendorEarnings = order.itemsPrice - order.adminCommission;

    const createdOrder = await order.save();
    createdOrders.push(createdOrder);

    // Decrease Stock
    for (const item of group.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (item.selectedVariation && product.variations?.length > 0) {
          const variation = product.variations.find(v => 
            (v.size === item.selectedVariation.size) && 
            (v.color === item.selectedVariation.color)
          );
          if (variation) {
             variation.countInStock -= item.quantity;
          }
        } else {
          product.countInStock -= item.quantity;
        }
        await product.save();
      }
    }

    // Send Confirmation Email
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #ee4d2d;">Xác nhận đơn hàng #${createdOrder._id.toString().slice(-6)}</h2>
        <p>Xin chào ${req.user.username},</p>
        <p>Đơn hàng của bạn từ shop <strong>${vendor?.shopName || 'Hệ thống'}</strong> đã được tiếp nhận.</p>
        <hr/>
        <h4>Chi tiết đơn hàng:</h4>
        <ul>
          ${group.items.map(item => `<li>${item.name} x ${item.quantity} - ₫${item.price.toLocaleString('vi-VN')}</li>`).join('')}
        </ul>
        <p>Phí vận chuyển: ₫${sPrice.toLocaleString('vi-VN')}</p>
        <p>Giảm giá: -₫${dPrice.toLocaleString('vi-VN')}</p>
        <p><strong>Tổng cộng: ₫${tPrice.toLocaleString('vi-VN')}</strong></p>
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
  }

  res.status(201).json(createdOrders.length === 1 ? createdOrders[0] : createdOrders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'username email')
    .populate('vendor', 'shopName shopLogo');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/Vendor
const getOrders = asyncHandler(async (req, res) => {
  let query = {};
  const isManagement = req.query.isManagement === 'true';
  if (isManagement && req.user.role === 'vendor') {
     query.vendor = req.user._id;
  }
  
  const orders = await Order.find(query).populate('user', 'id username').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin/Vendor
const updateOrderToShipped = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = 'Shipped';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin/Vendor
const updateOrderToDelivered = asyncHandler(async (req, res) => {
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
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    
    // If order was pending, move to Processing
    if (order.status === 'Pending') {
       order.status = 'Processing';
    }

    if (order.isDelivered) {
      await calculateCommission(order);
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin/Vendor
const getOrderStats = asyncHandler(async (req, res) => {
  let query = {};
  const isManagement = req.query.isManagement === 'true';
  if (isManagement && req.user.role === 'vendor') {
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
});

// Helper function to calculate commission and distribute funds to vendor
const calculateCommission = async (order) => {
  // Prevent double distribution
  if (order.isCommissionDistributed) return;

  // Use net items price (total - shipping) for commission calculation if needed, 
  // but here we already have vendorEarnings calculated from itemsPrice in addOrderItems.
  // Let's re-calculate to be sure or use existing values.
  const netItemsPrice = order.itemsPrice; 
  const adminCommission = (netItemsPrice * (order.commissionRate || 5)) / 100;
  const vendorEarnings = netItemsPrice - adminCommission;

  order.adminCommission = adminCommission;
  order.vendorEarnings = vendorEarnings;
  order.isCommissionDistributed = true;

  if (order.vendor) {
     const vendorUser = await User.findById(order.vendor);
     if (vendorUser) {
        vendorUser.balance = (vendorUser.balance || 0) + vendorEarnings;
        await vendorUser.save();
     }
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Vendor
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check permission: User can only cancel their own order
    if (req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }

    // Logic for cancellation
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      if (order.status === 'Delivered') {
        res.status(400);
        throw new Error('Cannot cancel a delivered order');
      }
      
      // Restore Stock
      for (const item of order.orderItems) {
         const product = await Product.findById(item.product);
         if (product) {
            if (item.selectedVariation && product.variations?.length > 0) {
               const variation = product.variations.find(v => 
                  (v.size === item.selectedVariation.size) && 
                  (v.color === item.selectedVariation.color)
               );
               if (variation) {
                  variation.countInStock += item.quantity;
               }
            } else {
               product.countInStock += item.quantity;
            }
            await product.save();
         }
      }
      order.status = 'Cancelled';
    } else if (status !== 'Cancelled') {
      // Only admin/vendor can set other statuses
      if (req.user.role === 'customer') {
         res.status(403);
         throw new Error('Customers can only cancel orders');
      }
      order.status = status;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get advanced order statistics for dashboard
// @route   GET /api/orders/advanced-stats
// @access  Private/Admin/Vendor
const getAdvancedStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let matchQuery = {
    isPaid: true,
    createdAt: { $gte: thirtyDaysAgo }
  };

  if (req.user.role === 'vendor') {
    matchQuery.vendor = req.user._id;
  }

  // 1. Daily Revenue (Last 30 days)
  const dailyRevenue = await Order.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$totalPrice" },
        commission: { $sum: "$adminCommission" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 2. Category Distribution
  const categoryMatchQuery = { isPaid: true };
  if (req.user.role === 'vendor') {
    categoryMatchQuery.vendor = req.user._id;
  }

  const categoryDistribution = await Order.aggregate([
    { $match: categoryMatchQuery },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "productInfo"
      }
    },
    { $unwind: "$productInfo" },
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.category",
        foreignField: "_id",
        as: "categoryInfo"
      }
    },
    { $unwind: "$categoryInfo" },
    {
      $group: {
        _id: "$categoryInfo.name",
        value: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
      }
    }
  ]);

  // 3. Top Selling Products
  const topProducts = await Order.aggregate([
    { $match: categoryMatchQuery },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        totalSold: { $sum: "$orderItems.quantity" },
        revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  // 4. Vendor Specific: Top Vendors (Only for Admin)
  let topVendors = [];
  if (req.user.role === 'admin') {
    topVendors = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: "$vendor",
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      {
        $project: {
          shopName: { 
            $cond: { 
              if: { $eq: ["$_id", null] }, 
              then: "Hệ thống (Admin)", 
              else: { $arrayElemAt: ["$vendorInfo.shopName", 0] } 
            } 
          },
          totalRevenue: 1,
          orderCount: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
  }

  res.json({
    dailyRevenue,
    categoryDistribution,
    topProducts,
    topVendors,
    financialSummary: {
      totalRevenue: dailyRevenue.reduce((acc, curr) => acc + curr.total, 0),
      totalRefund: 0,
      totalRisk: 0,
      totalAdminCommission: dailyRevenue.reduce((acc, curr) => acc + (curr.commission || 0), 0),
    }
  });
});

module.exports = {
  addOrderItems,
  getOrderById,
  getOrders,
  updateOrderToShipped,
  updateOrderToDelivered,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrderStats,
  getAdvancedStats
};
