const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const couponRoutes = require('./routes/couponRoutes');
const configRoutes = require('./routes/configRoutes');
const passport = require('passport');
require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Cấu hình CORS
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/config', configRoutes);

module.exports = app;
