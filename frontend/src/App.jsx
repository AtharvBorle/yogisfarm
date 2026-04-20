import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Category from './pages/Category';
import Brands from './pages/Brands';
import Deals from './pages/Deals';
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';
import OrderSuccess from './pages/OrderSuccess';
import Invoice from './pages/Invoice';

// Delivery Portal Pages
import DeliveryLogin from './pages/delivery/Login';
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryOrderDetails from './pages/delivery/OrderDetails';

function App() {
  const [showScroll, setShowScroll] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const location = useLocation();
  const isDeliveryRoute = location.pathname.startsWith('/delivery');

  return (
    <>
      {isPreloading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#fff', zIndex: 99999999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/assets/imgs/theme/loader.gif" alt="Loading Yogis Farm..." style={{ width: '150px' }} />
        </div>
      )}

      {!isDeliveryRoute && <Header />}
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/category" element={<Category />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="/invoice/:orderNumber" element={<Invoice />} />
          
          {/* Delivery Portal Routes */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/order/:id" element={<DeliveryOrderDetails />} />
        </Routes>
      </main>
      {!isDeliveryRoute && <Footer />}
      
      {showScroll && !isDeliveryRoute && (
        <a id="scrollUp" href="#top" style={{ position: 'fixed', zIndex: 2147483647, display: 'block' }} onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
          <i className="fi-rs-arrow-up"></i>
        </a>
      )}
    </>
  );
}

export default App;
