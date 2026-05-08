import React, { useState, useEffect, useContext } from 'react';
import { Store, Camera, Save, Info, Globe, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { get, put, post } from '../services/api';
import toast from 'react-hot-toast';

const AdminProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [shopData, setShopData] = useState({
    shopName: 'thanhluan shop',
    description: 'Chuyên cung cấp các sản phẩm công nghệ chính hãng, uy tín hàng đầu.',
    logo: 'https://ui-avatars.com/api/?name=TLS&background=ee4d2d&color=fff&size=128',
    banner: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071',
    phone: '0912 345 678',
    email: 'contact@thanhluan.com',
    address: 'Quận 1, TP. Hồ Chí Minh'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic cập nhật hồ sơ shop (giả lập)
    setTimeout(() => {
      toast.success('Cập nhật hồ sơ Shop thành công!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border-b border-gray-100">
        <div>
           <h1 className="text-xl font-bold text-gray-800">Hồ sơ Shop</h1>
           <p className="text-[13px] text-gray-500 mt-1">Xem tình trạng Shop và cập nhật hồ sơ Shop của bạn.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
         {/* Banner & Logo Section */}
         <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-100">
            <div className="relative h-48 bg-gray-200">
               <img src={shopData.banner} className="w-full h-full object-cover opacity-80" alt="Banner" />
               <button type="button" className="absolute bottom-4 right-6 bg-black/50 text-white px-4 py-1.5 rounded-sm text-xs flex items-center gap-2 hover:bg-black/70 transition">
                  <Camera className="w-4 h-4" /> Sửa ảnh bìa
               </button>
               
               <div className="absolute -bottom-10 left-10 flex items-end gap-4">
                  <div className="relative group">
                     <img src={shopData.logo} className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover bg-white" alt="Logo" />
                     <button type="button" className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                     </button>
                  </div>
                  <div className="mb-4">
                     <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 drop-shadow-sm">
                        {shopData.shopName}
                        <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500 bg-white rounded-full" />
                     </h2>
                     <p className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-sm inline-block">Yêu thích+</p>
                  </div>
               </div>
            </div>
            <div className="h-14"></div>
         </div>

         {/* Basic Info */}
         <div className="bg-white p-8 rounded-sm shadow-sm space-y-8">
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-shopee pl-3">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Tên Shop</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition"
                    value={shopData.shopName}
                    onChange={(e) => setShopData({...shopData, shopName: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400">Tên Shop có thể chứa từ 5 đến 30 ký tự.</p>
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Mô tả Shop</label>
                  <textarea 
                    rows="3"
                    className="w-full border border-gray-200 rounded-sm px-4 py-2 text-sm focus:border-shopee outline-none transition resize-none"
                    value={shopData.description}
                    onChange={(e) => setShopData({...shopData, description: e.target.value})}
                  ></textarea>
               </div>

               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <div className="flex items-center border border-gray-200 rounded-sm px-4 py-2 text-sm focus-within:border-shopee transition bg-white">
                     <Phone className="w-4 h-4 text-gray-400 mr-3" />
                     <input 
                       type="text" 
                       className="flex-1 bg-transparent border-none outline-none"
                       value={shopData.phone}
                       onChange={(e) => setShopData({...shopData, phone: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email liên hệ</label>
                  <div className="flex items-center border border-gray-200 rounded-sm px-4 py-2 text-sm focus-within:border-shopee transition bg-white">
                     <Mail className="w-4 h-4 text-gray-400 mr-3" />
                     <input 
                       type="email" 
                       className="flex-1 bg-transparent border-none outline-none"
                       value={shopData.email}
                       onChange={(e) => setShopData({...shopData, email: e.target.value})}
                     />
                  </div>
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium text-gray-700">Địa chỉ Shop</label>
               <div className="flex items-center border border-gray-200 rounded-sm px-4 py-2 text-sm focus-within:border-shopee transition bg-white">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent border-none outline-none"
                    value={shopData.address}
                    onChange={(e) => setShopData({...shopData, address: e.target.value})}
                  />
               </div>
            </div>
         </div>

         {/* Advanced Settings Placeholder */}
         <div className="bg-white p-8 rounded-sm shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-shopee pl-3">Thiết lập nâng cao</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex items-center justify-between p-4 border border-gray-100 rounded-sm hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                     <Globe className="w-5 h-5 text-gray-400" />
                     <span className="text-sm font-medium text-gray-700">Ngôn ngữ hiển thị</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
               </div>
               <div className="flex items-center justify-between p-4 border border-gray-100 rounded-sm hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                     <Info className="w-5 h-5 text-gray-400" />
                     <span className="text-sm font-medium text-gray-700">Chế độ Tạm nghỉ</span>
                  </div>
                  <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                     <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
               </div>
            </div>
         </div>

         {/* Sticky Footer Action Bar */}
         <div className="fixed bottom-0 right-0 left-60 bg-white border-t border-gray-200 p-4 px-10 flex justify-end gap-4 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <button type="button" className="px-10 py-2 border border-gray-200 text-gray-700 rounded-sm hover:bg-gray-50 transition text-sm">Hủy</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-2 bg-shopee text-white rounded-sm font-medium hover:bg-shopee-hover transition flex items-center gap-2 disabled:opacity-50"
            >
               {loading ? 'Đang lưu...' : <><Save className="w-4 h-4" /> Lưu</>}
            </button>
         </div>
      </form>
    </div>
  );
};

export default AdminProfilePage;