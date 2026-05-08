const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const keyword = req.query.keyword ? {
    name: {
      $regex: req.query.keyword,
      $options: 'i'
    }
  } : {};
  const category = req.query.category ? { category: await findCategoryId(req.query.category) } : {};
  const sort = req.query.sort || 'newest';

  // Vendor filtering for Admin/Seller Centre
  let vendorQuery = {};
  // Check if it's an admin request (e.g. from /admin/products)
  // In a real app we'd check the route, but here we can check if req.user exists and role is vendor
  if (req.user && req.user.role === 'vendor') {
    vendorQuery = { vendor: req.user._id };
  }

  try {
    const query = { ...keyword, ...category, ...vendorQuery };
    
    let sortQuery = { createdAt: -1 };
    if (sort === 'price_asc') sortQuery = { price: 1 };
    if (sort === 'price_desc') sortQuery = { price: -1 };
    if (sort === 'popular') sortQuery = { rating: -1 };

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery);
      
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to find category ID by name
async function findCategoryId(name) {
  const Category = require('../models/Category');
  const cat = await Category.findOne({ name });
  return cat ? cat._id : null;
}

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Flash Sale products
// @route   GET /api/products/flashsale
// @access  Public
const getFlashSaleProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFlashSale: true }).limit(6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin/Vendor
const createProduct = async (req, res) => {
  const { name, brand, category, description, price, countInStock, image } = req.body;

  try {
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
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Vendor
const updateProduct = async (req, res) => {
  const { name, price, description, image, brand, category, countInStock, isFlashSale, flashSalePrice, flashSaleStartTime, flashSaleEndTime } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Permission check: admin or owner
      if (req.user.role !== 'admin' && product.vendor?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa sản phẩm này' });
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
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin/Vendor
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
       // Permission check
       if (req.user.role !== 'admin' && product.vendor?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này' });
      }

      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
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
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFlashSaleProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
};