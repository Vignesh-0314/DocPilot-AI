import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('docpilot_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('docpilot_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setToken(savedToken);
        } catch (err) {
          console.error('[Auth Init Error]:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const sendVerificationLink = async (name, email, password) => {
    const res = await api.post('/auth/send-verification-link', { name, email, password });
    return res.data;
  };

  const confirmEmail = async (email, token) => {
    const res = await api.post('/auth/confirm-email', { email, token });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('docpilot_token', newToken);
    localStorage.setItem('docpilot_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const resendVerificationLink = async (email) => {
    const res = await api.post('/auth/resend-verification-link', { email });
    return res.data;
  };

  const loginUser = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('docpilot_token', newToken);
    localStorage.setItem('docpilot_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const registerUser = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('docpilot_token', newToken);
    localStorage.setItem('docpilot_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('docpilot_token');
    localStorage.removeItem('docpilot_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, sendVerificationLink, confirmEmail, resendVerificationLink, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
