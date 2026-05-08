import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t-4 border-shopee pt-10 pb-6 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs">Chăm Sóc Khách Hàng</h3>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/" className="hover:text-shopee">Trung Tâm Trợ Giúp</Link></li>
              <li><Link to="/" className="hover:text-shopee">ThanhLuanShop Blog</Link></li>
              <li><Link to="/" className="hover:text-shopee">Hướng Dẫn Mua Hàng</Link></li>
              <li><Link to="/" className="hover:text-shopee">Hướng Dẫn Bán Hàng</Link></li>
              <li><Link to="/" className="hover:text-shopee">Thanh Toán</Link></li>
              <li><Link to="/" className="hover:text-shopee">Vận Chuyển</Link></li>
              <li><Link to="/" className="hover:text-shopee">Trả Hàng & Hoàn Tiền</Link></li>
              <li><Link to="/" className="hover:text-shopee">Chính Sách Bảo Hành</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs">Về ThanhLuanShop</h3>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/" className="hover:text-shopee">Giới Thiệu Về ThanhLuanShop Việt Nam</Link></li>
              <li><Link to="/" className="hover:text-shopee">Tuyển Dụng</Link></li>
              <li><Link to="/" className="hover:text-shopee">Điều Khoản ThanhLuanShop</Link></li>
              <li><Link to="/" className="hover:text-shopee">Chính Sách Bảo Mật</Link></li>
              <li><Link to="/" className="hover:text-shopee">Chính Hãng</Link></li>
              <li><Link to="/" className="hover:text-shopee">Kênh Người Bán</Link></li>
              <li><Link to="/" className="hover:text-shopee">Flash Sales</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs">Thanh Toán</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="bg-white p-1 shadow-sm border border-gray-200 rounded-sm w-[60px] h-[30px] flex items-center justify-center">
                <img src="https://down-vn.img.susercontent.com/file/d4bbea4570b93bfd5fc652ca8e41b59b" alt="Visa" className="max-h-full" />
              </div>
              <div className="bg-white p-1 shadow-sm border border-gray-200 rounded-sm w-[60px] h-[30px] flex items-center justify-center">
                <img src="https://down-vn.img.susercontent.com/file/a0a9062ebe19b45c1ae0506f16af5c16" alt="Mastercard" className="max-h-full" />
              </div>
              <div className="bg-white p-1 shadow-sm border border-gray-200 rounded-sm w-[60px] h-[30px] flex items-center justify-center">
                <img src="https://down-vn.img.susercontent.com/file/38fd98e55806c3b2e4535c4e4a6c4c08" alt="JCB" className="max-h-full" />
              </div>
              <div className="bg-white p-1 shadow-sm border border-gray-200 rounded-sm w-[60px] h-[30px] flex items-center justify-center">
                <img src="https://down-vn.img.susercontent.com/file/9263fa8c83628f5deff55e2a90758b06" alt="COD" className="max-h-full" />
              </div>
            </div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs mt-6">Đơn Vị Vận Chuyển</h3>
            <div className="flex flex-wrap gap-2">
              <div className="bg-white p-1 shadow-sm border border-gray-200 rounded-sm w-[60px] h-[30px] flex items-center justify-center">
                <img src="https://down-vn.img.susercontent.com/file/vn-50009109-159200e3e365de418aae52b840f24185" alt="SPX" className="max-h-full" />
              </div>
              <div className="bg-white p-1 shadow-sm border border-gray-200 rounded-sm w-[60px] h-[30px] flex items-center justify-center">
                <img src="https://down-vn.img.susercontent.com/file/59270fb2f3fbb7cbc92fca3877edde3f" alt="GHTK" className="max-h-full" />
              </div>
              <div className="bg-white p-1 shadow-sm border border-gray-200 rounded-sm w-[60px] h-[30px] flex items-center justify-center">
                <img src="https://down-vn.img.susercontent.com/file/0d349e22cb8dfc66d53071241155986d" alt="VNPost" className="max-h-full" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs">Theo Dõi Chúng Tôi Trên</h3>
            <ul className="space-y-2 text-[13px]">
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-shopee">
                  <img src="https://down-vn.img.susercontent.com/file/2277b37437aa470fd1c71127c6ff8eb5" alt="Facebook" className="w-4 h-4" />
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-shopee">
                  <img src="https://down-vn.img.susercontent.com/file/5973ebbc642ceee80a504a81203bfb91" alt="Instagram" className="w-4 h-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-shopee">
                  <img src="https://down-vn.img.susercontent.com/file/f4f86f1119712b553992a75493065d9a" alt="LinkedIn" className="w-4 h-4" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs">Tải Ứng Dụng ThanhLuanShop Ngay Thôi</h3>
            <div className="flex gap-4">
              <img src="https://down-vn.img.susercontent.com/file/a5e589c0e11205e2ed6652875b282471" alt="QR Code" className="w-[84px] h-[84px] p-1 bg-white shadow-sm border border-gray-200" />
              <div className="flex flex-col gap-2 justify-center">
                <img src="https://down-vn.img.susercontent.com/file/ad01a890521bb25591eb10a174f7678d" alt="App Store" className="h-6" />
                <img src="https://down-vn.img.susercontent.com/file/ae7dced05f7243d093179fdea20f18aa" alt="Google Play" className="h-6" />
                <img src="https://down-vn.img.susercontent.com/file/35352374f39bdd03b25e7b83542b2cb0" alt="App Gallery" className="h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500">
          <p>© 2026 ThanhLuanShop. Tất cả các quyền được bảo lưu.</p>
          <p className="mt-2 md:mt-0">Quốc gia & Khu vực: Singapore | Indonesia | Đài Loan | Thái Lan | Malaysia | Việt Nam | Philippines | Brazil | México | Colombia | Chile</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
