import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Checkout = () => {
    const { user } = useAuth();
    const { cartItems, cartTotal, fetchCart } = useCart();
    const navigate = useNavigate();
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressEdit, setShowAddressEdit] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [termsError, setTermsError] = useState('');
    const [loading, setLoading] = useState(false);

    const shipping = cartTotal >= 500 ? 0 : 50;
    const grandTotal = cartTotal + shipping - discount;

    useEffect(() => {
        if (!user) { navigate('/login?redirect=checkout'); return; }
        if (cartItems.length === 0) { navigate('/cart'); return; }
        const fetchAddresses = async () => {
            try {
                const res = await api.get('/addresses');
                if (res.data.status && res.data.addresses.length > 0) {
                    setAddresses(res.data.addresses);
                    const def = res.data.addresses.find(a => a.isDefault) || res.data.addresses[0];
                    setSelectedAddress(def);
                }
            } catch (err) { console.error(err); }
        };
        fetchAddresses();
    }, [user, cartItems, navigate]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await api.post('/cart/coupon', { code: couponCode });
            if (res.data.status) { toast.success('Coupon applied'); setDiscount(res.data.discount || 0); }
            else { toast.error(res.data.message); }
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); setDiscount(0); }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
        if (!agreeTerms) { setTermsError('This value is required.'); return; }
        setTermsError('');
        setLoading(true);
        try {
            const res = await api.post('/orders/place', {
                addressId: selectedAddress.id,
                paymentMethod,
                couponCode: couponCode || undefined,
                orderNote: notes || undefined,
                agreeTerms: true
            });
            if (res.data.status) {
                toast.success(res.data.message);
                fetchCart();
                navigate(`/order-success/${res.data.orderNumber}`);
            } else { toast.error(res.data.message); }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
        finally { setLoading(false); }
    };

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <main className="main">
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> <Link to="/shop">Shop</Link>
                        <span></span> Payment
                    </div>
                </div>
            </div>

            <div className="container mb-80">
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#253D4E', marginBottom: '5px' }}>Payment</h1>
                <p style={{ color: '#7E7E7E', marginBottom: '30px' }}>There Are <strong style={{ color: '#253D4E' }}>{totalQuantity}</strong> Product Quantity In Your Cart</p>

                <div className="row">
                    {/* Left - Your Order */}
                    <div className="col-lg-7">
                        <div style={{ border: '1px solid #e6e6e6', borderRadius: '10px', padding: '25px', marginBottom: '30px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#253D4E', marginBottom: '20px' }}>Your Order</h4>
                            {cartItems.map(item => {
                                const price = item.variant ? (item.variant.salePrice || item.variant.price) : (item.product.salePrice || item.product.price);
                                const imgSrc = item.product.image ? (item.product.image.startsWith('/') ? `${API_BASE}${item.product.image}` : item.product.image) : '/assets/imgs/theme/placeholder.png';
                                return (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <img src={imgSrc} alt={item.product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }} />
                                        <div style={{ flex: 1 }}>
                                            <h6 style={{ fontSize: '14px', fontWeight: '600', color: '#253D4E', marginBottom: '4px' }}>{item.product.name}</h6>
                                            <div style={{ color: '#FDC040', fontSize: '12px' }}>★★★★★ <span style={{ color: '#999' }}>(0)</span></div>
                                        </div>
                                        <span style={{ color: '#7E7E7E', fontSize: '14px', marginRight: '20px' }}>x {item.quantity}</span>
                                        <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>₹{(price * item.quantity).toFixed(0)}</span>
                                    </div>
                                );
                            })}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '10px 0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>Subtotal :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '18px' }}>₹{cartTotal.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right - User Info */}
                    <div className="col-lg-5">
                        <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#253D4E', marginBottom: '15px', textAlign: 'center' }}>User Info</h4>
                        <div style={{ border: '1px solid #e6e6e6', borderRadius: '10px', padding: '0', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f0f0f0' }}>
                                <span>Name : {user?.name || 'N/A'}</span>
                                <Link to="/dashboard?tab=profile" style={{ color: '#046938', fontSize: '14px' }}>Edit</Link>
                            </div>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #f0f0f0' }}>
                                <span>Mobile No : {user?.phone || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f0f0f0' }}>
                                <span>Delivery Address : {selectedAddress ? `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state},India` : 'No address'}</span>
                                <Link to="/dashboard?tab=addresses" style={{ color: '#046938', fontSize: '14px' }}>Edit</Link>
                            </div>
                            <div style={{ display: 'flex', padding: '15px 20px', gap: '10px' }}>
                                <input type="text" placeholder="Enter Your Coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                                    style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px 15px', fontSize: '14px', outline: 'none' }} />
                                <button onClick={handleApplyCoupon}
                                    style={{ background: '#046938', color: '#fff', border: 'none', borderRadius: '5px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <i className="fi-rs-label" style={{ fontSize: '14px' }}></i> Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#253D4E', marginBottom: '20px' }}>Select Payment Method</h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
                    {/* Online */}
                    <div onClick={() => setPaymentMethod('online')}
                        style={{ width: '180px', height: '140px', border: paymentMethod === 'online' ? '2px solid #046938' : '1px solid #e6e6e6', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: paymentMethod === 'online' ? '#f0f9f4' : '#fff' }}>
                        <div style={{ fontSize: '50px', marginBottom: '8px' }}>
                            <svg width="80" height="50" viewBox="0 0 80 50"><rect fill="#046938" rx="8" width="80" height="50"/><text x="40" y="32" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold">UPI</text></svg>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#253D4E' }}>Online</span>
                    </div>
                    {/* COD */}
                    <div onClick={() => setPaymentMethod('cod')}
                        style={{ width: '180px', height: '140px', border: paymentMethod === 'cod' ? '2px solid #046938' : '1px solid #e6e6e6', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: paymentMethod === 'cod' ? '#f0f9f4' : '#fff' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <svg width="80" height="50" viewBox="0 0 80 50"><rect fill="#046938" rx="8" width="80" height="50"/><text x="40" y="32" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">COD</text></svg>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#253D4E' }}>Cash On Delivery</span>
                    </div>
                    {/* Wallet - Disabled */}
                    <div style={{ width: '180px', height: '140px', border: '1px solid #e6e6e6', borderRadius: '10px', cursor: 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, background: '#f8f8f8' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <svg width="80" height="50" viewBox="0 0 80 50"><rect fill="#046938" rx="8" width="80" height="50"/><text x="40" y="20" textAnchor="middle" fill="#fff" fontSize="24">💰</text><text x="40" y="42" textAnchor="middle" fill="#fff" fontSize="10">₹0</text></svg>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '12px', color: '#253D4E', textAlign: 'center' }}>Insufficient Wallet Balance</span>
                    </div>
                </div>

                {/* Terms */}
                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#253D4E' }}>
                        <input type="checkbox" checked={agreeTerms} onChange={e => { setAgreeTerms(e.target.checked); if (e.target.checked) setTermsError(''); }}
                            style={{ marginTop: '3px', accentColor: '#046938' }} />
                        <span>I Agree To The <a href="#" style={{ color: '#046938' }}>Terms & Conditions</a> <a href="#" style={{ color: '#046938' }}>Return, Refund And Cancellation Policy</a> & <a href="#" style={{ color: '#046938' }}>Privacy Policy</a></span>
                    </label>
                    {termsError && <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '3px', marginLeft: '22px' }}>{termsError}</div>}
                </div>

                {/* Additional Notes */}
                <h5 style={{ fontSize: '16px', fontWeight: '700', color: '#253D4E', marginBottom: '10px', marginTop: '15px' }}>Additional Notes:</h5>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Write Here"
                    style={{ width: '100%', maxWidth: '450px', border: '1px solid #e6e6e6', borderRadius: '8px', padding: '12px 15px', fontSize: '14px', minHeight: '100px', resize: 'vertical', outline: 'none', marginBottom: '25px' }} />

                {/* Complete Order */}
                <div style={{ textAlign: 'center' }}>
                    <button onClick={handlePlaceOrder} disabled={loading}
                        style={{ background: '#253D4E', color: '#fff', border: 'none', borderRadius: '5px', padding: '14px 40px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        {loading ? 'Processing...' : 'Complete Order'} <span style={{ fontSize: '18px' }}>➜</span>
                    </button>
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Checkout;
