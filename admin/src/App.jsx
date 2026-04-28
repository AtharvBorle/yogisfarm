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
import Shipping from './pages/Shipping';
import Contact from './pages/Contact';
import Filemanager from './pages/Filemanager';
import Coupon from './pages/Coupon';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
import Invoice from './pages/Invoice';
import Review from './pages/Review';
import Collections from './pages/Collections';
import Logs from './pages/Logs';

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
      <Route path="/orders/detail/:orderNumber" element={admin ? <AdminLayout><OrderDetail /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/orders/invoice/:orderNumber" element={admin ? <Invoice /> : <Navigate to="/login" />} />
      <Route path="/sections" element={admin ? <AdminLayout><Section /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/taxes" element={admin ? <AdminLayout><Tax /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/shipping" element={admin ? <AdminLayout><Shipping /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/collections" element={admin ? <AdminLayout><Collections /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/contacts" element={admin ? <AdminLayout><Contact /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/filemanager" element={admin ? <AdminLayout><Filemanager /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/coupons" element={admin ? <AdminLayout><Coupon /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/reviews" element={admin ? <AdminLayout><Review /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/logs" element={admin ? <AdminLayout><Logs /></AdminLayout> : <Navigate to="/login" />} />
      <Route path="/profile" element={admin ? <AdminLayout><Profile /></AdminLayout> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
