import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          try {
            const response = await authService.getCurrentUser();
            console.log('AuthContext - getCurrentUser response:', response.data);
            setUser(response.data);
          } catch (error) {
            if (!rememberMe) {
              localStorage.removeItem('token');
            }
          }
        } else {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials, rememberMe = false) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('rememberMe', rememberMe);
    console.log('AuthContext - login response user:', response.data.user);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    setUser(null);
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const changePassword = async (passwordData) => {
    return await authService.changePassword(passwordData);
  };

  const updateUser = async (userData) => {
    console.log('🚀 AuthContext - updateUser called with:', userData);
    
    const response = await authService.updateProfile(userData);
    console.log('🚀 AuthContext - updateUser response:', response.data);
    
    // Update the user state with the new data from the response
    if (response.data && response.data.data) {
      console.log('🚀 AuthContext - Setting user from response data:', response.data.data);
      setUser(response.data.data);
    }
    
    // Also refresh user data from server to ensure we have latest data
    try {
      console.log('🚀 AuthContext - Calling getCurrentUser to refresh data...');
      const refreshResponse = await authService.getCurrentUser();
      console.log('🚀 AuthContext - getCurrentUser response:', refreshResponse.data);
      console.log('🚀 AuthContext - Customer profile from getCurrentUser:', refreshResponse.data.customerProfile);
      console.log('🚀 AuthContext - Setting refreshed user data');
      setUser(refreshResponse.data);
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
    }
    
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      resetPassword,
      changePassword,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};