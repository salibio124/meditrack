import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  // 15-minute inactivity auto-logout
  const INACTIVITY_LIMIT = 15 * 60 * 1000;

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (sessionStorage.getItem('meditrack_token')) {
      timeoutRef.current = setTimeout(() => {
        alert('Session expired due to 15 minutes of inactivity for patient data protection.');
        logout();
      }, INACTIVITY_LIMIT);
    }
  };

  useEffect(() => {
    // Read from sessionStorage (WIPED on tab close)
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};