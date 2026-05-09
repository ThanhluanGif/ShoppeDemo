import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Eye, DollarSign, AlertCircle, Search, ChevronDown, Download, HelpCircle, Mail, Phone } from 'lucide-react';
import { get, put } from '../services/api';
import OrderModal from '../components/OrderModal';
import toast from 'react-hot-toast';

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await get('/orders?isManagement=true');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleShip = async (id) => {
    if (window.confirm('Xác nhận bắt đầu giao đơn hàng này?')) {
      try {
        await put(`/orders/${id}/ship`);
        toast.success('Đã cập nhật trạng thái: Đang giao hàng');
        fetchOrders();
      } catch (error) {
        toast.error('Có lỗi xảy ra.');
      }
    }
  };

  const handleDeliver = async (id) => {
    if (window.confirm('Xác nhận đã giao đơn hàng thành công?')) {
      try {
        await put(`/orders/${id}/deliver`);
        toast.success('Đã hoàn thành đơn hàng!');
        fetchOrders();
      } catch (error) {
        toast.error('Có lỗi xảy ra.');
      }
    }
  };

  const handlePay = async (id) => {
    if (window.confirm('Xác nhận khách hàng đã thanh toán thành công?')) {
      try {
        await put(`/orders/${id}/pay`);
        toast.success('Xác nhận thanh toán thành công!');
        fetchOrders();
      } catch (error) {
        toast.error('Có lỗi xảy ra.');
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
     if (window.confirm(`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành ${status}?`)) {
        try {
           await put(`/orders/${id}/status`, { status });
           toast.success('Cập nhật trạng thái thành công!');
           fetchOrders();
           setIsModalOpen(false);
        } catch (error) {
           toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
     }
  };

  const openOrderDetails = (order) => {
     setSelectedOrder(order);
     setIsModalOpen(true);
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => !o.isPaid && o.paymentMethod === 'Bank Transfer').length },
    { id: 'to_ship', label: 'Chờ lấy hàng', count: orders.filter(o => (o.isPaid || o.paymentMethod === 'COD') && !o.isDelivered).length },
    { id: 'shipping', label: 'Đang giao', count: 0 },
    { id: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.isDelivered).length },
    { id: 'cancelled', label: 'Đã hủy', count: 0 },
    { id: 'return', label: 'Trả hàng/Hoàn tiền', count: 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border-b border-gray-100">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
           <p className="text-[13px] text-gray-500 mt-1">Xem và xử lý tất cả các đơn hàng từ khách hàng của bạn.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition">
              <Download className="w-4 h-4" /> Xuất dữ liệu
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setStatusTab(tab.id)}
               className={`px-6 py-3 text-sm whitespace-nowrap transition-all relative ${
                 statusTab === tab.id 
                  ? 'text-shopee font-medium after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-shopee' 
                  : 'text-gray-600 hover:text-shopee'
               }`}
             >
               {tab.label} {tab.count > 0 && `(${tab.count})`}
             </button>
           ))}
        </div>

        {/* Filter Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-600">Mã đơn hàng:</span>
              <div className="flex items-center border border-gray-200 rounded-sm px-3 py-2 bg-white focus-within:border-shopee transition">
                 <input 
                  type="text" 
                  placeholder="Nhập Mã đơn hàng" 
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Search className="w-4 h-4 text-gray-400" />
              </div>
           </div>
           
           <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
              <div className="flex items-center justify-between border border-gray-200 rounded-sm px-3 py-2 bg-white text-sm cursor-pointer hover:border-shopee">
                 <span className="text-gray-400">Tất cả</span>
                 <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
           </div>

           <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-600">Ngày đặt hàng:</span>
              <div className="flex items-center justify-between border border-gray-200 rounded-sm px-3 py-2 bg-white text-sm cursor-pointer hover:border-shopee">
                 <span className="text-gray-400">Chọn thời gian</span>
                 <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
           </div>
        </div>
        
        <div className="px-6 pb-6 flex gap-2">
           <button className="bg-shopee text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-shopee-hover">Tìm</button>
           <button className="bg-white border border-gray-200 text-gray-700 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50">Nhập lại</button>
        </div>
      </div>

      {/* Orders Table Area */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden min-h-[400px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fafafa]">
           <div className="flex items-center gap-4">
              <h2 className="text-base font-bold text-gray-800">{orders.length} Đơn hàng</h2>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Sản phẩm</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Tổng thanh toán</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Vận chuyển</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan="5" className="px-6 py-12 border-b border-gray-50"><div className="h-20 bg-gray-50 rounded-sm"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                         <Package className="w-16 h-16 mb-2" />
                         <p className="text-gray-500 font-bold">Không tìm thấy đơn hàng nào</p>
                      </div>
                   </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 align-top w-[40%]">
                      <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[13px] text-gray-800">@{order.user?.username || 'Guest'}</span>
                            <div className="h-3 border-l border-gray-300"></div>
                            <span className="text-[11px] text-gray-400 uppercase tracking-tighter">MÃ ĐƠN: {order._id.slice(-8).toUpperCase()}</span>
                         </div>
                         {order.orderItems?.slice(0, 1).map((item, idx) => (
                           <div key={idx} className="flex gap-3">
                              <img src={item.image} alt={item.name} className="w-14 h-14 object-cover border border-gray-100 rounded-sm shrink-0" />
                              <div className="flex flex-col gap-0.5">
                                 <p className="text-[13px] text-gray-800 line-clamp-1 font-medium">{item.name}</p>
                                 <p className="text-xs text-gray-400">Phân loại: {item.selectedVariation ? (item.selectedVariation.size || item.selectedVariation.color) : 'Mặc định'}</p>
                                 <p className="text-xs text-gray-400">Số lượng: x{item.quantity}</p>
                              </div>
                           </div>
                         ))}
                         {order.orderItems?.length > 1 && (
                           <p className="text-[11px] text-blue-600 font-medium">Xem thêm {order.orderItems.length - 1} sản phẩm khác...</p>
                         )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 align-top">
                       <p className="text-[13px] text-gray-800 font-bold">₫{order.totalPrice.toLocaleString('vi-VN')}</p>
                       <p className="text-[11px] text-gray-400 mt-1">{order.paymentMethod}</p>
                       {!order.isPaid && (
                         <span className="text-[10px] bg-red-50 text-red-500 px-1 font-medium rounded-sm border border-red-100">Chưa thanh toán</span>
                       )}
                       {order.isPaid && (
                         <span className="text-[10px] bg-green-50 text-green-600 px-1 font-medium rounded-sm border border-green-100">Đã thanh toán</span>
                       )}
                    </td>

                    <td className="px-6 py-4 align-top">
                       <div className="flex flex-col gap-1.5">
                          {order.isDelivered ? (
                            <span className="text-[13px] text-green-600 font-bold">Đã hoàn thành</span>
                          ) : (
                            <span className="text-[13px] text-blue-600 font-bold">Chờ giao hàng</span>
                          )}
                          <p className="text-[11px] text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                       </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                       <div className="flex flex-col gap-1 text-[11px] text-gray-500">
                          <p className="font-medium text-gray-800">{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}</p>
                          <p className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {order.shippingAddress.phoneNumber}</p>
                       </div>
                    </td>

                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex flex-col gap-2 items-end">
                        {!order.isPaid && order.paymentMethod === 'Bank Transfer' && order.status === 'Pending' && (
                          <button 
                            onClick={() => handlePay(order._id)}
                            className="bg-shopee text-white px-4 py-1.5 rounded-sm text-xs font-medium hover:bg-shopee-hover transition w-full"
                          >
                            Xác nhận tiền
                          </button>
                        )}
                        {order.status === 'Pending' && (order.isPaid || order.paymentMethod === 'COD') && (
                           <button 
                            onClick={() => handleUpdateStatus(order._id, 'Processing')}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-sm text-xs font-medium hover:bg-blue-700 transition w-full"
                          >
                            Xác nhận đơn
                          </button>
                        )}
                        {order.status === 'Processing' && (
                          <button 
                            onClick={() => handleShip(order._id)}
                            className="bg-white border border-blue-600 text-blue-600 px-4 py-1.5 rounded-sm text-xs font-medium hover:bg-blue-50 transition w-full"
                          >
                            Giao hàng
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button 
                            onClick={() => handleDeliver(order._id)}
                            className="bg-white border border-shopee text-shopee px-4 py-1.5 rounded-sm text-xs font-medium hover:bg-[#ff572205] transition w-full"
                          >
                            Hoàn thành
                          </button>
                        )}
                        <button 
                          onClick={() => openOrderDetails(order)}
                          className="text-xs text-blue-600 hover:font-bold transition-all mt-1"
                        >
                          Chi tiết đơn hàng
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default AdminOrderPage;
