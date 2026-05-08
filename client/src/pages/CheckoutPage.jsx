import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ChevronRight, CheckCircle, Ticket, Info, Truck, MessageCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { post, get } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    phoneNumber: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [bankDetails, setBankDetails] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [shippingFee] = useState(15000); // Fixed shipping fee in VND
  const [loading, setLoading] = useState(false);
  const [note, setMessage] = useState('');

  const discountAmount = useMemo(() => couponInfo ? couponInfo.discountAmount : 0, [couponInfo]);
  const finalTotal = useMemo(() => cartTotal - discountAmount + shippingFee, [cartTotal, discountAmount, shippingFee]);

  const qrCodeUrl = useMemo(() => {
    if (!bankDetails?.qrCodeTemplate) return '';
    const randomId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return bankDetails.qrCodeTemplate
      ?.replace('{amount}', Math.round(finalTotal).toString())
      ?.replace('{orderId}', `ORD${randomId}`);
  }, [bankDetails, finalTotal]);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const { data } = await get('/config/bank-details');
        setBankDetails(data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin ngân hàng:', error);
      }
    };
    fetchBankDetails();
  }, []);

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setShippingAddress({
        address: defaultAddr.street,
        city: defaultAddr.city,
        phoneNumber: defaultAddr.phone
      });
    }
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await post('/coupons/validate', { code: couponCode, cartTotal });
      setCouponInfo(data);
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setCouponInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.phoneNumber) {
      return toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id,
          selectedVariation: item.selectedVariation
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: shippingFee,
        discountPrice: discountAmount,
        totalPrice: finalTotal,
        note
      };

      await post('/orders', orderData);
      toast.success('Đặt hàng thành công! Cảm ơn bạn.');
      clearCart();
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  // Auth & Cart early returns after hooks
  if (!user) {
    useEffect(() => {
      navigate('/login?redirect=checkout');
    }, [navigate]);
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
         <div className="bg-white p-10 text-center shadow-sm rounded-sm">
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào để thanh toán</p>
            <Link to="/" className="bg-shopee text-white px-8 py-2 rounded-sm font-medium">Quay lại mua sắm</Link>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20 font-sans">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        
        <div className="mb-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-shopee">
              <CheckCircle className="w-8 h-8 fill-current bg-white rounded-full" />
              <h1 className="text-2xl font-medium tracking-tight">Thanh Toán</h1>
           </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm mb-3 relative overflow-hidden">
           <div className="h-1 bg-[repeating-linear-gradient(45deg,#ee4d2d,#ee4d2d_33px,#fff_33px,#fff_41px,#405fb0_41px,#405fb0_74px,#fff_74px,#fff_82px)]"></div>
           <div className="p-6">
              <div className="flex items-center gap-2 text-shopee mb-4 font-medium">
                 <MapPin className="w-5 h-5" />
                 <span>Địa Chỉ Nhận Hàng</span>
              </div>
              <div className="flex items-start md:items-center justify-between gap-4">
                 <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <span className="font-bold text-gray-800 whitespace-nowrap">{user.username} {shippingAddress.phoneNumber}</span>
                    <span className="text-gray-800 line-clamp-1">{shippingAddress.address}, {shippingAddress.city}</span>
                    {user.addresses?.length > 0 && (
                       <span className="text-[10px] border border-shopee text-shopee px-1 rounded-sm uppercase font-bold shrink-0 w-fit">Mặc định</span>
                    )}
                 </div>
                 <button className="text-blue-600 text-sm font-medium hover:underline shrink-0">Thay Đổi</button>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm mb-3 overflow-hidden">
           <div className="p-6 border-b border-gray-50 flex items-center justify-between text-sm text-gray-500">
              <span className="font-medium text-gray-800 text-base">Sản phẩm</span>
              <div className="hidden md:flex gap-16 pr-10">
                 <span className="w-24 text-center">Đơn giá</span>
                 <span className="w-20 text-center">Số lượng</span>
                 <span className="w-24 text-right">Thành tiền</span>
              </div>
           </div>
           
           <div className="divide-y divide-gray-50">
              {cartItems.map((item) => (
                <div key={item._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex gap-3 flex-1">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover border border-gray-100" />
                      <div>
                         <p className="text-[13px] text-gray-800 line-clamp-1">{item.name}</p>
                         <p className="text-xs text-gray-400 mt-1">Loại: {item.selectedVariation ? (item.selectedVariation.size || item.selectedVariation.color) : 'Mặc định'}</p>
                      </div>
                   </div>
                   <div className="flex md:gap-16 items-center justify-between md:justify-end text-sm">
                      <span className="w-24 text-center text-gray-800">₫{item.price.toLocaleString('vi-VN')}</span>
                      <span className="w-20 text-center text-gray-500">x{item.quantity}</span>
                      <span className="w-24 text-right font-medium text-gray-800">₫{(item.price * item.quantity).toLocaleString('vi-VN')}</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-[#fafdff] p-6 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-shopee">
                 <Ticket className="w-5 h-5" />
                 <span className="text-sm">Voucher của Shop</span>
              </div>
              <div className="flex gap-2">
                 <input 
                  type="text" 
                  placeholder="Chọn hoặc nhập mã" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="border border-gray-200 rounded-sm px-4 py-1.5 text-sm focus:border-shopee outline-none transition w-48"
                 />
                 <button 
                  onClick={handleApplyCoupon}
                  className="bg-shopee text-white px-6 py-1.5 rounded-sm text-sm font-medium hover:bg-shopee-hover transition"
                 >
                    Áp dụng
                 </button>
              </div>
           </div>

           <div className="bg-[#fafdff] p-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4 items-start border-r border-gray-100 pr-8">
                 <span className="text-sm text-gray-500 whitespace-nowrap">Lời nhắn:</span>
                 <input 
                  type="text" 
                  placeholder="Lưu ý cho Người bán..." 
                  className="flex-1 border border-gray-200 rounded-sm px-3 py-1.5 text-sm outline-none focus:border-shopee"
                  value={note}
                  onChange={(e) => setMessage(e.target.value)}
                 />
              </div>
              <div className="flex flex-col gap-2 pl-4">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-600 font-medium flex items-center gap-1">
                       <Truck className="w-4 h-4" /> Đơn vị vận chuyển: Nhanh
                    </span>
                    <span className="text-sm text-gray-800 font-medium">₫{shippingFee.toLocaleString('vi-VN')}</span>
                 </div>
                 <p className="text-[11px] text-gray-400 italic">Nhận hàng vào 12 Th05 - 15 Th05</p>
              </div>
           </div>

           <div className="p-6 border-t border-gray-50 text-right">
              <p className="text-sm text-gray-500">Tổng số tiền ({cartItems.length} sản phẩm): <span className="text-xl text-shopee font-medium ml-2">₫{(cartTotal + shippingFee - discountAmount).toLocaleString('vi-VN')}</span></p>
           </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-6 mb-3">
           <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <h3 className="text-lg font-medium text-gray-800">Phương thức thanh toán</h3>
              <div className="flex flex-wrap gap-2">
                 {['Ví ShopeePay', 'Apple Pay', 'Thẻ Tín dụng/Ghi nợ', 'Chuyển khoản Ngân hàng', 'Thanh toán khi nhận hàng'].map((method) => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method === 'Thanh toán khi nhận hàng' ? 'COD' : method === 'Chuyển khoản Ngân hàng' ? 'Bank Transfer' : method)}
                      className={`px-4 py-2 border rounded-sm text-sm transition-all ${
                        (paymentMethod === 'COD' && method === 'Thanh toán khi nhận hàng') || 
                        (paymentMethod === 'Bank Transfer' && method === 'Chuyển khoản Ngân hàng') ||
                        (paymentMethod === method)
                        ? 'border-shopee text-shopee relative after:content-[""] after:absolute after:bottom-0 after:right-0 after:border-[8px] after:border-shopee after:border-l-transparent after:border-t-transparent' 
                        : 'border-gray-200 text-gray-600 hover:border-shopee'
                      }`}
                    >
                       {method}
                    </button>
                 ))}
              </div>
           </div>

           {paymentMethod === 'Bank Transfer' && bankDetails && (
              <div className="mb-8 p-6 bg-[#fafdff] border border-blue-50 rounded-sm flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="w-40 h-40 bg-white shadow-sm border p-2">
                    <img src={qrCodeUrl} alt="VietQR" className="w-full h-full object-contain" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-800">Vui lòng quét mã QR để thanh toán</p>
                    <div className="text-sm text-gray-600">
                       <p>Ngân hàng: <span className="font-bold">{bankDetails.bankName}</span></p>
                       <p>Số tài khoản: <span className="font-bold text-blue-600">{bankDetails.accountNumber}</span></p>
                       <p>Chủ tài khoản: <span className="font-bold">{bankDetails.accountName}</span></p>
                       <p className="mt-4 text-xs text-shopee italic flex items-center gap-1"><Info className="w-3 h-3" /> Hệ thống sẽ tự động duyệt đơn khi nhận được tiền.</p>
                    </div>
                 </div>
              </div>
           )}

           <div className="bg-[#fffefb] border-t border-gray-100 flex flex-col items-end gap-3 pt-8">
              <div className="grid grid-cols-2 gap-x-20 gap-y-3 text-right">
                 <span className="text-sm text-gray-500">Tổng tiền hàng</span>
                 <span className="text-sm text-gray-700">₫{cartTotal.toLocaleString('vi-VN')}</span>
                 <span className="text-sm text-gray-500">Phí vận chuyển</span>
                 <span className="text-sm text-gray-700">₫{shippingFee.toLocaleString('vi-VN')}</span>
                 <span className="text-sm text-gray-500">Tổng cộng voucher giảm giá:</span>
                 <span className="text-sm text-gray-700">-₫{discountAmount.toLocaleString('vi-VN')}</span>
                 <span className="text-sm text-gray-500 mt-2">Tổng thanh toán:</span>
                 <span className="text-3xl text-shopee font-medium mt-2">₫{finalTotal.toLocaleString('vi-VN')}</span>
              </div>
           </div>
        </div>

        <div className="bg-white border-t border-gray-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] rounded-sm">
           <div className="text-xs text-gray-500 max-w-xl">
              Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo <Link to="/" className="text-blue-600">Điều khoản ThanhLuanShop</Link>
           </div>
           <button 
             onClick={handleSubmit}
             disabled={loading}
             className={`bg-shopee text-white px-20 py-3 rounded-sm font-medium hover:bg-shopee-hover transition shadow-sm uppercase text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
              {loading ? 'Đang đặt hàng...' : 'Đặt hàng'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
