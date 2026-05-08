const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, minPrice, maxPrice, category, sort } = req.query;
    let query = {};

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category) {
      const Category = require('../models/Category');
      const foundCategory = await Category.findOne({ name: category });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        // If category name doesn't exist, return empty results
        return res.json([]);
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let apiQuery = Product.find(query).populate('category', 'name slug');

    // Sorting logic
    if (sort === 'newest') {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    } else if (sort === 'priceAsc') {
      apiQuery = apiQuery.sort({ price: 1 });
    } else if (sort === 'priceDesc') {
      apiQuery = apiQuery.sort({ price: -1 });
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 }); // Default to newest
    }

    const products = await apiQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get flash sale products
// @route   GET /api/products/flashsale
// @access  Public
const getFlashSaleProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isFlashSale: true,
      flashSaleEndTime: { $gt: new Date() },
      flashSaleStartTime: { $lte: new Date() }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, brand, price, description, countInStock, variations, isFlashSale, flashSalePrice, flashSaleStartTime, flashSaleEndTime, category } = req.body;

  try {
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/\s+/g, '-');

    const product = new Product({
      name,
      slug,
      brand,
      price,
      description,
      countInStock,
      category,
      variations: variations ? JSON.parse(variations) : [],
      isFlashSale: isFlashSale === 'true',
      flashSalePrice: flashSalePrice || 0,
      flashSaleStartTime,
      flashSaleEndTime,
    });

    // If file uploaded via multer
    if (req.file) {
      product.image = req.file.path;
      product.cloudinary_id = req.file.filename;
    } else {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, brand, price, description, countInStock, variations, isFlashSale, flashSalePrice, flashSaleStartTime, flashSaleEndTime, category } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      if (name) {
        product.slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/\s+/g, '-');
      }
      product.brand = brand || product.brand;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
      
      if (variations) product.variations = JSON.parse(variations);
      
      product.isFlashSale = isFlashSale !== undefined ? isFlashSale === 'true' : product.isFlashSale;
      product.flashSalePrice = flashSalePrice || product.flashSalePrice;
      product.flashSaleStartTime = flashSaleStartTime || product.flashSaleStartTime;
      product.flashSaleEndTime = flashSaleEndTime || product.flashSaleEndTime;

      // Handle image update
      if (req.file) {
        // Delete old image from cloudinary
        if (product.cloudinary_id) {
          await cloudinary.uploader.destroy(product.cloudinary_id);
        }
        product.image = req.file.path;
        product.cloudinary_id = req.file.filename;
      }

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
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Delete image from cloudinary
      if (product.cloudinary_id) {
        await cloudinary.uploader.destroy(product.cloudinary_id);
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
        return res.status(400).json({ message: 'Product already reviewed' });
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

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
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