import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Slider from './pages/Slider';
import Category from './pages/Category';
import Brand from './pages/Brand';
import Product from './pages/Product';
import Order from './pages/Order';
import Section from './pages/Section';
import Tax from './pages/Tax';
import Contact from './pages/Contact';
import Filemanager from './pages/Filemanager';
import Coupon from './pages/Coupon';
import Profile from './pages/Profile';

function App() {
  const { admin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={admin ? <AdminLayout><Dashboard /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/sliders" element={admin ? <AdminLayout><Slider /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/categories" element={admin ? <AdminLayout><Category /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/brands" element={admin ? <AdminLayout><Brand /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/products" element={admin ? <AdminLayout><Product /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/orders" element={admin ? <AdminLayout><Order /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/sections" element={admin ? <AdminLayout><Section /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/taxes" element={admin ? <AdminLayout><Tax /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/contacts" element={admin ? <AdminLayout><Contact /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/filemanager" element={admin ? <AdminLayout><Filemanager /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/coupons" element={admin ? <AdminLayout><Coupon /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/profile" element={admin ? <AdminLayout><Profile /></AdminLayout> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
