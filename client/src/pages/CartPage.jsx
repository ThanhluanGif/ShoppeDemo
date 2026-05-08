import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Store, Ticket, ShieldCheck, MessageCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState(cartItems.map(item => item._id));

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item._id));
    }
  };

  const selectedTotal = cartItems
    .filter(item => selectedItems.includes(item._id))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#f5f5f5] min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-shopee opacity-20" />
          </div>
          <p className="text-gray-500 mb-6">Giỏ hàng của bạn còn trống</p>
          <Link to="/" className="bg-shopee text-white px-10 py-2.5 rounded-sm font-medium hover:bg-shopee-hover transition uppercase text-sm">
            Mua Ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Free Shipping Header */}
        <div className="bg-[#fffefb] border border-[#fffae9] p-3 mb-4 flex items-center gap-3 rounded-sm">
          <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/913927980cd23584744c.png" alt="Free Ship" className="w-6 h-5" />
          <p className="text-[13px] text-gray-800">Nhấn vào mục Mã giảm giá ở cuối trang để hưởng miễn phí vận chuyển bạn nhé!</p>
        </div>

        {/* Cart Header Bar */}
        <div className="bg-white px-5 py-4 mb-3 rounded-sm shadow-sm hidden md:flex items-center text-sm text-gray-500">
          <div className="w-[45%] flex items-center gap-5">
            <input 
              type="checkbox" 
              className="w-4 h-4 accent-shopee cursor-pointer"
              checked={selectedItems.length === cartItems.length && cartItems.length > 0}
              onChange={toggleSelectAll}
            />
            <span className="text-gray-800">Sản Phẩm</span>
          </div>
          <div className="w-[15%] text-center">Đơn Giá</div>
          <div className="w-[15%] text-center">Số Lượng</div>
          <div className="w-[15%] text-center">Số Tiền</div>
          <div className="w-[10%] text-center">Thao Tác</div>
        </div>

        {/* Shop Group */}
        <div className="bg-white rounded-sm shadow-sm mb-4">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-4 h-4 accent-shopee cursor-pointer mr-3"
              checked={selectedItems.length === cartItems.length && cartItems.length > 0}
              onChange={toggleSelectAll}
            />
            <div className="bg-shopee text-white text-[10px] px-1 font-bold rounded-sm">Mall</div>
            <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
              thanhluan shop <Store className="w-4 h-4 text-shopee" />
            </span>
            <MessageCircle className="w-4 h-4 text-shopee ml-2 cursor-pointer" />
          </div>

          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <div key={item._id} className="px-5 py-5 flex items-center gap-5 md:gap-0 flex-wrap md:flex-nowrap">
                <div className="w-full md:w-[45%] flex items-center gap-5">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-shopee cursor-pointer"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => toggleSelect(item._id)}
                  />
                  <Link to={`/product/${item._id}`} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover border border-gray-100" />
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm text-gray-800 line-clamp-2 hover:text-shopee transition">{item.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/product/7cd6145ad7ca72ae96ef.png" alt="Return" className="h-4" />
                        <span className="text-[11px] text-shopee">7 ngày trả hàng</span>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="w-1/3 md:w-[15%] text-center flex flex-col md:block items-center">
                  <span className="md:hidden text-xs text-gray-400">Đơn giá:</span>
                  <span className="text-sm text-gray-800">₫{item.price.toLocaleString('vi-VN')}</span>
                </div>

                <div className="w-1/3 md:w-[15%] flex justify-center items-center">
                  <div className="flex items-center border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2.5 py-0.5 text-gray-500 hover:bg-gray-50 border-r border-gray-200"
                    >
                      -
                    </button>
                    <input 
                      type="text" 
                      value={item.quantity} 
                      className="w-12 text-center text-sm outline-none"
                      readOnly
                    />
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2.5 py-0.5 text-gray-500 hover:bg-gray-50 border-l border-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="w-1/3 md:w-[15%] text-center">
                  <span className="text-sm text-shopee font-medium">₫{(item.price * item.quantity).toLocaleString('vi-VN')}</span>
                </div>

                <div className="w-full md:w-[10%] text-center mt-4 md:mt-0">
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="text-sm text-gray-700 hover:text-shopee transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop Voucher Bar */}
        <div className="bg-[#fffefb] border border-gray-100 px-5 py-4 mb-3 rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-shopee">
            <Ticket className="w-5 h-5" />
            <span className="text-sm">Voucher giảm đến ₫20k của Shop</span>
          </div>
          <button className="text-blue-600 text-sm">Xem thêm Voucher</button>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Top of Bottom Bar: Shopee Voucher */}
          <div className="flex justify-end items-center gap-2 mb-4 pb-4 border-b border-gray-50">
             <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-shopee" />
                <span className="text-sm text-gray-800">ThanhLuanShop Voucher</span>
             </div>
             <button className="text-blue-600 text-sm ml-4">Chọn Hoặc Nhập Mã</button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-shopee cursor-pointer"
                  checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                  onChange={toggleSelectAll}
                />
                <span className="text-sm text-gray-800">Chọn tất cả ({cartItems.length})</span>
              </label>
              <button className="text-sm text-gray-800 hover:text-shopee hidden md:block">Xóa</button>
              <button className="text-sm text-shopee font-medium hidden md:block">Lưu vào mục Đã thích</button>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-gray-800">Tổng thanh toán ({selectedItems.length} Sản phẩm):</span>
                  <span className="text-2xl text-shopee font-medium">₫{selectedTotal.toLocaleString('vi-VN')}</span>
                </div>
                <p className="text-[13px] text-gray-500 mt-1">Tiết kiệm ₫12k</p>
              </div>
              <button 
                onClick={() => selectedItems.length > 0 ? navigate('/checkout') : alert('Vui lòng chọn sản phẩm để thanh toán')}
                className="bg-shopee text-white px-12 py-3 rounded-sm font-medium hover:bg-shopee-hover transition uppercase text-sm w-full md:w-60 shadow-sm"
              >
                Mua Hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
