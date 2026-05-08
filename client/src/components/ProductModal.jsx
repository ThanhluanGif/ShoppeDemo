import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import { post, put, get } from '../services/api';

const ProductModal = ({ isOpen, onClose, onRefresh, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    countInStock: '',
    image: '',
    description: '',
    variations: []
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await get('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        category: product.category?._id || product.category || '',
        brand: product.brand || '',
        countInStock: product.countInStock || '',
        image: product.image || '',
        description: product.description || '',
        variations: product.variations || []
      });
    } else {
      setFormData({
        name: '',
        price: '',
        category: '',
        brand: '',
        countInStock: '',
        image: '',
        description: '',
        variations: []
      });
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...formData.variations];
    updatedVariations[index][field] = value;
    setFormData({ ...formData, variations: updatedVariations });
  };

  const addVariation = () => {
    setFormData({
      ...formData,
      variations: [...formData.variations, { size: '', color: '', extraPrice: 0, countInStock: 0 }]
    });
  };

  const removeVariation = (index) => {
    const updatedVariations = formData.variations.filter((_, i) => i !== index);
    setFormData({ ...formData, variations: updatedVariations });
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await post('/upload', uploadFormData, config);
      setFormData({ ...formData, image: data.url });
      setUploading(false);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải ảnh lên Cloudinary');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      return alert('Vui lòng chọn danh mục');
    }
    try {
      if (product) {
        await put(`/products/${product._id}`, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await post('/products', formData);
        alert('Thêm sản phẩm thành công!');
      }
      onRefresh(); 
      onClose();   
    } catch (error) {
      console.error('Lỗi khi xử lý sản phẩm:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                placeholder="Ví dụ: iPhone 15 Pro Max..."
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-shopee outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Thương hiệu</label>
              <input
                required
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                type="text"
                placeholder="Apple, Samsung..."
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-shopee outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giá cơ bản (₫)</label>
              <input
                required
                name="price"
                value={formData.price}
                onChange={handleChange}
                type="number"
                placeholder="29500000"
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-shopee outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục</label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-shopee outline-none transition bg-white"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tổng kho</label>
              <input
                required
                name="countInStock"
                value={formData.countInStock}
                onChange={handleChange}
                type="number"
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-shopee outline-none transition"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Hình ảnh chính</label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-100 shadow-sm" />
                )}
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-shopee hover:bg-red-50 transition group">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-shopee animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-shopee transition" />
                      <span className="text-xs text-gray-500 mt-2">Nhấn để tải ảnh lên Cloudinary</span>
                    </>
                  )}
                  <input type="file" className="hidden" onChange={uploadFileHandler} accept="image/*" />
                </label>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Biến thể (Dung lượng, Màu, Giá thêm)</label>
              <div className="space-y-3">
                {formData.variations.map((v, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Loại</label>
                      <input
                        placeholder="256GB"
                        value={v.size}
                        onChange={(e) => handleVariationChange(index, 'size', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-shopee outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Màu</label>
                      <input
                        placeholder="Titan"
                        value={v.color}
                        onChange={(e) => handleVariationChange(index, 'color', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-shopee outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Giá thêm</label>
                      <input
                        type="number"
                        placeholder="+0"
                        value={v.extraPrice}
                        onChange={(e) => handleVariationChange(index, 'extraPrice', Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-shopee outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Kho</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={v.countInStock}
                        onChange={(e) => handleVariationChange(index, 'countInStock', Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-shopee outline-none"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeVariation(index)}
                      className="p-2 text-shopee hover:bg-red-100 rounded-lg transition flex justify-center mb-0.5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariation}
                  className="flex items-center gap-2 text-sm text-shopee font-bold hover:bg-red-50 px-4 py-2.5 rounded-xl border border-shopee/20 border-dashed w-full justify-center transition"
                >
                  <Plus className="w-5 h-5" /> Thêm biến thể sản phẩm
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả chi tiết</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-shopee outline-none transition resize-none"
                placeholder="Nhập thông số kỹ thuật, đặc điểm nổi bật..."
              ></textarea>
            </div>
          </div>

          <div className="pt-4 flex gap-4 sticky bottom-0 bg-white py-4 border-t shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 px-6 py-3 ${uploading ? 'bg-orange-300' : 'bg-shopee hover:bg-shopee-hover'} text-white rounded-xl font-bold shadow-lg shadow-red-100 transition transform hover:-translate-y-0.5 active:translate-y-0`}
            >
              {product ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

