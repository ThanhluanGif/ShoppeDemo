// @desc    Get Bank Transfer details
// @route   GET /api/config/bank-details
// @access  Public
const getBankDetails = (req, res) => {
  res.json({
    bankName: process.env.BANK_NAME,
    accountName: process.env.BANK_ACCOUNT_NAME,
    accountNumber: process.env.BANK_ACCOUNT_NUMBER,
    qrCodeTemplate: process.env.BANK_QR_CODE_URL,
  });
};

module.exports = { getBankDetails };
