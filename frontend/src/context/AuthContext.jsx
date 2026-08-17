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
      try {
        const savedToken = localStorage.getItem('docpilot_token');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && !savedToken) {
          const email = session.user.email;
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email?.split('@')[0];
          if (email) {
            const res = await api.post('/auth/google', { email, name, googleId: session.user.id });
            const { token: newToken, user: userData } = res.data;
            localStorage.setItem('docpilot_token', newToken);
            localStorage.setItem('docpilot_user', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
            setLoading(false);
            return;
          }
        }

        if (savedToken) {
          try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            setToken(savedToken);
          } catch (err) {
            console.error('[Auth Init Error]:', err);
            await logout();
          }
        }
      } catch (err) {
        console.error('[Init Auth Failure]:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const savedToken = localStorage.getItem('docpilot_token');
        if (!savedToken) {
          const email = session.user.email;
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email?.split('@')[0];
          if (email) {
            try {
              const res = await api.post('/auth/google', { email, name, googleId: session.user.id });
              const { token: newToken, user: userData } = res.data;
              localStorage.setItem('docpilot_token', newToken);
              localStorage.setItem('docpilot_user', JSON.stringify(userData));
              setToken(newToken);
              setUser(userData);
            } catch (err) {
              console.error('[Supabase OAuth Sync Error]:', err);
            }
          }
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (redirectTo) => {
    const targetRedirect = redirectTo || `${window.location.origin}/login`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetRedirect,
      },
    });
    if (error) throw error;
    return data;
  };

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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase SignOut Warning]:', err);
    }
    localStorage.removeItem('docpilot_token');
    localStorage.removeItem('docpilot_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginWithGoogle,
        sendVerificationLink,
        confirmEmail,
        resendVerificationLink,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

