const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, isAdmin, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ url: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;
