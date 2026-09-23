import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import NotificationToast from '../components/NotificationToast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // 15 Minutes = 900 Seconds
  const SESSION_DURATION = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  // Load configured timeout from server settings (Default: 15 mins)
  const [timeoutMinutes, setTimeoutMinutes] = useState(15);
  const [isAutoLogoutEnabled, setIsAutoLogoutEnabled] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const s = res.data.data?.settings;
        if (s) {
          setTimeoutMinutes(s.inactivity_timeout || 15);
          setIsAutoLogoutEnabled(Boolean(s.auto_logout_enabled));
          setTimeLeft((s.inactivity_timeout || 15) * 60);
        }
      })
      .catch(() => {});
  }, [user]);
  
  const toastTimerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Reset timer on user activity (mouse movement, keystroke, click)
  const resetActivityTimer = () => {
    if (sessionStorage.getItem('meditrack_token')) {
      setTimeLeft(SESSION_DURATION);
    }
  };

  // Countdown clock running every 1 second
  useEffect(() => {
    if (user) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            showToast('Session expired due to 15 minutes of inactivity for patient privacy.', 'error');
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [user]);

  // Listen to user activity to reset countdown
  useEffect(() => {
    const savedUser = sessionStorage.getItem('meditrack_user');
    const token = sessionStorage.getItem('meditrack_token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          sessionStorage.setItem('meditrack_user', JSON.stringify(res.data.user));
          resetActivityTimer();
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleEvent = () => resetActivityTimer();
    events.forEach((e) => window.addEventListener(e, handleEvent));

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleEvent));
    };
  }, []);

  const login = async (usernameOrEmail, password, adminKey = '') => {
    const res = await api.post('/auth/login', { usernameOrEmail, password, adminKey });
    if (res.data.success) {
      sessionStorage.setItem('meditrack_token', res.data.token);
      sessionStorage.setItem('meditrack_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      resetActivityTimer();
      showToast(`Welcome, ${res.data.user.fullName}!`, 'success');
    }
    return res.data;
  };

  const logout = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    sessionStorage.removeItem('meditrack_token');
    sessionStorage.removeItem('meditrack_user');
    setUser(null);
  };

  // Format seconds to MM:SS (e.g. 14:45)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, showToast, timeLeft, formattedTime: formatTime(timeLeft), resetActivityTimer }}>
      {children}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </AuthContext.Provider>
  );
};