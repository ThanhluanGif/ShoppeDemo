import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Ticket, Search, Calendar, Filter, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { get, post, put, del } from '../services/api';
import toast from 'react-hot-toast';

const AdminCouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: 0,
    minPurchase: 0,
    expiryDate: '',
    usageLimit: '',
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await get('/coupons');
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      minPurchase: coupon.minPurchase,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        await del(`/coupons/${id}`);
        toast.success('Xóa mã giảm giá thành công!');
        fetchCoupons();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa mã');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (selectedCoupon) {
        await put(`/coupons/${selectedCoupon._id}`, formData);
        toast.success('Cập nhật mã giảm giá thành công!');
      } else {
        await post('/coupons', formData);
        toast.success('Thêm mã giảm giá mới thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setModalLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountAmount: 0,
      minPurchase: 0,
      expiryDate: '',
      usageLimit: '',
      isActive: true
    });
    setSelectedCoupon(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border-b border-gray-100">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Mã giảm giá của Shop</h1>
           <p className="text-[13px] text-gray-500 mt-1">Tạo Voucher để thu hút người mua và tăng doanh số bán hàng.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-shopee text-white px-5 py-2 rounded-sm flex items-center gap-2 hover:bg-shopee-hover transition shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Tạo mã giảm giá mới
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-sm shadow-sm">
         <div className="flex flex-wrap gap-6 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
               <span className="text-sm text-gray-600">Tên chương trình / Mã Voucher:</span>
               <div className="flex items-center border border-gray-200 rounded-sm px-3 py-2 bg-white focus-within:border-shopee transition">
                  <input 
                    type="text" 
                    placeholder="Nhập vào đây" 
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <Search className="w-4 h-4 text-gray-400" />
               </div>
            </div>
            
            <div className="flex flex-col gap-1.5 w-48">
               <span className="text-sm text-gray-600">Trạng thái:</span>
               <div className="flex items-center justify-between border border-gray-200 rounded-sm px-3 py-2 bg-white text-sm cursor-pointer hover:border-shopee">
                  <span>Tất cả</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
               </div>
            </div>

            <button className="bg-shopee text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-shopee-hover h-[38px]">Tìm</button>
         </div>
      </div>

      {/* Coupons Table Area */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden min-h-[400px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fafafa]">
           <h2 className="text-base font-bold text-gray-800">{coupons.length} Mã giảm giá</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Tên mã / Code</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Loại giảm giá</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Mức giảm</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Đơn tối thiểu</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Hạn sử dụng</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan="7" className="px-6 py-8"><div className="h-10 bg-gray-50 rounded-sm"></div></td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                   <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                         <Ticket className="w-16 h-16 mb-2" />
                         <p className="text-gray-500 font-bold">Chưa có mã giảm giá nào</p>
                      </div>
                   </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-shopee bg-red-50 border border-shopee/20 px-2 py-0.5 rounded-sm inline-block w-fit mb-1">{coupon.code}</span>
                          <span className="text-[11px] text-gray-400">ID: {coupon._id.slice(-6).toUpperCase()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                       {coupon.discountType === 'percentage' ? 'Theo phần trăm' : 'Số tiền cố định'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                       {coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₫${coupon.discountAmount.toLocaleString('vi-VN')}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                       ₫{coupon.minPurchase.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                       {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                       {coupon.isActive ? (
                         <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> Đang chạy
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <XCircle className="w-3 h-3" /> Kết thúc
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:font-bold text-xs">Chỉnh sửa</button>
                          <button onClick={() => handleDelete(coupon._id)} className="text-gray-500 hover:text-shopee text-xs">Xóa</button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-sm w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-lg font-bold text-gray-800">
                 {selectedCoupon ? 'Chỉnh sửa Mã giảm giá' : 'Tạo Mã giảm giá mới'}
               </h2>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Mã giảm giá <span className="text-shopee">*</span>
                     </label>
                     <input 
                       type="text"
                       required
                       maxLength={10}
                       className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition uppercase"
                       value={formData.code}
                       onChange={(e) => setFormData({...formData, code: e.target.value})}
                       placeholder="Ví dụ: GIAM20K"
                     />
                     <p className="text-[10px] text-gray-400">Tối đa 10 ký tự.</p>
                  </div>
                  
                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Loại giảm giá <span className="text-shopee">*</span>
                     </label>
                     <select 
                       className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition bg-white"
                       value={formData.discountType}
                       onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                     >
                        <option value="percentage">Theo phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (₫)</option>
                     </select>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Mức giảm giá <span className="text-shopee">*</span>
                     </label>
                     <div className="relative">
                        <input 
                          type="number"
                          required
                          className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition"
                          value={formData.discountAmount}
                          onChange={(e) => setFormData({...formData, discountAmount: Number(e.target.value)})}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                           {formData.discountType === 'percentage' ? '%' : '₫'}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Giá trị đơn tối thiểu
                     </label>
                     <div className="relative">
                        <input 
                          type="number"
                          className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition"
                          value={formData.minPurchase}
                          onChange={(e) => setFormData({...formData, minPurchase: Number(e.target.value)})}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Ngày hết hạn <span className="text-shopee">*</span>
                     </label>
                     <div className="relative">
                        <input 
                          type="date"
                          required
                          className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition bg-white"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Giới hạn lượt dùng</label>
                     <input 
                       type="number"
                       className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition"
                       value={formData.usageLimit}
                       onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                       placeholder="Không giới hạn"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="isActive"
                    className="w-4 h-4 accent-shopee"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Kích hoạt mã giảm giá ngay</label>
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
                  {modalLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponPage;