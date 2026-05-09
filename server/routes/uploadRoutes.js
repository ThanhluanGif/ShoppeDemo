const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, isAdmin, isStaff } = require('../middleware/authMiddleware');

router.post('/', protect, isStaff, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ url: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;
