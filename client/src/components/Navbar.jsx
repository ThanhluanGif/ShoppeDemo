import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Store, Search, ChevronDown } from 'lucide-react';
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
    <nav className="bg-gradient-to-r from-[#121212] via-[#1a1a1a] to-[#121212] sticky top-0 z-50 shadow-xl border-b border-white/5">
      {/* Top Header */}
      <div className="hidden md:flex justify-between items-center px-4 sm:px-6 lg:px-8 py-1.5 text-white/60 text-[11px] max-w-7xl mx-auto border-b border-white/5">
        <div className="flex gap-4">
          {user?.role === 'admin' ? (
            <Link to="/admin/dashboard" className="hover:text-shopee transition-colors">Kênh Người Bán</Link>
          ) : (
            <Link to="/" className="hover:text-shopee transition-colors">Trở thành Người bán Shopee</Link>
          )}
          <span className="w-[1px] h-3 bg-white/10"></span>
          <Link to="/" className="hover:text-shopee transition-colors">Tải ứng dụng</Link>
          <span className="w-[1px] h-3 bg-white/10"></span>
          <div className="flex items-center gap-2">Kết nối <span className="text-white hover:text-blue-400 transition-colors cursor-pointer">Facebook</span></div>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">Thông báo</Link>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">Hỗ trợ</Link>
          <div className="flex items-center gap-1.5 cursor-pointer group">
             <span className="text-white group-hover:text-shopee transition-colors">Tiếng Việt</span>
             <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="flex justify-between items-center gap-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="text-shopee transform group-hover:scale-110 transition-transform duration-300">
              <Store className="w-11 h-11 drop-shadow-[0_0_10px_rgba(238,77,45,0.3)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-white leading-none">
                thanhluan<span className="text-shopee font-medium italic">shop</span>
              </span>
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Premium Store</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 flex flex-col max-w-2xl relative">
            <form onSubmit={handleSearch} className="flex bg-white/95 backdrop-blur-md rounded-sm p-1 shadow-2xl ring-1 ring-white/10">
              <input
                type="text"
                placeholder="Tìm kiếm công nghệ, điện thoại, laptop..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 px-4 outline-none text-sm text-gray-800 bg-transparent"
              />
              <button type="submit" className="bg-shopee hover:bg-shopee-hover text-white px-8 py-2.5 rounded-sm transition-all duration-300 flex items-center justify-center shadow-lg shadow-shopee/20 group">
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </form>
            <div className="flex gap-4 text-white/50 text-[11px] mt-2.5 px-1 font-medium">
              <Link to="/?keyword=iphone" className="hover:text-shopee transition-colors">iPhone 15 Pro</Link>
              <Link to="/?keyword=macbook" className="hover:text-shopee transition-colors">MacBook M3</Link>
              <Link to="/?keyword=samsung" className="hover:text-shopee transition-colors">Galaxy S24</Link>
              <Link to="/?keyword=airpods" className="hover:text-shopee transition-colors">AirPods Pro</Link>
              <Link to="/?keyword=rog" className="hover:text-shopee transition-colors">ROG Strix</Link>
            </div>
          </div>

          {/* Right Icons & Auth */}
          <div className="flex items-center gap-8 flex-shrink-0 text-white">
            <Link to="/cart" className="relative p-2.5 hover:bg-white/5 rounded-full transition-all group">
              <ShoppingCart className="w-7 h-7 group-hover:text-shopee transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-shopee text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#121212] leading-none min-w-[18px] text-center transform translate-x-1 -translate-y-1 shadow-lg animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-5">
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-all group" title="Dashboard">
                    <LayoutDashboard className="w-5 h-5 text-shopee group-hover:rotate-12 transition-transform" />
                  </Link>
                )}
                <div className="flex items-center gap-3 group relative cursor-pointer py-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-shopee to-shopee-hover rounded-full flex items-center justify-center border-2 border-white/10 shadow-lg group-hover:border-shopee/50 transition-all overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${user.username}&background=transparent&color=fff`} alt={user.username} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[13px] font-bold text-white/90 group-hover:text-shopee transition-colors">{user.username}</span>
                     <span className="text-[10px] text-white/40 uppercase tracking-wider">{user.role}</span>
                  </div>
                  
                  {/* Dropdown */}
                  <div className="absolute top-[120%] right-0 w-48 bg-white rounded-sm shadow-2xl py-3 hidden group-hover:block text-gray-800 z-[100] animate-in slide-in-from-top-2 duration-200 border border-gray-100">
                    <div className="absolute -top-1 right-4 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-100"></div>
                    <Link to="/profile" className="block px-5 py-2.5 text-sm hover:bg-gray-50 hover:text-shopee transition-colors font-medium">Hồ sơ của tôi</Link>
                    <Link to="/orders" className="block px-5 py-2.5 text-sm hover:bg-gray-50 hover:text-shopee transition-colors font-medium">Đơn mua</Link>
                    <div className="h-px bg-gray-100 my-2 mx-5"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 transition-colors font-bold"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5 text-[13px] font-bold">
                <Link to="/register" className="text-white/80 hover:text-white transition-colors">Đăng ký</Link>
                <div className="w-px h-3 bg-white/20"></div>
                <Link to="/login" className="text-white hover:text-shopee transition-colors">Đăng nhập</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
