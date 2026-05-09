import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBox from './components/ChatBox';

// Lazy loading components
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const RegisterVendorPage = lazy(() => import('./pages/RegisterVendorPage'));
const AuthSuccessPage = lazy(() => import('./pages/AuthSuccessPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProductPage = lazy(() => import('./pages/AdminProductPage'));
const AdminCategoryPage = lazy(() => import('./pages/AdminCategoryPage'));
const AdminOrderPage = lazy(() => import('./pages/AdminOrderPage'));
const AdminCouponPage = lazy(() => import('./pages/AdminCouponPage'));
const AdminMarketingPage = lazy(() => import('./pages/AdminMarketingPage'));
const AdminProfilePage = lazy(() => import('./pages/AdminProfilePage'));
const AdminChatPage = lazy(() => import('./pages/AdminChatPage'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="w-12 h-12 border-4 border-shopee border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Component bảo vệ Route dành cho User đã đăng nhập
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Component bảo vệ Route dành cho Admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

// Component bảo vệ Route dành cho Admin hoặc Vendor
const ManagementRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <PageLoader />;
  if (!user || (user.role !== 'admin' && user.role !== 'vendor')) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
        <Navbar />
        <Toaster position="top-right" />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-result" element={<PaymentResultPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth-success" element={<AuthSuccessPage />} />
              <Route path="/register-vendor" element={<RegisterVendorPage />} />
              
              {/* Private Routes */}
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/my-orders" element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProductPage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategoryPage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrderPage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCouponPage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/marketing" element={<AdminRoute><AdminLayout><AdminMarketingPage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/profile" element={<AdminRoute><AdminLayout><AdminProfilePage /></AdminLayout></AdminRoute>} />
              <Route path="/admin/chat" element={<ManagementRoute><AdminLayout><AdminChatPage /></AdminLayout></ManagementRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <ChatBox />
      </div>
    </Router>
  );
}

export default App;
