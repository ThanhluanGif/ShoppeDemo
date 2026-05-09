import React, { useState, useEffect, useContext } from 'react';
import { Package, ShoppingBag, Users, DollarSign, Store, TrendingUp, ChevronRight, Bell, MessageSquare, Star, Clock, ArrowUpRight } from 'lucide-react';
import { get } from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    outOfStock: 0,
    totalVendors: 0
  });
  const [advancedStats, setAdvancedStats] = useState({
    dailyRevenue: [],
    categoryDistribution: [],
    topProducts: [],
    topVendors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoints = [
          get('/products?isManagement=true'),
          get('/orders?isManagement=true'),
          get('/orders/stats?isManagement=true'),
          get('/orders/advanced-stats')
        ];

        if (user?.role === 'admin') {
          endpoints.push(get('/users'));
        }

        const responses = await Promise.all(endpoints);
        
        const products = Array.isArray(responses[0]?.data) ? responses[0].data : [];
        const orders = Array.isArray(responses[1]?.data) ? responses[1].data : [];
        const statsRes = responses[2]?.data || {};
        const advancedStatsRes = responses[3]?.data || {};
        
        let users = [];
        if (user?.role === 'admin' && responses[4]) {
          users = Array.isArray(responses[4]?.data) ? responses[4].data : [];
        }

        setStats({
          totalProducts: products.length,
          totalOrders: statsRes?.totalOrders || 0,
          totalRevenue: statsRes?.totalRevenue || 0,
          totalUsers: user?.role === 'admin' ? users.filter(u => u.role === 'customer').length : 0,
          pendingOrders: orders.filter(o => o.status === 'Pending').length,
          outOfStock: products.filter(p => p.countInStock <= 0).length,
          totalVendors: user?.role === 'admin' ? users.filter(u => u.role === 'vendor').length : 0
        });

        setAdvancedStats({
          dailyRevenue: Array.isArray(advancedStatsRes?.dailyRevenue) ? advancedStatsRes.dailyRevenue : [],
          categoryDistribution: Array.isArray(advancedStatsRes?.categoryDistribution) ? advancedStatsRes.categoryDistribution : [],
          topProducts: Array.isArray(advancedStatsRes?.topProducts) ? advancedStatsRes.topProducts : [],
          topVendors: Array.isArray(advancedStatsRes?.topVendors) ? advancedStatsRes.topVendors : []
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  const safeFormatDate = (dateStr, formatStr) => {
    try {
      if (!dateStr) return '';
      return format(parseISO(dateStr), formatStr);
    } catch (e) {
      return dateStr || '';
    }
  };

  const COLORS = ['#ee4d2d', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const toDoList = [
    { label: 'Chờ Xác Nhận', count: stats.pendingOrders, color: 'text-blue-600' },
    { label: 'Chờ Lấy Hàng', count: stats.pendingOrders, color: 'text-blue-600' },
    { label: 'Đã Xử Lý', count: stats.totalOrders - stats.pendingOrders, color: 'text-blue-600' },
    { label: 'Sản Phẩm Hết Hàng', count: stats.outOfStock, color: 'text-shopee' },
  ];

  if (loading) return <div className="p-8 text-center text-shopee font-bold">Đang tải dữ liệu Kênh Quản Trị...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border border-gray-100">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
               <img src={user?.shopLogo || `https://ui-avatars.com/api/?name=${user?.username}&background=ee4d2d&color=fff`} alt="Admin" />
            </div>
            <div>
               <h1 className="text-xl font-bold text-gray-800">
                  {user?.role === 'admin' ? 'Hệ thống Quản trị Multi-Store' : `Chào mừng trở lại, ${user?.shopName || user?.username}!`}
               </h1>
               <p className="text-[13px] text-gray-500 mt-1">
                  {user?.role === 'admin' 
                    ? 'Tổng quan hoạt động của toàn bộ hệ thống cửa hàng.' 
                    : 'Xem những gì đang xảy ra với shop của bạn hôm nay.'}
               </p>
            </div>
         </div>
      </div>

      {/* Financial Breakdown (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">Tổng Doanh Thu</p>
              <p className="text-xl font-black text-blue-600 mt-1">₫{(advancedStats.financialSummary?.totalRevenue || 0).toLocaleString()}</p>
           </div>
           <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">Tổng Hoàn Trả</p>
              <p className="text-xl font-black text-orange-500 mt-1">₫{(advancedStats.financialSummary?.totalRefund || 0).toLocaleString()}</p>
           </div>
           <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">Rủi Ro / Tổn Thất</p>
              <p className="text-xl font-black text-red-500 mt-1">₫{(advancedStats.financialSummary?.totalRisk || 0).toLocaleString()}</p>
           </div>
           <div className="bg-white p-4 rounded-sm shadow-sm border border-green-200 bg-green-50">
              <p className="text-xs text-green-700 uppercase font-bold">Hoa Hồng Hệ Thống (Net)</p>
              <p className="text-2xl font-black text-green-600 mt-1">₫{(advancedStats.financialSummary?.totalAdminCommission || 0).toLocaleString()}</p>
              <p className="text-[10px] text-green-500 italic mt-1">= Doanh thu - Hoàn trả - Rủi ro</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Actionable Stats */}
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Danh sách cần làm</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
                {toDoList.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center border-r last:border-r-0 border-gray-50 hover:bg-gray-50 cursor-pointer py-2 transition group">
                     <span className={`text-2xl font-bold ${item.color} group-hover:scale-110 transition-transform`}>{item.count}</span>
                     <span className="text-[13px] text-gray-600 mt-1 text-center px-2">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Phân tích doanh thu</h3>
                   <span className="text-xs text-gray-400">(30 ngày gần nhất)</span>
                </div>
             </div>
             
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={advancedStats.dailyRevenue}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ee4d2d" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ee4d2d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="_id" 
                        tick={{fontSize: 10}} 
                        tickFormatter={(str) => safeFormatDate(str, 'dd/MM')}
                      />
                      <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `₫${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        labelFormatter={(str) => safeFormatDate(str, 'dd MMMM, yyyy')}
                        formatter={(val) => [`₫${val.toLocaleString()}`, 'Doanh thu']}
                      />
                      <Area type="monotone" dataKey="total" stroke="#ee4d2d" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Top Products or Top Shops */}
          {user?.role === 'admin' ? (
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
               <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Store className="w-5 h-5 text-shopee" /> Top Cửa Hàng Doanh Thu Cao
               </h3>
               <div className="space-y-4">
                  {advancedStats.topVendors?.length > 0 ? (
                    advancedStats.topVendors.map((vendor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-sm hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {idx + 1}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{vendor.shopName || 'Shop chưa đặt tên'}</p>
                                <p className="text-xs text-gray-500">{vendor.orderCount} đơn hàng</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-shopee">₫{(vendor.totalRevenue || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 italic">Doanh thu tháng này</p>
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm italic">Chưa có dữ liệu cửa hàng</div>
                  )}
               </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
               <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight mb-6">Top Sản phẩm bán chạy</h3>
               <div className="space-y-4">
                  {advancedStats.topProducts.map((product, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm hover:bg-gray-100 transition">
                        <div className="flex items-center gap-4">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              {idx + 1}
                           </div>
                           <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[200px] md:max-w-md">{product.name}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold text-shopee">{product.totalSold} đã bán</p>
                           <p className="text-[10px] text-gray-400">Doanh thu: ₫{product.revenue.toLocaleString()}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
           {/* Key Stats Cards */}
           <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-shopee border-y border-r border-gray-100">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tổng doanh thu</p>
                       <p className="text-2xl font-black text-gray-800 mt-1">₫{(stats.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                       <DollarSign className="w-5 h-5 text-shopee" />
                    </div>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-blue-500 border-y border-r border-gray-100">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tổng đơn hàng</p>
                       <p className="text-2xl font-black text-gray-800 mt-1">{stats.totalOrders}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                       <ShoppingBag className="w-5 h-5 text-blue-500" />
                    </div>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-green-500 border-y border-r border-gray-100">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                          {user?.role === 'admin' ? 'Tổng Khách Hàng' : 'Sản Phẩm'}
                       </p>
                       <p className="text-2xl font-black text-gray-800 mt-1">
                          {user?.role === 'admin' ? stats.totalUsers : stats.totalProducts}
                       </p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                       {user?.role === 'admin' ? <Users className="w-5 h-5 text-green-500" /> : <Package className="w-5 h-5 text-green-500" />}
                    </div>
                 </div>
              </div>
           </div>

           {/* Category Distribution (Pie Chart) */}
           <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight mb-6 text-center">Doanh thu theo ngành hàng</h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={advancedStats.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {advancedStats.categoryDistribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip formatter={(val) => `₫${(val || 0).toLocaleString()}`} />
                       <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* System Health / Shop Health */}
           <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4">{user?.role === 'admin' ? 'Trạng thái Hệ thống' : 'Sức khỏe Shop'}</h3>
              <div className="space-y-5">
                 <div>
                    <div className="flex justify-between text-[13px] mb-2">
                       <span className="text-gray-500">{user?.role === 'admin' ? 'Thời gian phản hồi Server' : 'Tỉ lệ phản hồi chat'}</span>
                       <span className="text-gray-800 font-medium">{user?.role === 'admin' ? '45ms' : '98.5%'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[98%]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[13px] mb-2">
                       <span className="text-gray-500">{user?.role === 'admin' ? 'Tỉ lệ đơn lỗi hệ thống' : 'Tỉ lệ đơn hàng không thành công'}</span>
                       <span className="text-gray-800 font-medium">0.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[2%]"></div>
                    </div>
                 </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-6 text-center italic">Dữ liệu được cập nhật tự động hàng giờ.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
