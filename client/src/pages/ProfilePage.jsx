import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Heart, MapPin, Trash2, Plus, User as UserIcon, Phone, Mail, Package, Share2, CheckCircle } from 'lucide-react';
import { post, del, get } from '../services/api';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUserState, logout } = useContext(AuthContext);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', phone: '', isDefault: false });
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await get('/orders/myorders');
        setMyOrders(data);
      } catch (error) {
        console.error('Fetch orders error', error);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (user) fetchMyOrders();
  }, [user]);

  const handleToggleWishlist = async (productId) => {
    try {
      const { data } = await post('/users/wishlist', { productId });
      updateUserState({ wishlist: data.wishlist });
    } catch (error) {
      console.error('Wishlist error', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await post('/users/addresses', newAddress);
      updateUserState({ addresses: data.addresses });
      setNewAddress({ street: '', city: '', phone: '', isDefault: false });
      setShowAddressForm(false);
    } catch (error) {
      console.error('Address error', error);
    }
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      const { data } = await del(`/users/addresses/${addressId}`);
      updateUserState({ addresses: data.addresses });
    } catch (error) {
      console.error('Remove address error', error);
    }
  };

  if (!user) return <div className="p-20 text-center">Vui lòng đăng nhập để xem hồ sơ.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-500 text-sm mb-6">{user.email}</p>
            <button 
              onClick={logout}
              className="w-full py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Order History */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-black text-gray-900">Lịch sử đơn hàng</h2>
            </div>
            
            {ordersLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-3xl text-center text-gray-500 font-medium border border-dashed border-gray-300">
                Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <div key={order._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mã đơn: #{order._id.slice(-6)}</p>
                        <p className="text-sm font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                        }`}>
                          {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.isDelivered ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.isDelivered ? 'Đã giao hàng' : 'Đang xử lý'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">${order.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Wishlist */}
          <section className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <Heart className="w-5 h-5 text-shopee fill-current" />
              <h2 className="text-lg font-bold text-gray-800 tracking-tight uppercase">Sản phẩm yêu thích</h2>
            </div>
            
            {user.wishlist?.length === 0 ? (
              <div className="bg-gray-50 py-12 rounded-sm text-center text-gray-500 text-sm">
                Bạn chưa yêu thích sản phẩm nào.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {user.wishlist?.map((item) => (
                  <div key={item._id} className="group relative bg-white border border-gray-100 rounded-sm hover:shadow-md transition p-2 flex flex-col">
                    <Link to={`/product/${item._id}`}>
                      <div className="aspect-square mb-2 overflow-hidden bg-gray-50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <p className="text-xs text-gray-800 line-clamp-2 h-8 mb-2 leading-tight">{item.name}</p>
                      <p className="text-shopee text-sm font-medium">₫{item.price.toLocaleString('vi-VN')}</p>
                    </Link>
                    <button 
                      onClick={() => handleToggleWishlist(item._id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-shopee"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Address Book */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-black text-gray-900">Sổ địa chỉ</h2>
              </div>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                <Plus className="w-4 h-4" /> Thêm địa chỉ
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    required
                    placeholder="Số nhà, tên đường"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    className="px-4 py-2 rounded-xl border focus:ring-2 ring-blue-400 outline-none"
                  />
                  <input 
                    required
                    placeholder="Thành phố"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="px-4 py-2 rounded-xl border focus:ring-2 ring-blue-400 outline-none"
                  />
                  <input 
                    required
                    placeholder="Số điện thoại"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    className="px-4 py-2 rounded-xl border focus:ring-2 ring-blue-400 outline-none"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
                    Lưu địa chỉ
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2 text-gray-500 font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {user.addresses?.length === 0 ? (
                <div className="bg-gray-50 p-12 rounded-3xl text-center text-gray-500">
                  Bạn chưa lưu địa chỉ nào.
                </div>
              ) : (
                user.addresses?.map((addr) => (
                  <div key={addr._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{addr.street}, {addr.city}</p>
                        {addr.isDefault && <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Mặc định</span>}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Phone className="w-4 h-4" /> {addr.phone}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveAddress(addr._id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Linked Accounts */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-black text-gray-900">Liên kết mạng xã hội</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-8 w-8" />
                  <div>
                    <p className="font-bold text-gray-900">Google</p>
                    <p className="text-xs text-gray-500">
                      {user.googleId ? 'Đã liên kết' : 'Chưa liên kết'}
                    </p>
                  </div>
                </div>
                {user.googleId ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <button 
                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/auth/google`}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition"
                  >
                    Liên kết
                  </button>
                )}
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60">
                <div className="flex items-center gap-4">
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="h-8 w-8" />
                  <div>
                    <p className="font-bold text-gray-900">Facebook</p>
                    <p className="text-xs text-gray-500">Sắp ra mắt</p>
                  </div>
                </div>
                <button disabled className="px-4 py-2 bg-gray-200 rounded-xl text-sm font-bold cursor-not-allowed">
                  Liên kết
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;