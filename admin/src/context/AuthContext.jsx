import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);

  const fetchAdmin = async () => {
    try {
      const { data } = await api.get('/me');
      if (data.status && data.admin) {
        setAdmin(data.admin);
        if (data.remainingTime) {
          setSessionTimeLeft(data.remainingTime);
        }
      } else {
        setAdmin(null);
        setSessionTimeLeft(null);
      }
    } catch (error) {
      setAdmin(null);
      setSessionTimeLeft(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  useEffect(() => {
    if (!admin || sessionTimeLeft === null) return;

    if (sessionTimeLeft <= 0) {
      logout();
      return;
    }

    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          logout();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [admin, sessionTimeLeft]);

  const login = (adminData) => {
    setAdmin(adminData);
    setSessionTimeLeft(10 * 60 * 60 * 1000); // 10 hours
  };

  const logout = async () => {
    setAdmin(null);
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
