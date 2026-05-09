import React, { useState, useEffect, useContext } from 'react';
import { Package, ChevronRight, Search, Clock, CheckCircle, XCircle, Truck, ArrowLeft } from 'lucide-react';
import { get, put } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import OrderModal from '../components/OrderModal';
import toast from 'react-hot-toast';

const MyOrdersPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('status') || 'all';
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get('status') || 'all';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ status: tabId });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching my orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Pending', label: 'Chờ xác nhận' },
    { id: 'Processing', label: 'Chờ lấy hàng' },
    { id: 'Shipped', label: 'Đang giao' },
    { id: 'Delivered', label: 'Đã giao' },
    { id: 'Cancelled', label: 'Đã hủy' },
  ];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const handleCancelOrder = async (id) => {
    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      try {
        await put(`/orders/${id}/status`, { status: 'Cancelled' });
        toast.success('Đã hủy đơn hàng thành công');
        fetchOrders();
        setIsModalOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
      }
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-20 text-center text-shopee font-bold animate-pulse">Đang tải đơn hàng...</div>;

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:text-shopee transition">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-sm shadow-sm flex overflow-x-auto sticky top-16 z-10 border-b border-gray-100 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[100px] py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id ? 'text-shopee after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-shopee' : 'text-gray-600 hover:text-shopee'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-sm shadow-sm">
               <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-500">Chưa có đơn hàng nào</p>
               <Link to="/" className="mt-4 inline-block bg-shopee text-white px-8 py-2 rounded-sm font-medium">Mua sắm ngay</Link>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id} className="bg-white shadow-sm rounded-sm overflow-hidden border border-transparent hover:border-shopee/30 transition">
                 {/* Header Shop Info */}
                 <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="bg-shopee text-white text-[10px] px-1 font-bold rounded-sm uppercase">Yêu thích</span>
                       <span className="font-bold text-sm text-gray-800">ThanhLuanShop</span>
                    </div>
                    <div className="flex items-center gap-2 text-shopee uppercase text-xs font-bold">
                       {order.status === 'Pending' && <><Clock className="w-4 h-4" /> Chờ xác nhận</>}
                       {order.status === 'Processing' && <><Package className="w-4 h-4" /> Đang chuẩn bị</>}
                       {order.status === 'Shipped' && <><Truck className="w-4 h-4" /> Đang giao hàng</>}
                       {order.status === 'Delivered' && <><CheckCircle className="w-4 h-4" /> Hoàn thành</>}
                       {order.status === 'Cancelled' && <><XCircle className="w-4 h-4 text-gray-400" /> <span className="text-gray-400">Đã hủy</span></>}
                    </div>
                 </div>

                 {/* Products */}
                 <div className="p-4 cursor-pointer" onClick={() => openDetails(order)}>
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3 border-b border-gray-50 last:border-none">
                         <img src={item.image} alt="" className="w-20 h-20 object-cover border border-gray-100 shrink-0" />
                         <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">Phân loại: {item.selectedVariation ? (item.selectedVariation.size || item.selectedVariation.color) : 'Mặc định'}</p>
                            <p className="text-xs text-gray-800 mt-1">x{item.quantity}</p>
                         </div>
                         <div className="text-right">
                            <span className="text-shopee text-sm">₫{item.price.toLocaleString('vi-VN')}</span>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Footer Total */}
                 <div className="p-4 bg-[#fffefb] border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-xs text-gray-400">
                       Mã đơn: {order._id.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-4 justify-end">
                       <div className="text-right">
                          <span className="text-sm text-gray-600">Thành tiền: </span>
                          <span className="text-xl text-shopee font-medium">₫{order.totalPrice.toLocaleString('vi-VN')}</span>
                       </div>
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="p-4 border-t border-gray-50 flex justify-end gap-3">
                    {order.status === 'Pending' && (
                       <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-8 py-2 border border-gray-200 text-sm font-medium rounded-sm hover:bg-gray-50 transition"
                       >
                          Hủy đơn hàng
                       </button>
                    )}
                    <button 
                      onClick={() => openDetails(order)}
                      className="px-8 py-2 bg-shopee text-white text-sm font-medium rounded-sm hover:bg-shopee-hover transition shadow-sm"
                    >
                       Xem chi tiết
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder}
        onUpdateStatus={(id, status) => status === 'Cancelled' ? handleCancelOrder(id) : null}
      />
    </div>
  );
};

export default MyOrdersPage;
