const crypto = require('crypto');
const Order = require('../models/Order');

/**
 * VNPay Payment Controller
 */
const createPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, bankCode } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const date = new Date();
    const createDate = formatDate(date);
    
    // IP Address
    const ipAddr = req.headers['x-forwarded-for'] ||
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   req.connection.socket.remoteAddress;

    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.status(200).json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error('VNPay error:', error);
    res.status(500).json({ message: error.message });
  }
};

const vnpayIpn = async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  const secretKey = process.env.VNP_HASH_SECRET;
  const querystring = require('qs');
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      }

      // Check amount
      const vnpAmount = vnp_Params['vnp_Amount'] / 100;
      if (order.totalPrice !== vnpAmount) {
         return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
      }

      // Check status
      if (order.isPaid) {
        return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
      }

      if (rspCode === '00') {
        // Success
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Processing';
        order.paymentResult = {
          id: vnp_Params['vnp_TransactionNo'],
          status: 'Success',
          update_time: vnp_Params['vnp_PayDate']
        };
        await order.save();
        res.status(200).json({ RspCode: '00', Message: 'Success' });
      } else {
        // Fail
        res.status(200).json({ RspCode: '00', Message: 'Success' }); // Still return 00 for IPN receipt
      }
    } catch (error) {
      res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
  } else {
    res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
  }
};

const vnpayReturn = async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  const secretKey = process.env.VNP_HASH_SECRET;
  const querystring = require('qs');
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    res.status(200).json({ code: vnp_Params['vnp_ResponseCode'] });
  } else {
    res.status(200).json({ code: '97' });
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

function formatDate(date) {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return yyyy + mm + dd + hh + min + ss;
}

module.exports = {
  createPaymentUrl,
  vnpayIpn,
  vnpayReturn
};
