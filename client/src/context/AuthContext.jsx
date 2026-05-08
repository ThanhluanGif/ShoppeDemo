import React, { createContext, useState, useEffect } from 'react';
import { get } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await get('/users/profile');
      const fullUser = res.data;
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
    } catch (error) {
      console.error("Failed to fetch profile", error);
      // Optional: logout if token is invalid
    }
  };

  useEffect(() => {
    // Khôi phục trạng thái đăng nhập từ localStorage khi app khởi chạy
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      fetchProfile(); // Fetch the latest profile to get wishlist/addresses
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    fetchProfile(); // Update with full profile after login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Helper function to update user state locally (e.g. after adding to wishlist)
  const updateUserState = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserState }}>
      {children}
    </AuthContext.Provider>
  );
};
