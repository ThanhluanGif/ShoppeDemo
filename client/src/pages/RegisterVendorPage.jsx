import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck, ChevronRight, Info, CheckCircle, Package, DollarSign, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { put } from '../services/api';
import toast from 'react-hot-toast';

const RegisterVendorPage = () => {
  const { user, fetchProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=register-vendor');
    } else if (user.role === 'vendor' || user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await put('/users/register-vendor', formData);
      toast.success('Đã gửi yêu cầu đăng ký bán hàng!');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (user?.vendorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-10 max-w-md w-full text-center shadow-sm rounded-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang chờ phê duyệt</h2>
          <p className="text-gray-500 mb-8 text-sm">Yêu cầu đăng ký Shop của bạn đang được Admin xem xét. Chúng tôi sẽ thông báo cho bạn ngay khi có kết quả.</p>
          <Link to="/" className="text-shopee font-medium hover:underline">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-shopee to-shopee-hover py-12 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
               <h1 className="text-4xl font-black mb-4 tracking-tight">Trở Thành Người Bán Shopee</h1>
               <p className="text-white/80 text-lg">Mở rộng kinh doanh, tiếp cận hàng triệu khách hàng cùng ThanhLuanShop.</p>
            </div>
            <div className="hidden md:block">
               <Store className="w-32 h-32 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-sm shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-l-4 border-shopee pl-3">
                Thông tin Shop
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên Shop của bạn <span className="text-shopee">*</span></label>
                  <input 
                    type="text" 
                    required
                    minLength={5}
                    maxLength={30}
                    placeholder="Ví dụ: Tech Pro Official Store"
                    className="w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm focus:border-shopee outline-none transition"
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Lưu ý: Tên Shop phải chuyên nghiệp và không vi phạm quy định.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả Shop <span className="text-shopee">*</span></label>
                  <textarea 
                    required
                    rows="4"
                    placeholder="Shop chuyên cung cấp các mặt hàng gì? Cam kết chất lượng ra sao?"
                    className="w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm focus:border-shopee outline-none transition resize-none"
                    value={formData.shopDescription}
                    onChange={(e) => setFormData({...formData, shopDescription: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-sm border border-orange-100 flex gap-3">
                   <Info className="w-5 h-5 text-shopee shrink-0" />
                   <p className="text-xs text-gray-600 leading-relaxed">Bằng cách nhấn đăng ký, bạn đồng ý chịu mức phí hoa hồng là <span className="font-bold text-shopee">5%</span> trên mỗi đơn hàng thành công để duy trì nền tảng.</p>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-shopee text-white py-3 rounded-sm font-bold hover:bg-shopee-hover transition shadow-lg shadow-shopee/20 uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng Ký Bán Hàng Ngay'}
                </button>
              </form>
            </div>
          </div>

          {/* Benefits Side */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Quyền lợi Người bán</h3>
                <div className="space-y-5">
                   <div className="flex gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                         <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-700">Đăng sản phẩm miễn phí</p>
                         <p className="text-xs text-gray-500 mt-0.5">Không giới hạn số lượng sản phẩm đăng bán.</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                         <ShieldCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-700">Hỗ trợ vận chuyển</p>
                         <p className="text-xs text-gray-500 mt-0.5">Tích hợp các đơn vị vận chuyển hàng đầu.</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                         <DollarSign className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-700">Thanh toán nhanh gọn</p>
                         <p className="text-xs text-gray-500 mt-0.5">Rút tiền về tài khoản ngân hàng dễ dàng.</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-[#fffefb] p-6 rounded-sm shadow-sm border border-[#fffae9]">
                <h3 className="font-bold text-gray-800 mb-2">Hỗ trợ 24/7</h3>
                <p className="text-xs text-gray-500 mb-4">Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ đối tác.</p>
                <button className="w-full py-2 bg-gray-800 text-white text-sm font-medium rounded-sm">Chat với Admin</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVendorPage;