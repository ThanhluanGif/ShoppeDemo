import React, { useState, useEffect } from 'react';
import { Filter, ChevronRight, Star } from 'lucide-react';
import { get } from '../services/api';

const Sidebar = ({ activeCategory, onCategoryChange, sort, onSortChange }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await get('/categories');
        setCategories(['Tất cả', ...data.map(c => c.name)]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" /> Danh mục
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat === 'Tất cả' ? '' : cat)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                (activeCategory === cat || (activeCategory === '' && cat === 'Tất cả'))
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {cat}
              <ChevronRight className={`w-4 h-4 ${(activeCategory === cat || (activeCategory === '' && cat === 'Tất cả')) ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 border-t pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sắp xếp theo</h3>
        <select 
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="newest">Mới nhất</option>
          <option value="priceAsc">Giá: Thấp đến Cao</option>
          <option value="priceDesc">Giá: Cao đến Thấp</option>
        </select>
      </div>

      <div className="border-t pt-8">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h4 className="text-blue-900 font-bold mb-2 flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" /> Ưu đãi độc quyền
          </h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Đăng ký thành viên để nhận mã giảm giá 10% cho đơn hàng đầu tiên!
          </p>
          <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
