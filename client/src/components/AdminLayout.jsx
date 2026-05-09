import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Store, 
  List, 
  ChevronRight, 
  Bell, 
  HelpCircle, 
  Search,
  Truck,
  Ticket,
  BarChart2,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: 'Quản Lý Đơn Hàng',
      items: [
        { title: 'Tất cả', path: '/admin/orders', icon: ShoppingBag },
        { title: 'Giao hàng', path: '/admin/shipping', icon: Truck },
      ]
    },
    {
      title: 'Chăm sóc khách hàng',
      items: [
        { title: 'Chat với khách', path: '/admin/chat', icon: MessageSquare },
      ]
    },
    {
      title: 'Quản Lý Sản Phẩm',
      items: [
        { title: 'Tất cả sản phẩm', path: '/admin/products', icon: Package },
        { title: 'Thêm sản phẩm', path: '/admin/products/new', icon: Package },
        { title: 'Danh mục', path: '/admin/categories', icon: List, role: 'admin' },
      ]
    },
    {
      title: 'Kênh Marketing',
      items: [
        { title: 'Chương trình của Shop', path: '/admin/marketing', icon: Ticket },
        { title: 'Mã giảm giá của Shop', path: '/admin/coupons', icon: Ticket },
      ]
    },
    {
      title: 'Hệ Thống',
      role: 'admin',
      items: [
        { title: 'Quản lý Người dùng', path: '/admin/users', icon: Users },
        { title: 'Cấu hình Hệ thống', path: '/admin/config', icon: Settings },
      ]
    },
    {
      title: 'Tài Chính',
      items: [
        { title: 'Doanh thu', path: '/admin/revenue', icon: BarChart2 },
        { title: 'Số dư tài khoản', path: '/admin/wallet', icon: BarChart2 },
      ]
    },
    {
      title: 'Dữ Liệu',
      items: [
        { title: 'Phân tích bán hàng', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Quản Lý Shop',
      items: [
        { title: 'Hồ sơ Shop', path: '/admin/profile', icon: Store },
        { title: 'Thiết lập Shop', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const filteredMenuGroups = menuGroups.filter(group => !group.role || group.role === user?.role)
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.role || item.role === user?.role)
    }));

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="text-shopee">
                <Store className="w-8 h-8" />
             </div>
             <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-gray-800 leading-none">
                   {user?.role === 'admin' ? 'SYSTEM' : (user?.shopName?.split(' ')[0] || 'MY')}<span className="text-shopee font-medium italic">{user?.role === 'admin' ? 'ADMIN' : 'SHOP'}</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Kênh Người Bán</span>
             </div>
          </Link>
          <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-sm w-80">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm tính năng..." className="bg-transparent text-sm border-none outline-none ml-2 w-full" />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-gray-500 hover:text-shopee transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-shopee text-white text-[10px] px-1 rounded-full border border-white">2</span>
          </button>
          <button className="text-gray-500 hover:text-shopee transition">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="h-6 border-l border-gray-200"></div>
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/admin/profile')}>
             <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border">
                <img src={user?.shopLogo || `https://ui-avatars.com/api/?name=${user?.username}&background=ee4d2d&color=fff`} alt="Admin" />
             </div>
             <span className="text-sm font-medium text-gray-700 group-hover:text-shopee transition">{user?.shopName || user?.username}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block custom-scrollbar">
          <nav className="py-4">
            {filteredMenuGroups.map((group, idx) => (
              <div key={idx} className="mb-2">
                <div className="px-6 py-2 text-[13px] font-bold text-gray-800 flex items-center justify-between">
                   {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-all ${
                        location.pathname === item.path
                          ? 'text-shopee font-medium bg-red-50/50 border-r-4 border-shopee'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${location.pathname === item.path ? 'text-shopee' : 'text-gray-400'}`} />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-100 mt-4">
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:text-shopee transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Xem Cửa Hàng
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-sm transition font-medium mt-1"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-[#f6f6f6]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

