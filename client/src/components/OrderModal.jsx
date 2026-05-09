import React from 'react';
import { X, Package, Truck, CreditCard, User, MapPin, Calendar, Clock } from 'lucide-react';

const OrderModal = ({ order, isOpen, onClose, onUpdateStatus }) => {
  if (!isOpen || !order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-100';
      case 'Processing': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-shopee" />
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Chi tiết đơn hàng #{order._id.slice(-8).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status & Date */}
          <div className="flex flex-col md:flex-row justify-between gap-4 bg-[#fafdff] p-4 border border-blue-50">
             <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Trạng thái đơn hàng</p>
                <div className="flex items-center gap-2">
                   <span className={`px-3 py-1 rounded-sm text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status === 'Pending' ? 'Chờ xác nhận' : 
                       order.status === 'Processing' ? 'Đang xử lý' : 
                       order.status === 'Shipped' ? 'Đang giao hàng' : 
                       order.status === 'Delivered' ? 'Đã giao hàng' : 'Đã hủy'}
                   </span>
                   {order.isPaid && (
                      <span className="px-3 py-1 rounded-sm text-xs font-bold bg-green-500 text-white border border-green-600">
                        ĐÃ THANH TOÁN
                      </span>
                   )}
                </div>
             </div>
             <div className="space-y-1 md:text-right">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ngày đặt hàng</p>
                <p className="text-sm text-gray-800 font-medium flex items-center md:justify-end gap-1">
                   <Calendar className="w-4 h-4" /> {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
             </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-l-4 border-shopee pl-3 uppercase">Thông tin khách hàng</h3>
                <div className="space-y-2 text-sm">
                   <p className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4" /> {order.user?.username || 'Khách vãng lai'}</p>
                   <p className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                   <p className="flex items-center gap-2 text-gray-600"><CreditCard className="w-4 h-4" /> Hình thức: {order.paymentMethod}</p>
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-l-4 border-blue-500 pl-3 uppercase">Thông tin vận chuyển</h3>
                <div className="space-y-2 text-sm">
                   <p className="flex items-center gap-2 text-gray-600"><Truck className="w-4 h-4" /> Giao hàng nhanh</p>
                   <p className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4" /> Dự kiến: 3-5 ngày làm việc</p>
                   {order.note && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-sm italic text-xs text-gray-600">
                         Ghi chú: {order.note}
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
             <div className="flex items-center justify-between border-l-4 border-teal-500 pl-3">
                <h3 className="text-sm font-bold text-gray-800 uppercase">Danh sách sản phẩm</h3>
                {order.vendor && (
                   <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border">
                      <img src={order.vendor.shopLogo || `https://ui-avatars.com/api/?name=${order.vendor.shopName}&background=ee4d2d&color=fff`} className="w-5 h-5 rounded-full object-cover" alt="Shop" />
                      <span className="text-xs font-bold text-gray-700">{order.vendor.shopName}</span>
                   </div>
                )}
             </div>
             <div className="border rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 border-b">
                      <tr>
                         <th className="px-4 py-2 font-bold text-gray-700">Sản phẩm</th>
                         <th className="px-4 py-2 font-bold text-gray-700 text-center">Số lượng</th>
                         <th className="px-4 py-2 font-bold text-gray-700 text-right">Giá</th>
                         <th className="px-4 py-2 font-bold text-gray-700 text-right">Thành tiền</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {order.orderItems.map((item, idx) => (
                        <tr key={idx}>
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                 <img src={item.image} alt={item.name} className="w-10 h-10 object-cover border" />
                                 <div>
                                    <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                    <p className="text-[10px] text-gray-400">ID: {item.product}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-3 text-center">x{item.quantity}</td>
                           <td className="px-4 py-3 text-right">₫{item.price.toLocaleString('vi-VN')}</td>
                           <td className="px-4 py-3 text-right font-bold text-gray-800">₫{(item.price * item.quantity).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end pt-4">
             <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Tiền hàng:</span>
                   <span className="text-gray-800">₫{(order.totalPrice - order.shippingPrice + order.discountPrice).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Phí vận chuyển:</span>
                   <span className="text-gray-800">₫{order.shippingPrice.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-sm text-red-500">
                   <span>Giảm giá:</span>
                   <span>-₫{order.discountPrice.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                   <span className="font-bold text-gray-800">Tổng cộng:</span>
                   <span className="font-bold text-xl text-shopee">₫{order.totalPrice.toLocaleString('vi-VN')}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 border rounded-sm text-sm font-medium hover:bg-white transition"
          >
            Đóng
          </button>
          {onUpdateStatus && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
             <button 
               onClick={() => onUpdateStatus(order._id, 'Cancelled')}
               className="px-6 py-2 bg-white border border-red-500 text-red-500 rounded-sm text-sm font-medium hover:bg-red-50 transition"
             >
               Hủy đơn
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
