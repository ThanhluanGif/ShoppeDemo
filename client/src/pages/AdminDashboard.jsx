import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, DollarSign, ArrowUpRight, TrendingUp, ChevronRight, HelpCircle, Bell, MessageSquare, Star, Clock } from 'lucide-react';
import { get } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    outOfStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes, statsRes] = await Promise.all([
          get('/products'),
          get('/orders'),
          get('/users'),
          get('/orders/stats')
        ]);

        const products = productsRes.data;
        const orders = ordersRes.data;

        setStats({
          totalProducts: products.length,
          totalOrders: statsRes.data.totalOrders,
          totalRevenue: statsRes.data.totalRevenue,
          totalUsers: usersRes.data.length,
          pendingOrders: orders.filter(o => !o.isDelivered).length,
          outOfStock: products.filter(p => p.countInStock <= 0).length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const toDoList = [
    { label: 'Chờ Xác Nhận', count: 0, color: 'text-blue-600' },
    { label: 'Chờ Lấy Hàng', count: stats.pendingOrders, color: 'text-blue-600' },
    { label: 'Đã Xử Lý', count: 0, color: 'text-blue-600' },
    { label: 'Đơn Hủy', count: 0, color: 'text-blue-600' },
    { label: 'Trả Hàng/Hoàn Tiền Chờ Xử Lý', count: 0, color: 'text-blue-600' },
    { label: 'Sản Phẩm Bị Khóa', count: 0, color: 'text-blue-600' },
    { label: 'Sản Phẩm Hết Hàng', count: stats.outOfStock, color: 'text-blue-600' },
    { label: 'Chương Trình Khuyến Mãi Chờ Xử Lý', count: 0, color: 'text-blue-600' },
  ];

  if (loading) return <div className="p-8 text-center text-shopee font-bold">Đang tải dữ liệu Kênh Người Bán...</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
               <img src="https://ui-avatars.com/api/?name=Admin&background=ee4d2d&color=fff" alt="Admin" />
            </div>
            <div>
               <h1 className="text-xl font-bold text-gray-800">Chào mừng bạn trở lại, admin_shop!</h1>
               <p className="text-[13px] text-gray-500 mt-1">Xem những gì đang xảy ra với shop của bạn hôm nay.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="text-center px-6 border-r border-gray-100">
               <p className="text-[13px] text-gray-500">Đánh giá Shop</p>
               <p className="text-lg font-bold text-shopee">4.9/5.0</p>
            </div>
            <div className="text-center px-6">
               <p className="text-[13px] text-gray-500">Tỉ lệ phản hồi</p>
               <p className="text-lg font-bold text-shopee">98%</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: To Do List & Sales */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Danh sách cần làm */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-800">Danh sách cần làm</h3>
                <p className="text-[13px] text-gray-400">Những việc bạn cần phải xử lý</p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
                {toDoList.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center border-r last:border-r-0 border-gray-50 hover:bg-gray-50 cursor-pointer py-2 transition">
                     <span className={`text-xl font-bold ${item.color}`}>{item.count}</span>
                     <span className="text-[13px] text-gray-600 mt-1 text-center px-2">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Phân tích bán hàng */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <h3 className="text-base font-bold text-gray-800">Phân tích bán hàng</h3>
                   <span className="text-xs text-gray-400">Hôm nay 00:00 GMT+7 09:00</span>
                </div>
                <Link to="/admin/analytics" className="text-shopee text-sm font-medium flex items-center">Xem thêm <ChevronRight className="w-4 h-4" /></Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#fafafa] p-4 rounded-sm border border-gray-100">
                   <p className="text-[13px] text-gray-500 flex items-center gap-1">Doanh thu <HelpCircle className="w-3 h-3" /></p>
                   <p className="text-2xl font-bold text-gray-800 mt-1">₫{stats.totalRevenue.toLocaleString('vi-VN')}</p>
                   <p className="text-[11px] text-gray-400 mt-2">với hôm qua --</p>
                </div>
                <div className="bg-[#fafafa] p-4 rounded-sm border border-gray-100">
                   <p className="text-[13px] text-gray-500 flex items-center gap-1">Lượt truy cập <HelpCircle className="w-3 h-3" /></p>
                   <p className="text-2xl font-bold text-gray-800 mt-1">1,245</p>
                   <p className="text-[11px] text-green-500 mt-2 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> 12.5%</p>
                </div>
                <div className="bg-[#fafafa] p-4 rounded-sm border border-gray-100">
                   <p className="text-[13px] text-gray-500 flex items-center gap-1">Đơn hàng <HelpCircle className="w-3 h-3" /></p>
                   <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
                   <p className="text-[11px] text-gray-400 mt-2">với hôm qua --</p>
                </div>
             </div>
             
             {/* Simple Chart */}
             <div className="h-60 flex items-end justify-between px-4 gap-2 pt-4">
                {[30, 45, 25, 60, 80, 55, 90, 40, 75, 50, 65, 85].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                     <div className="w-full bg-gray-100 rounded-t-sm relative transition-all group-hover:bg-shopee cursor-pointer" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                           {h}tr
                        </div>
                     </div>
                     <span className="text-[10px] text-gray-400">T{i+1}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: News & Performance */}
        <div className="space-y-6">
           {/* Thông báo từ Shopee */}
           <div className="bg-white p-6 rounded-sm shadow-sm">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-base font-bold text-gray-800">Thông báo</h3>
                 <Link to="/" className="text-shopee text-xs font-medium">Xem thêm</Link>
              </div>
              <div className="space-y-4">
                 <div className="flex gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                       <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                       <p className="text-[13px] text-gray-800 font-medium group-hover:text-shopee line-clamp-1">Khách hàng @customer01 vừa nhắn tin</p>
                       <p className="text-[11px] text-gray-400 mt-0.5">2 phút trước</p>
                    </div>
                 </div>
                 <div className="flex gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                       <Star className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                       <p className="text-[13px] text-gray-800 font-medium group-hover:text-shopee line-clamp-1">Sản phẩm "iPhone 15 Pro..." có đánh giá mới</p>
                       <p className="text-[11px] text-gray-400 mt-0.5">1 giờ trước</p>
                    </div>
                 </div>
                 <div className="flex gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                       <Clock className="w-4 h-4 text-shopee" />
                    </div>
                    <div>
                       <p className="text-[13px] text-gray-800 font-medium group-hover:text-shopee line-clamp-1">Chuẩn bị kết thúc Flash Sale hôm nay</p>
                       <p className="text-[11px] text-gray-400 mt-0.5">3 giờ trước</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Hiệu quả hoạt động */}
           <div className="bg-white p-6 rounded-sm shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Hiệu quả hoạt động</h3>
              <div className="space-y-5">
                 <div>
                    <div className="flex justify-between text-[13px] mb-2">
                       <span className="text-gray-500">Tỉ lệ đơn không thành công</span>
                       <span className="text-gray-800 font-medium">0%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[0%]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[13px] mb-2">
                       <span className="text-gray-500">Thời gian chuẩn bị hàng</span>
                       <span className="text-gray-800 font-medium">0.45 ngày</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[95%]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[13px] mb-2">
                       <span className="text-gray-500">Tỉ lệ phản hồi chat</span>
                       <span className="text-gray-800 font-medium">98.5%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[98%]"></div>
                    </div>
                 </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-6 text-center italic">Shop của bạn đang hoạt động rất tốt!</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
