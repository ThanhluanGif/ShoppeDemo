import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBox from './components/ChatBox';
import AdminProductPage from './pages/AdminProductPage';
import AdminCategoryPage from './pages/AdminCategoryPage';
import AdminOrderPage from './pages/AdminOrderPage';
import AdminCouponPage from './pages/AdminCouponPage';
import AdminMarketingPage from './pages/AdminMarketingPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentResultPage from './pages/PaymentResultPage';
import RegisterVendorPage from './pages/RegisterVendorPage';

import ProfilePage from './pages/ProfilePage';

// Component bảo vệ Route dành cho User đã đăng nhập
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Component bảo vệ Route dành cho Admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (!user || user.role !== 'admin') {
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

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={<Navigate to="/admin/dashboard" replace />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminProductPage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminCategoryPage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminOrderPage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/coupons" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminCouponPage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/marketing" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminMarketingPage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminProfilePage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ChatBox />
      </div>
    </Router>
  );
}

export default App;
