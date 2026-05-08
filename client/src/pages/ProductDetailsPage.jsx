import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star, ShieldCheck, Truck, Heart, MessageCircle, ChevronRight, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { get, post } from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user, updateUserState } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      const { data } = await get(`/products/${id}`);
      setProduct(data);
      if (data.variations && data.variations.length > 0) {
        setSelectedVariation(data.variations[0]);
      }

      // Check purchase history if user is logged in
      if (user) {
         try {
           const { data: orders } = await get('/orders/myorders');
           const purchased = orders.some(order => 
             order.orderItems.some(item => (item.product?._id || item.product) === id)
           );
           setHasPurchased(purchased);
         } catch (err) {
           console.error('Error checking purchase history:', err);
         }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, user]);

  const handleAddToCart = (isBuyNow = false) => {
    if (product) {
      const itemToCart = {
        ...product,
        selectedVariation: selectedVariation || null,
        price: selectedVariation ? product.price + selectedVariation.extraPrice : product.price
      };
      addToCart(itemToCart, quantity);
      if (isBuyNow) {
        navigate('/cart');
      } else {
        alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await post('/users/wishlist', { productId: id });
      updateUserState({ wishlist: data.wishlist });
    } catch (error) {
      console.error('Wishlist error', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      await post(`/products/${id}/reviews`, { rating, comment });
      alert('Cảm ơn bạn đã đánh giá!');
      setComment('');
      fetchProduct();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-shopee font-bold">Đang tải dữ liệu...</div>;
  if (!product) return <div className="p-20 text-center bg-gray-50 flex flex-col items-center">
    <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
    <p className="text-gray-500 text-xl font-medium">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
    <Link to="/" className="mt-4 text-shopee font-bold hover:underline">Quay lại trang chủ</Link>
  </div>;

  const isWishlisted = user?.wishlist?.some(item => (typeof item === 'string' ? item : item._id) === id);
  const basePrice = product.price;
  const currentPrice = selectedVariation ? basePrice + selectedVariation.extraPrice : basePrice;
  const stockCount = selectedVariation ? selectedVariation.countInStock : product.countInStock;

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-12 font-sans">
      <Helmet>
        <title>{product.name} | ThanhLuanShop</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Purchase Badge */}
        {hasPurchased && (
          <div className="bg-green-50 border border-green-200 p-3 mb-4 rounded-sm flex items-center gap-2 text-green-700 text-sm animate-in fade-in slide-in-from-top-2">
             <CheckCircle className="w-5 h-5" />
             <span className="font-bold">Bạn đã mua sản phẩm này.</span>
             <span className="text-gray-500 text-xs">Hãy để lại đánh giá để giúp người mua khác nhé!</span>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-5">
          <Link to="/" className="text-blue-700 hover:text-shopee">thanhluan shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500 line-clamp-1">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-sm shadow-sm flex flex-col lg:flex-row p-4 gap-10">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="aspect-square bg-gray-50 relative group cursor-zoom-in overflow-hidden border border-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
              {product.isFlashSale && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-shopee text-xs font-bold px-2 py-1 flex flex-col items-center">
                  <span>-{Math.round(((product.price - product.flashSalePrice) / product.price) * 100)}%</span>
                  <span className="text-[10px] font-normal uppercase text-white bg-shopee px-1">Giảm</span>
                </div>
              )}
            </div>
            
            {/* Share & Wishlist */}
            <div className="mt-6 flex items-center justify-center gap-10">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <Share2 className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Chia sẻ:</span>
                {/* Social icons placeholder */}
                <div className="flex gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                  <div className="w-6 h-6 rounded-full bg-cyan-400"></div>
                  <div className="w-6 h-6 rounded-full bg-red-500"></div>
                </div>
              </div>
              <div className="h-4 border-l border-gray-200"></div>
              <button 
                onClick={handleToggleWishlist}
                className="flex items-center gap-2 group transition"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-shopee text-shopee' : 'text-shopee'}`} />
                <span className="text-sm">{isWishlisted ? 'Đã thích' : 'Yêu thích'} ({product.numReviews + (isWishlisted ? 125 : 124)})</span>
              </button>
            </div>
          </div>

          {/* Right: Info & Purchase */}
          <div className="flex-1 flex flex-col">
            {/* Header Info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white text-[10px] font-bold px-1 rounded-sm uppercase tracking-tighter">Mall</span>
              <h1 className="text-xl font-medium text-gray-800 leading-tight line-clamp-2">
                {product.name}
              </h1>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-2 divide-x divide-gray-200">
              <div className="flex items-center gap-1">
                <span className="text-shopee border-b border-shopee font-medium">{product.rating.toFixed(1)}</span>
                <div className="flex text-shopee">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-current' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="pl-4">
                <span className="text-gray-800 font-medium border-b border-gray-800">{product.numReviews}</span>
                <span className="text-sm text-gray-500 ml-1">Đánh giá</span>
              </div>
              <div className="pl-4">
                <span className="text-gray-800 font-medium">{product.numReviews * 23 + 45}</span>
                <span className="text-sm text-gray-500 ml-1">Đã bán</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#fafafa] mt-4 p-4 flex items-center gap-4">
              {product.isFlashSale ? (
                <>
                  <span className="text-gray-400 line-through text-base">₫{product.price.toLocaleString('vi-VN')}</span>
                  <span className="text-shopee text-3xl font-medium">₫{product.flashSalePrice.toLocaleString('vi-VN')}</span>
                  <span className="bg-shopee text-white text-[10px] font-bold px-1 rounded-sm uppercase">GIẢM {Math.round(((product.price - product.flashSalePrice) / product.price) * 100)}%</span>
                </>
              ) : (
                <span className="text-shopee text-3xl font-medium">₫{currentPrice.toLocaleString('vi-VN')}</span>
              )}
            </div>

            {/* Delivery */}
            <div className="mt-8 space-y-6 px-2">
              <div className="flex gap-10">
                <span className="w-24 text-sm text-gray-500 shrink-0">Vận Chuyển</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-gray-800 font-medium">Miễn phí vận chuyển</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 ml-7">Miễn phí vận chuyển cho đơn hàng từ ₫50.000</span>
                  </div>
                </div>
              </div>

              {/* Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="flex gap-10">
                  <span className="w-24 text-sm text-gray-500 shrink-0">Phân Loại</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variations.map((v) => (
                      <button
                        key={v._id}
                        onClick={() => setSelectedVariation(v)}
                        className={`min-w-[80px] px-3 py-1.5 border rounded-sm text-sm transition-all ${
                          selectedVariation?._id === v._id 
                            ? 'border-shopee text-shopee relative after:content-[""] after:absolute after:bottom-0 after:right-0 after:border-[8px] after:border-shopee after:border-l-transparent after:border-t-transparent' 
                            : 'border-gray-200 hover:border-shopee hover:text-shopee text-gray-700'
                        }`}
                      >
                        {v.size || v.color}
                        {selectedVariation?._id === v._id && <Star className="absolute bottom-0 right-0 w-2 h-2 text-white z-10" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-10">
                <span className="w-24 text-sm text-gray-500 shrink-0">Số Lượng</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-1 text-gray-400 hover:bg-gray-50 border-r border-gray-200 text-lg"
                    >
                      -
                    </button>
                    <span className="px-5 font-medium text-gray-700">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(stockCount, q + 1))}
                      className="px-3 py-1 text-gray-400 hover:bg-gray-50 border-l border-gray-200 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{stockCount} sản phẩm có sẵn</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => handleAddToCart(false)}
                disabled={stockCount <= 0}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-shopee bg-[#ff57221a] text-shopee font-medium rounded-sm hover:bg-[#ff57222a] transition w-60 disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" /> Thêm Vào Giỏ Hàng
              </button>
              <button 
                onClick={() => handleAddToCart(true)}
                disabled={stockCount <= 0}
                className="px-10 py-3 bg-shopee text-white font-medium rounded-sm hover:bg-shopee-hover transition shadow-sm w-44 disabled:bg-gray-300"
              >
                Mua Ngay
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-8">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-shopee" />
                <span className="text-sm text-gray-700">thanhluan shop Đảm Bảo</span>
              </div>
              <span className="text-xs text-gray-500">3 Ngày Trả Hàng / Hoàn Tiền</span>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          {/* Main Info */}
          <div className="flex-1 space-y-6">
            {/* Detailed Description */}
            <div className="bg-white p-6 rounded-sm shadow-sm">
              <h3 className="bg-[#fafafa] p-4 text-lg font-medium text-gray-800 uppercase tracking-tight mb-6">Chi tiết sản phẩm</h3>
              <div className="px-4 space-y-4">
                <div className="flex gap-10">
                  <span className="w-32 text-sm text-gray-500">Danh Mục</span>
                  <span className="text-sm text-blue-700 font-medium">{product.category?.name || 'Công nghệ'}</span>
                </div>
                <div className="flex gap-10">
                  <span className="w-32 text-sm text-gray-500">Thương Hiệu</span>
                  <span className="text-sm text-blue-700 font-medium">{product.brand}</span>
                </div>
                <div className="flex gap-10">
                  <span className="w-32 text-sm text-gray-500">Kho</span>
                  <span className="text-sm text-gray-800">{product.countInStock}</span>
                </div>
                <div className="flex gap-10">
                  <span className="w-32 text-sm text-gray-500">Gửi từ</span>
                  <span className="text-sm text-gray-800">Quận 1, TP. Hồ Chí Minh</span>
                </div>
              </div>

              <h3 className="bg-[#fafafa] p-4 text-lg font-medium text-gray-800 uppercase tracking-tight mt-10 mb-6">Mô tả sản phẩm</h3>
              <div className="px-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white p-6 rounded-sm shadow-sm">
              <h3 className="bg-[#fafafa] p-4 text-lg font-medium text-gray-800 uppercase tracking-tight mb-6">Đánh giá sản phẩm</h3>
              
              {/* Review Header Stats */}
              <div className="bg-[#fffbf8] border border-[#f9ede5] p-8 rounded-sm mb-6 flex items-center gap-12">
                <div className="text-center">
                  <div className="text-shopee text-3xl font-medium"><span className="text-4xl">{product.rating.toFixed(1)}</span> trên 5</div>
                  <div className="flex text-shopee justify-center mt-2 scale-125">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {['Tất Cả', '5 Sao', '4 Sao', '3 Sao', '2 Sao', '1 Sao', 'Có Bình Luận', 'Có Hình Ảnh / Video'].map((tag, i) => (
                    <button key={i} className={`px-4 py-1.5 border text-sm rounded-sm ${i === 0 ? 'border-shopee text-shopee bg-white' : 'border-gray-200 bg-white text-gray-800 hover:border-shopee'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              {product.reviews.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {product.reviews.map((review, idx) => (
                    <div key={review._id} className="py-6 flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${review.name}&background=random`} alt={review.name} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">{review.name}</p>
                        <div className="flex text-shopee mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 mb-3">{new Date(review.createdAt).toLocaleString('vi-VN')}</p>
                        <p className="text-sm text-gray-800 leading-relaxed mb-4">{review.comment}</p>
                        <div className="flex gap-4">
                          <button className="text-xs text-gray-400 flex items-center gap-1 hover:text-shopee"><Heart className="w-3 h-3" /> {(review._id ? parseInt(review._id.slice(-1), 16) : idx) % 15 + 5}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Input Section */}
              <div className="mt-10 pt-10 border-t border-gray-100">
                <h4 className="text-lg font-bold text-gray-800 mb-6">Viết đánh giá của bạn</h4>
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Đánh giá chung</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1 transition-colors ${rating >= star ? 'text-shopee' : 'text-gray-300'}`}
                          >
                            <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        rows="4"
                        className="w-full border border-gray-200 rounded-sm p-4 text-sm focus:border-shopee outline-none transition"
                        placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này nhé..."
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      disabled={submittingReview}
                      className="bg-shopee text-white px-8 py-3 rounded-sm font-medium hover:bg-shopee-hover transition shadow-sm disabled:opacity-50"
                    >
                      {submittingReview ? 'Đang gửi...' : 'Hoàn thành đánh giá'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-sm text-center">
                    <p className="text-gray-600 text-sm mb-4">Vui lòng đăng nhập để gửi đánh giá của bạn.</p>
                    <Link to="/login" className="bg-shopee text-white px-6 py-2 rounded-sm text-sm font-medium">Đăng Nhập Ngay</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sidebar / Shop Info */}
          <div className="w-full lg:w-80 shrink-0">
             <div className="bg-white p-4 rounded-sm shadow-sm sticky top-[150px]">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                   <div className="w-12 h-12 rounded-full bg-shopee flex items-center justify-center text-white font-black text-lg">TLS</div>
                   <div>
                      <p className="text-sm font-medium text-gray-800 uppercase">thanhluan shop</p>
                      <p className="text-[10px] text-gray-500">Online 5 phút trước</p>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Đánh Giá</span>
                      <span className="text-shopee font-medium">4.9k</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Sản Phẩm</span>
                      <span className="text-shopee font-medium">256</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Tỉ Lệ Phản Hồi</span>
                      <span className="text-shopee font-medium">98%</span>
                   </div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                   <button className="w-full py-2 border border-shopee text-shopee text-sm font-medium rounded-sm hover:bg-[#ff572210]">Xem Shop</button>
                   <button className="w-full py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-50">Chat Ngay</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
