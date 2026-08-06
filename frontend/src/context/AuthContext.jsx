import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('docpilot_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            const gUser = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
              picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
            };
            setUser(gUser);
            setToken(session.access_token);
            localStorage.setItem('docpilot_token', session.access_token);
            localStorage.setItem('docpilot_user', JSON.stringify(gUser));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[Supabase Session Error]:', err);
        }
      }

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

    const { data: authListener } = supabase?.auth?.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        const gUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        };
        setUser(gUser);
        setToken(session.access_token);
        localStorage.setItem('docpilot_token', session.access_token);
        localStorage.setItem('docpilot_user', JSON.stringify(gUser));
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
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

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Google OAuth Direct Redirect]:', err?.message);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://truairxifuovxhyvrqjs.supabase.co';
      window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/dashboard')}`;
    }
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('docpilot_token');
    localStorage.removeItem('docpilot_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, sendVerificationLink, confirmEmail, resendVerificationLink, loginUser, registerUser, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
