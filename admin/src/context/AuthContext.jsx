import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);

  const fetchAdmin = async () => {
    try {
      const { data } = await api.get('/me');
      if (data.status && data.admin) {
        setAdmin(data.admin);
        if (data.remainingTime) {
          setSessionExpiry(Date.now() + data.remainingTime);
          setSessionTimeLeft(data.remainingTime);
        }
      } else {
        setAdmin(null);
        setSessionExpiry(null);
        setSessionTimeLeft(null);
      }
    } catch (error) {
      setAdmin(null);
      setSessionExpiry(null);
      setSessionTimeLeft(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  useEffect(() => {
    if (!admin || !sessionExpiry) return;

    const tick = () => {
      const timeLeft = sessionExpiry - Date.now();
      if (timeLeft <= 0) {
        setSessionTimeLeft(0);
        logout();
      } else {
        setSessionTimeLeft(timeLeft);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [admin, sessionExpiry]);

  const login = (adminData) => {
    setAdmin(adminData);
    const tenHours = 10 * 60 * 60 * 1000;
    setSessionExpiry(Date.now() + tenHours); // 10 hours
    setSessionTimeLeft(tenHours);
  };

  const logout = async () => {
    setAdmin(null);
    setSessionExpiry(null);
    setSessionTimeLeft(null);
    try {
      await api.get('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, fetchAdmin, sessionTimeLeft }}>
      {children}
    </AuthContext.Provider>
  );
};
