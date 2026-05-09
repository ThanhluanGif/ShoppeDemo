const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword ? {
    name: {
      $regex: req.query.keyword,
      $options: 'i'
    }
  } : {};
  
  const categoryId = req.query.category ? await findCategoryId(req.query.category) : null;
  const category = categoryId ? { category: categoryId } : {};
  const sort = req.query.sort || 'newest';

  // Vendor filtering for Admin/Seller Centre
  let vendorQuery = {};
  const isManagement = req.query.isManagement === 'true';
  
  if (isManagement && req.user && req.user.role === 'vendor') {
    vendorQuery = { vendor: req.user._id };
  }

  const query = { ...keyword, ...category, ...vendorQuery };
  
  let sortQuery = { createdAt: -1 };
  if (sort === 'price_asc') sortQuery = { price: 1 };
  if (sort === 'price_desc') sortQuery = { price: -1 };
  if (sort === 'popular') sortQuery = { rating: -1 };

  const products = await Product.find(query)
    .populate('category', 'name')
    .populate('vendor', 'shopName shopLogo shopDescription')
    .sort(sortQuery);
    
  res.json(products);
});

// Helper to find category ID by name
async function findCategoryId(name) {
  const Category = require('../models/Category');
  const cat = await Category.findOne({ name });
  return cat ? cat._id : null;
}

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('vendor', 'shopName shopLogo shopDescription');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get Flash Sale products
// @route   GET /api/products/flashsale
// @access  Public
const getFlashSaleProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFlashSale: true })
    .populate('vendor', 'shopName shopLogo shopDescription')
    .limit(6);
  res.json(products);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin/Vendor
const createProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, description, price, countInStock, image } = req.body;

  const product = new Product({
    name,
    price,
    vendor: req.user._id,
    image: image || 'https://via.placeholder.com/150',
    brand,
    category,
    countInStock,
    numReviews: 0,
    description,
    slug: name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Vendor
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock, isFlashSale, flashSalePrice, flashSaleStartTime, flashSaleEndTime } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Permission check: admin or owner
    if (req.user.role !== 'admin' && product.vendor?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Bạn không có quyền sửa sản phẩm này');
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    
    // Flash Sale logic
    if (isFlashSale !== undefined) {
      product.isFlashSale = isFlashSale === 'true' || isFlashSale === true;
    }
    product.flashSalePrice = flashSalePrice || product.flashSalePrice;
    product.flashSaleStartTime = flashSaleStartTime || product.flashSaleStartTime;
    product.flashSaleEndTime = flashSaleEndTime || product.flashSaleEndTime;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin/Vendor
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
     // Permission check
     if (req.user.role !== 'admin' && product.vendor?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Bạn không có quyền xóa sản phẩm này');
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if user has purchased this product
    const Order = require('../models/Order');
    const orders = await Order.find({ 
      user: req.user._id, 
      'orderItems.product': req.params.id,
      status: 'Delivered'
    });

    if (orders.length === 0) {
      res.status(400);
      throw new Error('Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công');
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }

    const review = {
      name: req.user.username,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  getFlashSaleProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
};
