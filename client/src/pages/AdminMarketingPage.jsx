import React, { useState, useEffect } from 'react';
import { Zap, Clock, ChevronRight, HelpCircle, Package, Edit, Trash2 } from 'lucide-react';
import { get, put } from '../services/api';
import toast from 'react-hot-toast';

const AdminMarketingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    isFlashSale: true,
    flashSalePrice: 0,
    flashSaleStartTime: '',
    flashSaleEndTime: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await get('/products');
      setProducts(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenFlashSale = (product) => {
    setSelectedProduct(product);
    setFormData({
      isFlashSale: true,
      flashSalePrice: product.flashSalePrice || Math.round(product.price * 0.8),
      flashSaleStartTime: product.flashSaleStartTime ? new Date(product.flashSaleStartTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      flashSaleEndTime: product.flashSaleEndTime ? new Date(product.flashSaleEndTime).toISOString().slice(0, 16) : new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    });
    setShowModal(true);
  };

  const handleUpdateFlashSale = async (e) => {
    e.preventDefault();
    try {
      await put(`/products/${selectedProduct._id}`, {
        ...formData,
        isFlashSale: String(formData.isFlashSale)
      });
      toast.success('Cập nhật Flash Sale thành công!');
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Lỗi khi cập nhật Flash Sale');
    }
  };

  const handleRemoveFlashSale = async (productId) => {
    if (window.confirm('Bạn có muốn gỡ Flash Sale cho sản phẩm này?')) {
      try {
        await put(`/products/${productId}`, { isFlashSale: 'false' });
        toast.success('Đã gỡ Flash Sale');
        fetchProducts();
      } catch (error) {
        toast.error('Lỗi khi gỡ Flash Sale');
      }
    }
  };

  const flashSaleProducts = products.filter(p => p.isFlashSale);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border-b border-gray-100">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Kênh Marketing</h1>
           <p className="text-[13px] text-gray-500 mt-1">Sử dụng các công cụ khuyến mãi để bùng nổ doanh số.</p>
        </div>
      </div>

      {/* Marketing Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 hover:border-shopee transition-all cursor-pointer group">
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-shopee" />
               </div>
               <div>
                  <h3 className="text-base font-bold text-gray-800 group-hover:text-shopee">Flash Sale của Shop</h3>
                  <p className="text-xs text-gray-500 mt-1">Công cụ giúp tăng đơn hàng thần tốc bằng cách giảm giá trong khung giờ nhất định.</p>
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 hover:border-blue-500 transition-all cursor-pointer group opacity-60">
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-blue-500" />
               </div>
               <div>
                  <h3 className="text-base font-bold text-gray-800">Combo Khuyến Mãi</h3>
                  <p className="text-xs text-gray-500 mt-1">Tạo các gói sản phẩm mua kèm để tăng giá trị đơn hàng.</p>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded-sm mt-2 inline-block">Sắp ra mắt</span>
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 hover:border-orange-500 transition-all cursor-pointer group opacity-60">
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-orange-500" />
               </div>
               <div>
                  <h3 className="text-base font-bold text-gray-800">Mua Để Nhận Quà</h3>
                  <p className="text-xs text-gray-500 mt-1">Tặng quà miễn phí cho khách hàng đạt giá trị đơn tối thiểu.</p>
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded-sm mt-2 inline-block">Sắp ra mắt</span>
               </div>
            </div>
         </div>
      </div>

      {/* Flash Sale Management Section */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
               <Zap className="w-4 h-4 text-shopee fill-current" /> Danh sách Flash Sale Đang chạy
            </h2>
            <div className="flex items-center gap-1 text-[13px] text-gray-500">
               Khung giờ vàng mỗi ngày <HelpCircle className="w-3.5 h-3.5" />
            </div>
         </div>

         <div className="p-6">
            {loading ? (
              <p className="text-center py-10 text-gray-500">Đang tải...</p>
            ) : flashSaleProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                 <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                 <p className="text-gray-500 text-sm">Chưa có sản phẩm nào tham gia Flash Sale.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {flashSaleProducts.map(product => (
                   <div key={product._id} className="border border-gray-100 rounded-sm p-4 hover:shadow-md transition">
                      <div className="flex gap-3">
                         <img src={product.image} className="w-16 h-16 object-cover rounded-sm" />
                         <div className="flex-1">
                            <h4 className="text-[13px] font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-xs text-gray-400 line-through">₫{product.price.toLocaleString('vi-VN')}</span>
                               <span className="text-sm text-shopee font-bold">₫{product.flashSalePrice.toLocaleString('vi-VN')}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Hết hạn: {new Date(product.flashSaleEndTime).toLocaleDateString('vi-VN')}</p>
                         </div>
                      </div>
                      <div className="mt-4 flex gap-2 border-t border-gray-50 pt-3">
                         <button onClick={() => handleOpenFlashSale(product)} className="flex-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 py-1 transition rounded-sm">Chỉnh sửa</button>
                         <button onClick={() => handleRemoveFlashSale(product._id)} className="flex-1 text-[11px] font-medium text-red-500 hover:bg-red-50 py-1 transition rounded-sm">Gỡ Flash Sale</button>
                      </div>
                   </div>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* Add More Products Section */}
      <div className="bg-white p-6 rounded-sm shadow-sm">
         <h3 className="text-base font-bold text-gray-800 mb-4">Thêm sản phẩm vào Flash Sale</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="px-4 py-3 font-medium text-gray-500">Sản phẩm</th>
                     <th className="px-4 py-3 font-medium text-gray-500">Giá hiện tại</th>
                     <th className="px-4 py-3 font-medium text-gray-500 text-right">Thao tác</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {products.filter(p => !p.isFlashSale).slice(0, 5).map(p => (
                     <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                           <div className="flex items-center gap-3">
                              <img src={p.image} className="w-10 h-10 object-cover" />
                              <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                           </div>
                        </td>
                        <td className="px-4 py-3">₫{p.price.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-right">
                           <button onClick={() => handleOpenFlashSale(p)} className="bg-shopee text-white px-3 py-1 rounded-sm text-xs">Tham gia</button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Flash Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-sm w-full max-w-md overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-800">Thiết lập Flash Sale</div>
             <form onSubmit={handleUpdateFlashSale} className="p-6 space-y-4">
                <div>
                   <label className="text-xs text-gray-500 uppercase font-bold">Giá Flash Sale</label>
                   <input 
                    type="number"
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm mt-1 focus:border-shopee outline-none"
                    value={formData.flashSalePrice}
                    onChange={(e) => setFormData({...formData, flashSalePrice: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="text-xs text-gray-500 uppercase font-bold">Thời gian bắt đầu</label>
                   <input 
                    type="datetime-local"
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm mt-1 focus:border-shopee outline-none"
                    value={formData.flashSaleStartTime}
                    onChange={(e) => setFormData({...formData, flashSaleStartTime: e.target.value})}
                   />
                </div>
                <div>
                   <label className="text-xs text-gray-500 uppercase font-bold">Thời gian kết thúc</label>
                   <input 
                    type="datetime-local"
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm mt-1 focus:border-shopee outline-none"
                    value={formData.flashSaleEndTime}
                    onChange={(e) => setFormData({...formData, flashSaleEndTime: e.target.value})}
                   />
                </div>
                <div className="flex gap-2 pt-4">
                   <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-sm text-sm">Hủy</button>
                   <button type="submit" className="flex-1 py-2 bg-shopee text-white rounded-sm text-sm font-medium">Xác nhận</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketingPage;