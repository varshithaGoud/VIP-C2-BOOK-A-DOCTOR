import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        role: data.role,
        profileImage: data.profileImage,
        isVerified: data.isVerified,
        approved: data.approved
      }));

      setToken(data.token);
      setUser(data);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await authService.register(formData);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      }));

      setToken(data.token);
      setUser(data);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile'); // wait, we can import authService.getProfile or call it directly
      const profileUser = data.user;
      
      const updatedUser = {
        ...user,
        name: profileUser.name,
        email: profileUser.email,
        phone: profileUser.phone,
        gender: profileUser.gender,
        profileImage: profileUser.profileImage,
        isVerified: profileUser.isVerified
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data;
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const updateUser = (updatedUserData) => {
    const merged = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
