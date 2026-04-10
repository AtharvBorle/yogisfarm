import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = async () => {
    try {
      const { data } = await api.get('/me');
      if (data.status && data.admin) {
        setAdmin(data.admin);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const login = (adminData) => {
    setAdmin(adminData);
  };

  const logout = async () => {
    try {
      await api.get('/logout');
      setAdmin(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, fetchAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
