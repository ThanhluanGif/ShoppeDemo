import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, List, Search, ChevronDown, MoreHorizontal, HelpCircle } from 'lucide-react';
import { get, post, put, del } from '../services/api';
import toast from 'react-hot-toast';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await del(`/categories/${id}`);
        toast.success('Xóa danh mục thành công!');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa danh mục');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (selectedCategory) {
        await put(`/categories/${selectedCategory._id}`, formData);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await post('/categories', formData);
        toast.success('Thêm danh mục mới thành công!');
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border-b border-gray-100">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Danh mục sản phẩm</h1>
           <p className="text-[13px] text-gray-500 mt-1">Quản lý các nhóm ngành hàng để người mua dễ dàng tìm kiếm sản phẩm.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedCategory(null);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="bg-shopee text-white px-5 py-2 rounded-sm flex items-center gap-2 hover:bg-shopee-hover transition shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục mới
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden min-h-[400px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fafafa]">
           <div className="flex items-center gap-4">
              <h2 className="text-base font-bold text-gray-800">{categories.length} Danh mục</h2>
              <div className="h-4 border-l border-gray-300"></div>
              <div className="flex items-center gap-1 text-[13px] text-gray-500 italic">
                 Sắp xếp theo thứ tự ưu tiên hiển thị <HelpCircle className="w-3.5 h-3.5" />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 font-medium text-gray-500 text-sm w-1/4">Tên danh mục</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm w-1/4">Đường dẫn (Slug)</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm w-1/3">Mô tả</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan="4" className="px-6 py-8"><div className="h-8 bg-gray-50 rounded-sm"></div></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                         <List className="w-16 h-16 mb-2" />
                         <p className="text-gray-500 font-bold">Chưa có danh mục nào</p>
                      </div>
                   </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                       <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">{cat.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm text-gray-500 line-clamp-1">{cat.description || 'Chưa có mô tả'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(cat)}
                            className="text-blue-600 hover:font-bold text-xs"
                          >
                            Chỉnh sửa
                          </button>
                          <button 
                            onClick={() => handleDelete(cat._id)}
                            className="text-gray-500 hover:text-shopee text-xs"
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

      {/* Modal for Category Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-sm w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-lg font-bold text-gray-800">
                 {selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
               </h2>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><Trash2 className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Tên danh mục <span className="text-shopee">*</span></label>
                <input 
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ví dụ: Điện thoại, Laptop..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
                <textarea 
                  className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả ngắn về danh mục này..."
                ></textarea>
              </div>
              
              <div className="flex gap-4 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-10 py-2 border border-gray-200 text-gray-700 rounded-sm hover:bg-gray-50 transition text-sm font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="px-10 py-2 bg-shopee text-white rounded-sm hover:bg-shopee-hover transition shadow-sm disabled:opacity-50 text-sm font-medium"
                >
                  {modalLoading ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryPage;