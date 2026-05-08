import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Store, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-shopee sticky top-0 z-50">
      {/* Top Header */}
      <div className="hidden md:flex justify-between items-center px-4 sm:px-6 lg:px-8 py-1.5 text-white/90 text-xs max-w-7xl mx-auto">
        <div className="flex gap-3">
          {user?.role === 'admin' ? (
            <Link to="/admin/dashboard" className="hover:text-white transition">Kênh Người Bán</Link>
          ) : (
            <Link to="/" className="hover:text-white transition">Kênh Người Bán</Link>
          )}
          <span className="border-r border-white/40"></span>
          <Link to="/" className="hover:text-white transition">Tải ứng dụng</Link>
          <span className="border-r border-white/40"></span>
          <div className="flex items-center gap-2">Kết nối <span className="font-bold">Facebook</span></div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-white transition flex items-center gap-1">Thông báo</Link>
          <Link to="/" className="hover:text-white transition flex items-center gap-1">Hỗ trợ</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
        <div className="flex justify-between items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="text-white">
              <Store className="w-10 h-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-white leading-none">
                thanhluan<span className="text-white/90 font-medium italic">shop</span>
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 flex flex-col max-w-3xl relative">
            <form onSubmit={handleSearch} className="flex bg-white rounded-sm p-1 shadow-sm">
              <input
                type="text"
                placeholder="Tìm kiếm công nghệ, điện thoại, laptop..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 px-3 outline-none text-sm text-gray-700"
              />
              <button type="submit" className="bg-shopee hover:bg-shopee-hover text-white px-6 py-2 rounded-sm transition flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </form>
            <div className="flex gap-3 text-white/90 text-[12px] mt-2 px-1">
              <Link to="/?keyword=iphone" className="hover:text-white">iPhone 15 Pro</Link>
              <Link to="/?keyword=macbook" className="hover:text-white">MacBook M3</Link>
              <Link to="/?keyword=samsung" className="hover:text-white">Galaxy S24</Link>
              <Link to="/?keyword=airpods" className="hover:text-white">AirPods Pro</Link>
            </div>
          </div>

          {/* Right Icons & Auth */}
          <div className="flex items-center gap-8 flex-shrink-0 text-white pb-4">
            <Link to="/cart" className="relative p-2 hover:opacity-80 transition group">
              <ShoppingCart className="w-7 h-7" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-white text-shopee text-[12px] font-bold px-1.5 py-0.5 rounded-full border-2 border-shopee leading-none min-w-[20px] text-center transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="hover:opacity-80 transition flex items-center gap-1 text-sm font-medium" title="Dashboard">
                    <LayoutDashboard className="w-5 h-5" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 group relative cursor-pointer py-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium hover:text-white/80">{user.username}</span>
                  
                  {/* Dropdown */}
                  <div className="absolute top-full right-0 mt-0 w-40 bg-white rounded-sm shadow-md py-2 hidden group-hover:block text-gray-800 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-shopee">Tài khoản của tôi</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-shopee">Đơn mua</Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:text-shopee"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Link to="/register" className="hover:text-white/80 transition">Đăng ký</Link>
                <span className="border-r border-white/40 h-4"></span>
                <Link to="/login" className="hover:text-white/80 transition">Đăng nhập</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
