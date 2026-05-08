const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

// Load models
const Product = require('./server/models/Product');
const Category = require('./server/models/Category');

dotenv.config();

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for External Seeding...'))
  .catch(err => console.error(err));

const seedFromOpenAPI = async () => {
  try {
    // 1. Fetch dữ liệu từ Fake Store API (Open API nổi tiếng cho E-commerce)
    console.log('Fetching data from Fake Store API...');
    const response = await axios.get('https://fakestoreapi.com/products');
    const externalProducts = response.data;

    // 2. Dọn dẹp Products và Categories cũ để tránh trùng lặp
    await Product.deleteMany();
    await Category.deleteMany();
    console.log('Old Data Cleaned...');

    // 3. Trích xuất và tạo Categories duy nhất từ API
    const categoriesNames = [...new Set(externalProducts.map(p => p.category))];
    const categoryDocs = await Category.insertMany(
      categoriesNames.map(name => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `All products in ${name} category`
      }))
    );
    console.log(`${categoryDocs.length} Categories created.`);

    // Map tên category sang ID để gắn vào Product
    const categoryMap = {};
    categoryDocs.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
    });

    // 4. Chuyển đổi và tạo Products
    const productsToInsert = externalProducts.map(p => ({
      name: p.title,
      slug: p.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/\s+/g, '-'),
      brand: 'OpenAPI Brand', // API này không có brand, ta đặt mặc định
      price: p.price,
      description: p.description,
      category: categoryMap[p.category.toLowerCase()],
      image: p.image,
      images: [p.image],
      countInStock: Math.floor(Math.random() * 50) + 10, // Random stock
      rating: p.rating.rate,
      numReviews: p.rating.count
    }));

    await Product.insertMany(productsToInsert);
    console.log(`${productsToInsert.length} Products imported successfully from Open API!`);

    process.exit();
  } catch (error) {
    console.error(`Error with Open API seeding: ${error.message}`);
    process.exit(1);
  }
};

seedFromOpenAPI();
