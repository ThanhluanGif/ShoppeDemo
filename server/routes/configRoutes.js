const express = require('express');
const router = express.Router();
const { getBankDetails } = require('../controllers/configController');

router.get('/bank-details', getBankDetails);

module.exports = router;
