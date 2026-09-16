import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import NotificationToast from '../components/NotificationToast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const INACTIVITY_LIMIT = 15 * 60 * 1000;

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (sessionStorage.getItem('meditrack_token')) {
      timeoutRef.current = setTimeout(() => {
        showToast('Session expired due to inactivity for data privacy.', 'error');
        logout();
      }, INACTIVITY_LIMIT);
    }
  };

  useEffect(() => {
    const savedUser = sessionStorage.getItem('meditrack_user');
    const token = sessionStorage.getItem('meditrack_token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          sessionStorage.setItem('meditrack_user', JSON.stringify(res.data.user));
          resetTimer();
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleActivity = () => resetTimer();
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, []);

  const login = async (usernameOrEmail, password, adminKey = '') => {
    const res = await api.post('/auth/login', { usernameOrEmail, password, adminKey });
    if (res.data.success) {
      sessionStorage.setItem('meditrack_token', res.data.token);
      sessionStorage.setItem('meditrack_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      resetTimer();
      showToast(`Welcome back, ${res.data.user.fullName}!`, 'success');
    }
    return res.data;
  };

  const logout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    sessionStorage.removeItem('meditrack_token');
    sessionStorage.removeItem('meditrack_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, showToast }}>
      {children}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </AuthContext.Provider>
  );
};