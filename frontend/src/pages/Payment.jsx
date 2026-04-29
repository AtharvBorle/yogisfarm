import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

import { DollarSign, ArrowRight } from 'react-feather';

const Payment = () => {
    const { user, loading: authLoading } = useAuth();
    const { cartItems, cartTotal, fetchCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const stateAddressId = location.state?.addressId;
    
    // Redirect back to checkout if no address selected
    useEffect(() => {
        if (!stateAddressId && !authLoading) {
            navigate('/checkout');
        }
    }, [stateAddressId, navigate, authLoading]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [termsError, setTermsError] = useState('');
    const [loading, setLoading] = useState(false);
    const [globalTaxRate, setGlobalTaxRate] = useState(0);
    const [activeTax, setActiveTax] = useState(null);
    const [shippingCharge, setShippingCharge] = useState(0);
    const [shippingThreshold, setShippingThreshold] = useState(0);

    const totalTax = cartItems.reduce((total, item) => {
        const price = item.variant ? parseFloat(item.variant.salePrice || item.variant.price) : parseFloat(item.product.salePrice || item.product.price);
        const itemTotal = price * item.quantity;
        return total + ((itemTotal * globalTaxRate) / 100);
    }, 0);
    const shipping = (shippingThreshold > 0 && cartTotal >= shippingThreshold) ? 0 : shippingCharge;
    const grandTotal = cartTotal + totalTax + shipping - discount;

    useEffect(() => {
        // Fetch global tax rate and shipping rules
        const fetchSettings = async () => {
            try {
                const [taxRes, shipRes] = await Promise.all([
                    api.get('/taxes'),
                    api.get('/shipping')
                ]);
                if (taxRes.data.status && taxRes.data.taxes?.length > 0) {
                    const activeTax = taxRes.data.taxes.find(t => t.status === 'active');
                    if (activeTax) {
                        setGlobalTaxRate(parseFloat(activeTax.tax));
                        setActiveTax(activeTax);
                    }
                }
                if (shipRes.data.status && shipRes.data.shipping?.length > 0) {
                    const activeShipping = shipRes.data.shipping[0];
                    setShippingCharge(parseFloat(activeShipping.charge));
                    setShippingThreshold(parseFloat(activeShipping.minCartValue));
                }
            } catch (err) { console.error(err); }
        };
        fetchSettings();

        // Cleanup Razorpay on unmount to prevent background SPA polling
        return () => {
            const rzpScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (rzpScript) rzpScript.remove();
            
            const rzpContainer = document.querySelector('.razorpay-container');
            if (rzpContainer) rzpContainer.remove();
            
            if (window.Razorpay) delete window.Razorpay;
        };
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login?redirect=/checkout'); return; }
        if (cartItems.length === 0) { navigate('/cart'); return; }
        const fetchAddresses = async () => {
            try {
                const res = await api.get('/addresses');
                if (res.data.status && res.data.addresses.length > 0) {
                    const sel = res.data.addresses.find(a => a.id === stateAddressId) || res.data.addresses[0];
                    setSelectedAddress(sel);
                } else {
                    navigate('/checkout');
                }
            } catch (err) { console.error(err); navigate('/checkout'); }
        };
        if (stateAddressId) fetchAddresses();
    }, [user, cartItems, navigate, stateAddressId]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await api.post('/coupons/apply', { code: couponCode, subtotal: cartTotal });
            if (res.data.status) { toast.success('Coupon applied'); setDiscount(res.data.discount || 0); }
            else { toast.error(res.data.message); }
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); setDiscount(0); }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
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
                if (paymentMethod === 'online' && res.data.razorpayOrder) {
                    const loaded = await loadRazorpay();
                    if (!loaded) {
                        toast.error('Failed to load payment gateway. Check your connection.');
                        setLoading(false);
                        return;
                    }
                    const options = {
                        key: res.data.key,
                        amount: res.data.razorpayOrder.amount,
                        currency: res.data.razorpayOrder.currency,
                        name: "Yogis Farm",
                        description: "Organic Products Purchase",
                        order_id: res.data.razorpayOrder.id,
                        handler: async function (response) {
                            try {
                                const verifyRes = await api.post('/orders/verify-payment', {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                });
                                if (verifyRes.data.status) {
                                    toast.success('Payment successful!');
                                    fetchCart();
                                    navigate(`/order-success/${verifyRes.data.orderNumber}`);
                                } else {
                                    toast.error(verifyRes.data.message || 'Payment verification failed');
                                }
                            } catch (err) {
                                toast.error('Error verifying payment');
                            }
                        },
                        prefill: {
                            name: user?.name || '',
                            email: user?.email || '',
                            contact: user?.phone || ''
                        },
                        theme: { color: "#046938" },
                        modal: {
                            ondismiss: function() {
                                // User canceled the payment, purge razorpay and reset state
                                setLoading(false);
                                const rzpScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
                                if (rzpScript) rzpScript.remove();
                                const rzpContainer = document.querySelector('.razorpay-container');
                                if (rzpContainer) rzpContainer.remove();
                                if (window.Razorpay) delete window.Razorpay;
                            }
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', function (response){
                        toast.error(response.error.description || 'Payment Failed');
                    });
                    rzp.open();
                } else {
                    toast.success(res.data.message);
                    fetchCart();
                    navigate(`/order-success/${res.data.orderNumber}`);
                }
            } else { toast.error(res.data.message); }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
        finally { setLoading(false); }
    };

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (authLoading) return <div style={{height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><img src="/assets/imgs/theme/loader.gif" alt="Loading..." style={{ width: '50px' }} /></div>;

    return (
        <main className="main">
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> <Link to="/checkout">Checkout</Link>
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
                                const imgSrc = item.product.image ? getAssetUrl(item.product.image) : '/assets/imgs/theme/placeholder.png';
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
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                    <span style={{ fontWeight: '600', color: '#dc3545' }}>Discount ({couponCode}) :</span>
                                    <span style={{ fontWeight: '700', color: '#dc3545', fontSize: '16px' }}>-₹{discount.toFixed(0)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>{activeTax ? `${activeTax.name} (${activeTax.tax}%)` : 'Tax'} :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>₹{totalTax.toFixed(0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>Shipping :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(0)}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0 0 0', marginTop: '5px' }}>
                                <span style={{ fontWeight: '800', color: '#253D4E', fontSize: '18px' }}>Total :</span>
                                <span style={{ fontWeight: '800', color: '#046938', fontSize: '22px' }}>₹{grandTotal.toFixed(0)}</span>
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
                                <Link to="/checkout" style={{ color: '#046938', fontSize: '14px' }}>Change</Link>
                            </div>
                            {discount > 0 ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8f9fa' }}>
                                    <div>
                                        <i className="fi-rs-label" style={{ color: '#046938', marginRight: '8px' }}></i>
                                        <span style={{ fontWeight: '600', color: '#046938' }}>{couponCode}</span> applied!
                                    </div>
                                    <button onClick={() => { setDiscount(0); setCouponCode(''); toast.success('Coupon removed'); }}
                                        style={{ background: 'none', border: 'none', color: '#dc3545', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <i className="fi-rs-cross-small"></i> Remove
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', padding: '15px 20px', gap: '10px' }}>
                                    <input type="text" placeholder="Enter Your Coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                                        style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px 15px', fontSize: '14px', outline: 'none' }} />
                                    <button onClick={handleApplyCoupon}
                                        style={{ background: '#046938', color: '#fff', border: 'none', borderRadius: '5px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <i className="fi-rs-label" style={{ fontSize: '14px' }}></i> Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#253D4E', marginBottom: '20px' }}>Select Payment Method</h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
                    {/* Online */}
                    <div onClick={() => setPaymentMethod('online')}
                        style={{ flex: '1 1 140px', height: '140px', border: paymentMethod === 'online' ? '2px solid #046938' : '1px solid #e6e6e6', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: paymentMethod === 'online' ? '#f0f9f4' : '#fff' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <svg width="80" height="50" viewBox="0 0 80 50"><rect fill="#046938" rx="8" width="80" height="50"/><text x="40" y="22" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">CARDS</text><text x="40" y="38" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">UPI & NET</text></svg>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#253D4E', textAlign: 'center', lineHeight: '1.2' }}>Online Payment<br/><small style={{fontSize: '11px', color: '#888'}}>By Razorpay</small></span>
                    </div>
                    {/* COD */}
                    <div onClick={() => setPaymentMethod('cod')}
                        style={{ flex: '1 1 140px', height: '140px', border: paymentMethod === 'cod' ? '2px solid #046938' : '1px solid #e6e6e6', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: paymentMethod === 'cod' ? '#f0f9f4' : '#fff' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <svg width="80" height="50" viewBox="0 0 80 50"><rect fill="#046938" rx="8" width="80" height="50"/><text x="40" y="32" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">COD</text></svg>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#253D4E' }}>Cash On Delivery</span>
                    </div>
                    {/* Wallet - Disabled */}
                    <div style={{ flex: '1 1 140px', height: '140px', border: '1px solid #e6e6e6', borderRadius: '10px', cursor: 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, background: '#f8f8f8' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <svg width="80" height="50" viewBox="0 0 80 50"><rect fill="#046938" rx="8" width="80" height="50"/><text x="40" y="20" textAnchor="middle" fill="#fff" fontSize="24"><DollarSign size={16} /></text><text x="40" y="42" textAnchor="middle" fill="#fff" fontSize="10">₹0</text></svg>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '12px', color: '#253D4E', textAlign: 'center' }}>Insufficient Wallet Balance</span>
                    </div>
                </div>

                {/* Terms */}
                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#253D4E' }}>
                        <input type="checkbox" checked={agreeTerms} onChange={e => { setAgreeTerms(e.target.checked); if (e.target.checked) setTermsError(''); }}
                            style={{ width: '16px', height: '16px', accentColor: '#046938', flexShrink: 0 }} />
                        <span>I Agree To The <a href="#" style={{ color: '#046938' }}>Terms & Conditions</a> <a href="#" style={{ color: '#046938' }}>Return, Refund And Cancellation Policy</a> & <a href="#" style={{ color: '#046938' }}>Privacy Policy</a></span>
                    </label>
                    {termsError && <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '3px', marginLeft: '24px' }}>{termsError}</div>}
                </div>

                {/* Additional Notes */}
                <h5 style={{ fontSize: '16px', fontWeight: '700', color: '#253D4E', marginBottom: '10px', marginTop: '15px' }}>Additional Notes:</h5>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Write Here"
                    style={{ width: '100%', maxWidth: '450px', border: '1px solid #e6e6e6', borderRadius: '8px', padding: '12px 15px', fontSize: '14px', minHeight: '100px', resize: 'vertical', outline: 'none', marginBottom: '25px' }} />

                {/* Complete Order */}
                <div style={{ textAlign: 'center' }}>
                    <button onClick={handlePlaceOrder} disabled={loading}
                        style={{ background: '#253D4E', color: '#fff', border: 'none', borderRadius: '5px', padding: '14px 40px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        {loading ? 'Processing...' : 'Complete Order'} <span style={{ fontSize: '18px' }}><ArrowRight size={16} /></span>
                    </button>
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Payment;
