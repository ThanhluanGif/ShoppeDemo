import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { get } from '../services/api';
import { CartContext } from '../context/CartContext';
import CountdownTimer from '../components/CountdownTimer';
import { Zap } from 'lucide-react';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get('keyword') || '';
  const category = queryParams.get('category') || '';
  const sort = queryParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const { data } = await get('/products/flashsale');
        setFlashSaleProducts(data);
      } catch (error) {
        console.error('Error fetching flash sale products:', error);
      }
    };
    fetchFlashSale();
    
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
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/products?sort=${sort}`;
        if (keyword) url += `&keyword=${keyword}`;
        if (category) url += `&category=${category}`;
        
        const { data } = await get(url);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, sort]);

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-12 font-sans">
      <Helmet>
        <title>ThanhLuanShop | Premium Tech Store</title>
        <meta name="description" content="Mua sắm điện thoại, laptop, phụ kiện công nghệ chính hãng giá tốt nhất tại ThanhLuanShop." />
      </Helmet>

      {/* Hero Section - Redesigned with Premium Dark Gradient */}
      {!keyword && !category && (
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#f5f5f5] pt-6 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Banner Slider Placeholder */}
              <div className="w-full lg:w-2/3 relative group overflow-hidden rounded-md shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop" 
                  alt="Premium Tech Hero" 
                  className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12">
                   <span className="text-shopee font-bold tracking-widest text-sm mb-2 uppercase">Sự kiện công nghệ 2026</span>
                   <h2 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-md">
                      Nâng Tầm Trải Nghiệm Số
                   </h2>
                   <p className="text-gray-300 mt-4 max-w-sm text-sm md:text-base">Khám phá bộ sưu tập thiết bị cao cấp nhất. Giảm giá tới 40% cho các dòng máy mới nhất.</p>
                   <button className="mt-8 bg-shopee text-white px-8 py-3 rounded-sm font-bold w-fit hover:bg-shopee-hover transition shadow-lg shadow-shopee/20 uppercase tracking-wider text-sm">Khám Phá Ngay</button>
                </div>
              </div>

              {/* Side Banners */}
              <div className="hidden lg:flex w-1/3 flex-col gap-4">
                <div className="relative flex-1 rounded-md overflow-hidden shadow-xl group">
                   <img 
                    src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1000&auto=format&fit=crop" 
                    alt="Side Banner 1" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                   <div className="absolute bottom-6 left-6">
                      <p className="text-white font-bold text-lg">Phụ Kiện Apple</p>
                      <span className="text-shopee text-xs font-bold uppercase">Mua 1 Tặng 1</span>
                   </div>
                </div>
                <div className="relative flex-1 rounded-md overflow-hidden shadow-xl group">
                   <img 
                    src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1000&auto=format&fit=crop" 
                    alt="Side Banner 2" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                   <div className="absolute bottom-6 left-6">
                      <p className="text-white font-bold text-lg">Laptop Gaming</p>
                      <span className="text-shopee text-xs font-bold uppercase">Giảm 5 Triệu</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Categories Section - Improved with Premium Icons */}
        {!keyword && !category && categories.length > 0 && (
          <div className="bg-white mb-6 rounded-sm shadow-sm border border-gray-100 -mt-8 relative z-10 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-gray-800 font-bold uppercase text-sm tracking-wide flex items-center gap-2">
                 <div className="w-1 h-4 bg-shopee"></div>
                 Danh Mục Nổi Bật
              </h2>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/?category=${cat.name}`} className="flex flex-col items-center justify-center p-5 border-r border-b border-gray-50 hover:bg-gray-50/80 group transition">
                  <div className="w-14 h-14 mb-3 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-shopee group-hover:scale-110 transition-all shadow-sm">
                    <img 
                      src={cat.image || `https://ui-avatars.com/api/?name=${cat.name}&background=ee4d2d&color=fff&size=128`} 
                      alt={cat.name} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${cat.name}&background=ee4d2d&color=fff&size=128`; }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 text-center line-clamp-2 px-1 group-hover:text-shopee">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Flash Sale */}
        {flashSaleProducts.length > 0 && !keyword && !category && (
          <div className="bg-white mb-6 rounded-sm shadow-sm">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-4">
              <div className="flex items-center text-shopee">
                <Zap className="w-6 h-6 fill-current" />
                <h2 className="text-xl font-bold italic uppercase ml-1 tracking-tighter">Flash Sale</h2>
              </div>
              <CountdownTimer targetDate={flashSaleProducts[0].flashSaleEndTime} />
              <Link to="/" className="ml-auto text-sm text-gray-500 hover:text-shopee flex items-center">
                Xem tất cả <span className="ml-1">❯</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 p-4 gap-4">
              {flashSaleProducts.slice(0, 6).map((p) => (
                <Link key={p._id} to={`/product/${p._id}`} className="group relative">
                  <div className="aspect-square relative mb-2 bg-gray-50">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute top-0 right-0 bg-yellow-400 text-shopee text-[10px] font-bold px-1 py-0.5">
                      -{Math.round(((p.price - p.flashSalePrice) / p.price) * 100)}%
                    </div>
                    {/* Shopee Mall tag */}
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-1 font-medium rounded-br-lg">
                      Mall
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-shopee font-medium text-lg leading-none block mb-1">
                      <span className="text-xs align-top">₫</span>{p.flashSalePrice.toLocaleString('vi-VN')}
                    </span>
                    <div className="w-full bg-red-200 rounded-full h-3.5 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute top-0 left-0 h-full bg-shopee w-[80%]"></div>
                      <span className="relative z-10 text-white text-[10px] font-bold uppercase drop-shadow-md">Đã bán {p.numReviews * 15 + 12}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Daily Discover / Search Results */}
        <div className="sticky top-[80px] z-40 bg-white border-b-4 border-shopee mb-4 flex flex-col shadow-sm">
          <div className="w-full text-center py-4 bg-white text-shopee font-medium uppercase tracking-wider text-base border-b border-gray-100">
            {keyword ? `Kết quả tìm kiếm cho "${keyword}"` : category ? `Danh mục: ${category}` : 'Gợi ý hôm nay'}
          </div>
          
          {/* Filter Tabs - Shopee Style */}
          <div className="flex items-center px-4 py-3 bg-gray-50/50 text-sm">
            <span className="text-gray-500 mr-4">Sắp xếp theo</span>
            <div className="flex gap-2">
              <Link to={`/?${keyword ? `keyword=${keyword}&` : ''}${category ? `category=${category}&` : ''}sort=newest`} className={`px-4 py-2 bg-white border ${sort === 'newest' ? 'bg-shopee text-white border-shopee' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} rounded-sm transition`}>Mới nhất</Link>
              <Link to={`/?${keyword ? `keyword=${keyword}&` : ''}${category ? `category=${category}&` : ''}sort=popular`} className={`px-4 py-2 bg-white border ${sort === 'popular' ? 'bg-shopee text-white border-shopee' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} rounded-sm transition`}>Bán chạy</Link>
              <select 
                className={`px-4 py-2 bg-white border ${(sort === 'price_asc' || sort === 'price_desc') ? 'bg-shopee text-white border-shopee' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} rounded-sm transition outline-none cursor-pointer`}
                value={sort === 'price_asc' || sort === 'price_desc' ? sort : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    navigate(`/?${keyword ? `keyword=${keyword}&` : ''}${category ? `category=${category}&` : ''}sort=${e.target.value}`);
                  }
                }}
              >
                <option value="" disabled>Giá</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white animate-pulse h-[300px]"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {products.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`} className="bg-white hover:border-shopee border border-transparent transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md flex flex-col relative group">
                <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  {product.isFlashSale && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-shopee text-[11px] font-bold px-1.5 py-0.5 flex flex-col items-center leading-tight">
                      <span>-{Math.round(((product.price - product.flashSalePrice) / product.price) * 100)}%</span>
                      <span className="text-[9px] font-normal uppercase text-white bg-shopee px-1 mt-0.5">Giảm</span>
                    </div>
                  )}
                  {/* Mall Tag */}
                  <div className="absolute top-1 left-[-2px] bg-red-600 text-white text-[10px] px-1 font-medium rounded-r-sm shadow-sm z-10 before:content-[''] before:absolute before:bottom-[-2px] before:left-0 before:border-t-[2px] before:border-t-red-800 before:border-l-[2px] before:border-l-transparent">
                    Mall
                  </div>
                  {/* Find Similar overlay on hover */}
                  <div className="absolute bottom-0 w-full bg-shopee text-white text-center py-1 text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">
                    Tìm sản phẩm tương tự
                  </div>
                </div>
                <div className="p-2 flex flex-col flex-1">
                  <h3 className="text-xs text-gray-800 mb-1 line-clamp-2 h-8 leading-tight">
                    {product.name}
                  </h3>
                  <div className="mt-auto">
                    {/* Price and Sold */}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-shopee font-medium text-base">
                        <span className="text-[10px] align-top">₫</span>
                        {product.isFlashSale ? product.flashSalePrice.toLocaleString('vi-VN') : product.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Đã bán {product.numReviews > 0 ? (product.numReviews * 23 > 1000 ? `${(product.numReviews * 2.3).toFixed(1)}k` : product.numReviews * 23) : (parseInt(product._id.slice(-4), 16) % 400) + 50}
                      </span>
                    </div>
                    {/* Location */}
                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                       {product.vendor?.addresses?.[0]?.city || 'Hà Nội'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white shadow-sm flex flex-col items-center justify-center">
            <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/search/a60759ad1dabe909c46a817ecbf71878.png" alt="No results" className="w-32 mb-4 opacity-70" />
            <p className="text-base text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;


