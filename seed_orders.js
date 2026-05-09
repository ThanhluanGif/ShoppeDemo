const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./server/models/Order');
const User = require('./server/models/User');
const Product = require('./server/models/Product');

dotenv.config();

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for order seeding...');

    const customer = await User.findOne({ role: 'customer' });
    const admin = await User.findOne({ role: 'admin' });
    const products = await Product.find().limit(5);

    if (!customer || products.length === 0) {
      console.log('Need at least one customer and some products to seed orders.');
      process.exit();
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders.');

    const orders = [];
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    
    for (let i = 0; i < 10; i++) {
      const product = products[i % products.length];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemsPrice = product.price * quantity;
      const shippingPrice = 30000;
      const totalPrice = itemsPrice + shippingPrice;

      const order = new Order({
        user: customer._id,
        orderItems: [
          {
            name: product.name,
            quantity: quantity,
            image: product.image,
            price: product.price,
            product: product._id
          }
        ],
        shippingAddress: {
          address: '123 Đường ABC',
          city: 'Hồ Chí Minh',
          phoneNumber: '0123456789'
        },
        paymentMethod: 'COD',
        itemsPrice,
        shippingPrice,
        totalPrice,
        isPaid: i % 2 === 0,
        paidAt: i % 2 === 0 ? new Date() : null,
        isDelivered: i % 4 === 0,
        deliveredAt: i % 4 === 0 ? new Date() : null,
        status: statuses[i % statuses.length],
        createdAt: new Date(Date.now() - (Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000)) // Random date in last 20 days
      });

      orders.push(order);
    }

    await Order.insertMany(orders);
    console.log('Successfully seeded 10 orders!');
    process.exit();
  } catch (error) {
    console.error('Error seeding orders:', error.message);
    process.exit(1);
  }
};

seedOrders();
