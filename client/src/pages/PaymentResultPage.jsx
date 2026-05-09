import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { get } from '../services/api';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success', 'fail', 'error'
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const responseCode = searchParams.get('vnp_ResponseCode');
        const orderId = searchParams.get('vnp_TxnRef');
        
        // Verify with backend
        const { data } = await get(`/payment/vnpay_return?${searchParams.toString()}`);
        
        if (data.code === '00') {
          setStatus('success');
        } else {
          setStatus('fail');
        }

        // Fetch order details
        if (orderId) {
          const { data: orderData } = await get(`/orders/${orderId}`);
          setOrderInfo(orderData);
        }
      } catch (error) {
        console.error('Verify payment error:', error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-shopee animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Đang xác thực giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm overflow-hidden">
        <div className={`p-8 text-center ${status === 'success' ? 'bg-green-50' : status === 'fail' ? 'bg-red-50' : 'bg-gray-50'}`}>
          {status === 'success' ? (
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          ) : status === 'fail' ? (
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          )}

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {status === 'success' ? 'Thanh toán thành công!' : status === 'fail' ? 'Thanh toán thất bại' : 'Có lỗi xảy ra'}
          </h1>
          <p className="text-gray-600 text-sm">
            {status === 'success' 
              ? 'Cảm ơn bạn đã mua sắm tại ThanhLuanShop. Đơn hàng của bạn đang được xử lý.' 
              : 'Giao dịch không thành công hoặc đã bị hủy. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {orderInfo && (
            <div className="border-b border-gray-100 pb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Mã đơn hàng:</span>
                <span className="font-medium text-gray-800">#{orderInfo._id.toString().slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-bold text-shopee">₫{orderInfo.totalPrice.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phương thức:</span>
                <span className="text-gray-800">VNPay</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2">
            <Link 
              to="/profile" 
              className="flex items-center justify-center gap-2 bg-shopee text-white py-3 rounded-md font-medium hover:bg-shopee-hover transition shadow-sm"
            >
              Xem đơn hàng của tôi <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-md font-medium hover:bg-gray-50 transition"
            >
              <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center">
          <p className="text-[11px] text-gray-400">
            Nếu bạn gặp bất kỳ vấn đề gì, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi qua hotline 1900 xxxx.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
