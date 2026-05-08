import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthSuccessPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userDataStr = params.get('user');

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        login(userData, token);
        navigate('/');
      } catch (err) {
        console.error('Failed to parse user data from social login', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [location, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 font-medium">Đang xác thực tài khoản...</p>
    </div>
  );
};

export default AuthSuccessPage;
