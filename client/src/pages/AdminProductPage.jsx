import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, ChevronDown, Filter, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { get, del } from '../services/api';
import ProductModal from '../components/ProductModal';

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusTab, setStatusTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await del(`/products/${id}`);
        alert('Xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', count: products.length },
    { id: 'active', label: 'Đang hoạt động', count: products.filter(p => p.countInStock > 0).length },
    { id: 'out_of_stock', label: 'Hết hàng', count: products.filter(p => p.countInStock <= 0).length },
    { id: 'hidden', label: 'Đã ẩn', count: 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border-b border-gray-100">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Tất cả sản phẩm</h1>
           <p className="text-[13px] text-gray-500 mt-1">Quản lý các sản phẩm của bạn, cập nhật giá và số lượng tồn kho.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedProduct(null);
            setShowModal(true);
          }}
          className="bg-shopee text-white px-5 py-2 rounded-sm flex items-center gap-2 hover:bg-shopee-hover transition shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Thêm 1 sản phẩm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setStatusTab(tab.id)}
               className={`px-8 py-3 text-sm whitespace-nowrap transition-all relative ${
                 statusTab === tab.id 
                  ? 'text-shopee font-medium after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-shopee' 
                  : 'text-gray-600 hover:text-shopee'
               }`}
             >
               {tab.label} ({tab.count})
             </button>
           ))}
        </div>

        {/* Filter Bar */}
        <div className="p-6 space-y-4">
           <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[300px] flex items-center border border-gray-200 rounded-sm px-3 py-2 bg-white focus-within:border-shopee transition">
                 <select className="bg-transparent border-none outline-none text-sm text-gray-700 mr-2 pr-2 border-r border-gray-200">
                    <option>Tên sản phẩm</option>
                    <option>Mã sản phẩm (SKU)</option>
                 </select>
                 <input 
                  type="text" 
                  placeholder="Vui lòng nhập" 
                  className="flex-1 bg-transparent border-none outline-none text-sm ml-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Search className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-2 min-w-[200px]">
                 <span className="text-sm text-gray-600 whitespace-nowrap">Danh mục:</span>
                 <div className="flex-1 flex items-center justify-between border border-gray-200 rounded-sm px-3 py-2 bg-white text-sm cursor-pointer hover:border-shopee">
                    <span className="text-gray-400">Chọn danh mục</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <button className="bg-shopee text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-shopee-hover">Tìm</button>
                 <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-sm text-sm font-medium hover:bg-gray-50">Nhập lại</button>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-600">Kho hàng:</span>
                 <div className="flex items-center gap-1">
                    <input type="text" placeholder="Tối thiểu" className="w-24 border border-gray-200 rounded-sm px-2 py-1.5 text-sm outline-none focus:border-shopee" />
                    <span className="text-gray-300">-</span>
                    <input type="text" placeholder="Tối đa" className="w-24 border border-gray-200 rounded-sm px-2 py-1.5 text-sm outline-none focus:border-shopee" />
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-600">Doanh số:</span>
                 <div className="flex items-center gap-1">
                    <input type="text" placeholder="Tối thiểu" className="w-24 border border-gray-200 rounded-sm px-2 py-1.5 text-sm outline-none focus:border-shopee" />
                    <span className="text-gray-300">-</span>
                    <input type="text" placeholder="Tối đa" className="w-24 border border-gray-200 rounded-sm px-2 py-1.5 text-sm outline-none focus:border-shopee" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Product Table Area */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden min-h-[400px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fafafa]">
           <div className="flex items-center gap-4">
              <h2 className="text-base font-bold text-gray-800">{products.length} Sản phẩm</h2>
              <div className="h-4 border-l border-gray-300"></div>
              <div className="flex items-center gap-1 text-[13px] text-gray-500">
                 Có thể hiển thị tối đa 1000 sản phẩm <HelpCircle className="w-3.5 h-3.5" />
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-sm text-xs font-medium hover:bg-gray-50">Công cụ xử lý hàng loạt</button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 w-10">
                   <input type="checkbox" className="w-4 h-4 accent-shopee" />
                </th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Tên sản phẩm</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Phân loại hàng</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Giá</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Kho hàng</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Doanh số</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan="7" className="px-6 py-8"><div className="h-8 bg-gray-50 rounded-sm"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                   <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                         <Package className="w-16 h-16 mb-2" />
                         <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                      </div>
                   </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <input type="checkbox" className="w-4 h-4 accent-shopee" />
                    </td>
                    <td className="px-6 py-4 align-top max-w-md">
                      <div className="flex gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover border border-gray-100 shrink-0" />
                        <div className="flex flex-col gap-1">
                          <p className="text-[13px] text-gray-800 line-clamp-2 hover:text-blue-600 cursor-pointer font-medium">{product.name}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] text-gray-400">ID: {product._id.slice(-8).toUpperCase()}</span>
                             <span className="bg-blue-50 text-blue-500 text-[10px] px-1 rounded-sm">{product.brand}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                       <span className="text-[13px] text-gray-600">{product.category?.name || 'Mặc định'}</span>
                    </td>
                    <td className="px-6 py-4 align-top">
                       <p className="text-[13px] text-gray-800 font-medium">₫{product.price.toLocaleString('vi-VN')}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                       <p className={`text-[13px] font-medium ${product.countInStock < 5 ? 'text-shopee' : 'text-gray-800'}`}>
                          {product.countInStock}
                       </p>
                    </td>
                    <td className="px-6 py-4 align-top">
                       <p className="text-[13px] text-gray-600">{product.numReviews * 12 || 0}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex flex-col gap-1 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-xs text-blue-600 hover:font-bold transition-all"
                        >
                          Cập nhật
                        </button>
                        <button 
                          className="text-xs text-gray-500 hover:text-shopee"
                        >
                          Ẩn
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-xs text-gray-500 hover:text-shopee"
                        >
                          Xóa
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

      <ProductModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        onRefresh={fetchProducts} 
        product={selectedProduct}
      />
    </div>
  );
};

export default AdminProductPage;
