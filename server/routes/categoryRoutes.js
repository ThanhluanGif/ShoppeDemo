const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, isAdmin, createCategory);
router.route('/:id')
  .put(protect, isAdmin, updateCategory)
  .delete(protect, isAdmin, deleteCategory);

module.exports = router;
