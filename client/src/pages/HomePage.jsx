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
    <div className="bg-[#f5f5f5] min-h-screen pb-12">
      <Helmet>
        <title>ThanhLuanShop | Mua Sắm Công Nghệ Trực Tuyến</title>
        <meta name="description" content="Mua sắm điện thoại, laptop, phụ kiện công nghệ chính hãng giá tốt nhất tại ThanhLuanShop." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Hero Banner - Shopee Style */}
        {!keyword && !category && (
          <div className="flex gap-2 mb-6">
            <div className="w-full lg:w-2/3">
              <img 
                src="https://cf.shopee.vn/file/vn-50009109-170f3cc0d95d66359b35b611e9a2632b_xxhdpi" 
                alt="Banner 1" 
                className="w-full h-[235px] object-cover rounded-sm shadow-sm"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80'; }}
              />
            </div>
            <div className="hidden lg:flex w-1/3 flex-col gap-2">
              <img 
                src="https://cf.shopee.vn/file/vn-50009109-e85d0bdba92e21b24e6abdf3fc0ebfbc_xhdpi" 
                alt="Banner 2" 
                className="w-full h-[113px] object-cover rounded-sm shadow-sm"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'; }}
              />
              <img 
                src="https://cf.shopee.vn/file/vn-50009109-90d0b04a9d18db7bc9bc9edeb80c85c2_xhdpi" 
                alt="Banner 3" 
                className="w-full h-[114px] object-cover rounded-sm shadow-sm"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80'; }}
              />
            </div>
          </div>
        )}

        {/* Categories Section */}
        {!keyword && !category && categories.length > 0 && (
          <div className="bg-white mb-6 rounded-sm shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-gray-500 font-medium uppercase text-sm">Danh Mục</h2>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/?category=${cat.name}`} className="flex flex-col items-center justify-center p-4 border-r border-b border-gray-50 hover:shadow-md transition">
                  <div className="w-12 h-12 mb-2 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {/* Placeholder for category image */}
                    <img src={`https://ui-avatars.com/api/?name=${cat.name}&background=random&color=fff`} alt={cat.name} className="w-full h-full object-cover"/>
                  </div>
                  <span className="text-[13px] text-gray-700 text-center line-clamp-2">{cat.name}</span>
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
                        Đã bán {product.numReviews > 0 ? (product.numReviews * 23 > 1000 ? `${(product.numReviews * 2.3).toFixed(1)}k` : product.numReviews * 23) : Math.floor(Math.random() * 500) + 10}
                      </span>
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


