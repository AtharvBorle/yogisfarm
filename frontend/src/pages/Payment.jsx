import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';
import { useOrderPricing } from '../hooks/useOrderPricing';
import EarnCoinsNotice from '../components/EarnCoinsNotice';

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
    const [couponCode, setCouponCode] = useState(() => {
        const val = sessionStorage.getItem('applied_coupon');
        return (val && val !== 'NONE') ? val : '';
    });
    const [appliedCoupon, setAppliedCoupon] = useState(() => sessionStorage.getItem('applied_coupon') || '');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [useYogisPoints, setUseYogisPoints] = useState(false);

    // === USE CENTRALIZED PRICING HOOK ===
    const { 
        subtotalBase, 
        totalTax, 
        shipping, 
        discountAmount, 
        grandTotal, 
        coupon, 
        yogisPointsUsed, 
        yogisPointsDiscount, 
        yogisPoints, 
        pointsEarned,
        pointsPerOrder,
        offerPriceSum,
        loading: pricingLoading 
    } = useOrderPricing(cartItems, appliedCoupon, useYogisPoints);
    const coinsReward = pointsEarned || pointsPerOrder || 0;

    // Auto-uncheck points if eligibility criteria becomes unmet
    useEffect(() => {
        if (useYogisPoints && yogisPoints && !yogisPoints.eligible) {
            setUseYogisPoints(false);
        }
    }, [yogisPoints, useYogisPoints]);

    // Fetch suggested coupons
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await api.get('/coupons/suggestions');
                if (res.data.status) {
                    setSuggestions(res.data.suggestions);
                }
            } catch (err) {
                console.error('Failed to fetch coupon suggestions:', err);
            }
        };
        fetchSuggestions();
    }, [cartItems]);

    // Auto-validate and purge coupon if it expires, is deactivated, or minimum order value criteria is no longer met
    useEffect(() => {
        if (!pricingLoading && appliedCoupon && appliedCoupon !== 'NONE' && !coupon) {
            setAppliedCoupon('');
            setCouponCode('');
            sessionStorage.removeItem('applied_coupon');
            toast.error('The applied coupon is no longer valid or minimum order value is not met');
        }
    }, [coupon, pricingLoading, appliedCoupon]);

    useEffect(() => {
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
        if (!user.name || !user.email) { navigate('/login?redirect=/checkout'); return; }
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
            if (res.data.status) { 
                toast.success('Coupon applied'); 
                setAppliedCoupon(couponCode); 
                sessionStorage.setItem('applied_coupon', couponCode);
            }
            else { toast.error(res.data.message); }
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Invalid coupon'); 
            setAppliedCoupon(''); 
            sessionStorage.removeItem('applied_coupon');
        }
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
        setLoading(true);
        try {
            const res = await api.post('/orders/place', {
                addressId: selectedAddress.id,
                paymentMethod,
                couponCode: appliedCoupon || undefined,
                useYogisPoints: Boolean(useYogisPoints),
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
                        name: "YogisFarms",
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
                                    sessionStorage.removeItem('applied_coupon');
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
                            ondismiss: async function() {
                                // User canceled the payment, purge razorpay and reset state
                                setLoading(false);
                                try {
                                    await api.post('/orders/payment-failed', { orderNumber: res.data.orderNumber });
                                } catch (err) {
                                    console.error('Failed to notify backend of payment dismissal:', err);
                                }
                                const rzpScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
                                if (rzpScript) rzpScript.remove();
                                const rzpContainer = document.querySelector('.razorpay-container');
                                if (rzpContainer) rzpContainer.remove();
                                if (window.Razorpay) delete window.Razorpay;
                            }
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', async function (response){
                        toast.error(response.error.description || 'Payment Failed');
                        try {
                            await api.post('/orders/payment-failed', { orderNumber: res.data.orderNumber });
                        } catch (err) {
                            console.error('Failed to notify backend of payment failure:', err);
                        }
                    });
                    rzp.open();
                } else {
                    toast.success(res.data.message);
                    fetchCart();
                    sessionStorage.removeItem('applied_coupon');
                    navigate(`/order-success/${res.data.orderNumber}`);
                }
            } else { toast.error(res.data.message); }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
        finally { setLoading(false); }
    };

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (authLoading) return <div style={{height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><img src="/assets/imgs/theme/icons/logo.png" alt="Loading..." style={{ width: '50px' }} /></div>;

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
                                const price = item.variant ? (item.variant.salePrice || item.variant.price) : 0;
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
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '18px' }}>₹{pricingLoading ? '...' : (subtotalBase || 0).toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                    <span style={{ fontWeight: '600', color: '#dc3545' }}>Discount ({coupon?.code || couponCode}) :</span>
                                    <span style={{ fontWeight: '700', color: '#dc3545', fontSize: '16px' }}>-₹{pricingLoading ? '...' : (discountAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            {yogisPointsDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                    <span style={{ fontWeight: '600', color: '#046938' }}>Yogis Points Discount ({yogisPointsUsed} pts) :</span>
                                    <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>-₹{pricingLoading ? '...' : (yogisPointsDiscount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>Total Applicable GST :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>₹{pricingLoading ? '...' : (totalTax || 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>Shipping :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>{pricingLoading ? '...' : (shipping === 0 ? 'Free' : `₹${(shipping || 0).toFixed(2)}`)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0 0 0', marginTop: '5px' }}>
                                <span style={{ fontWeight: '800', color: '#253D4E', fontSize: '18px' }}>Total :</span>
                                <span style={{ fontWeight: '800', color: '#046938', fontSize: '22px' }}>₹{pricingLoading ? '...' : (grandTotal || 0).toFixed(0)}</span>
                            </div>
                            <EarnCoinsNotice coins={coinsReward} size="md" style={{ marginTop: '15px' }} />
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
                            {coupon ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8f9fa' }}>
                                    <div>
                                        <i className="fi-rs-label" style={{ color: '#046938', marginRight: '8px' }}></i>
                                        <span style={{ fontWeight: '600', color: '#046938' }}>{coupon.code}</span>
                                        {appliedCoupon === '' || appliedCoupon === null ? ' (Auto-applied)' : ' applied!'}
                                    </div>
                                    <button onClick={() => { setAppliedCoupon('NONE'); setCouponCode(''); sessionStorage.setItem('applied_coupon', 'NONE'); toast.success('Coupon removed'); }}
                                        style={{ background: 'none', border: 'none', color: '#dc3545', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <i className="fi-rs-cross-small"></i> Remove
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '0 0 15px 0' }}>
                                    <div style={{ display: 'flex', padding: '15px 20px 5px 20px', gap: '10px' }}>
                                        <input type="text" placeholder="Enter Your Coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                                            style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px 15px', fontSize: '14px', outline: 'none' }} />
                                        <button onClick={handleApplyCoupon}
                                            style={{ background: '#046938', color: '#fff', border: 'none', borderRadius: '5px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <i className="fi-rs-label" style={{ fontSize: '14px' }}></i> Apply
                                        </button>
                                    </div>
                                    
                                    {suggestions.length > 0 && (
                                        <div style={{ padding: '0 20px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#7E7E7E', margin: '10px 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Coupons</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                                                {suggestions.map(s => {
                                                    const isApplicable = s.status === 'applicable';
                                                    const isNearly = s.status === 'nearly_applicable';
                                                    
                                                    let borderColor = '#e6e6e6';
                                                    let bgColor = '#fff';
                                                    if (isApplicable) {
                                                        borderColor = '#046938';
                                                        bgColor = '#f4faf6';
                                                    } else if (isNearly) {
                                                        borderColor = '#e37400';
                                                        bgColor = '#fefcf5';
                                                    }

                                                    return (
                                                        <div key={s.id} 
                                                            onClick={() => {
                                                                if (isApplicable || s.status === 'available') {
                                                                    setAppliedCoupon(s.code);
                                                                    setCouponCode(s.code);
                                                                    sessionStorage.setItem('applied_coupon', s.code);
                                                                    toast.success(`Applying coupon ${s.code}`);
                                                                } else {
                                                                    toast.info(s.message);
                                                                }
                                                            }}
                                                            style={{
                                                                border: `1px dashed ${borderColor}`,
                                                                borderRadius: '8px',
                                                                padding: '10px 12px',
                                                                background: bgColor,
                                                                cursor: (isApplicable || s.status === 'available') ? 'pointer' : 'default',
                                                                position: 'relative',
                                                                transition: 'transform 0.2s',
                                                            }}
                                                            onMouseEnter={(e) => { if (isApplicable || s.status === 'available') e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                            onMouseLeave={(e) => { if (isApplicable || s.status === 'available') e.currentTarget.style.transform = 'none'; }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                <span style={{
                                                                    background: isApplicable ? '#046938' : '#888',
                                                                    color: '#fff',
                                                                    fontWeight: '700',
                                                                    fontSize: '11px',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                    textTransform: 'uppercase'
                                                                }}>{s.code}</span>
                                                                {(isApplicable || s.status === 'available') && (
                                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#046938' }}>APPLY</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#253D4E', marginBottom: '2px' }}>{s.description || 'No description provided'}</div>
                                                            <div style={{ fontSize: '11px', color: isApplicable ? '#046938' : (isNearly ? '#e37400' : '#7E7E7E'), fontWeight: '500' }}>{s.message}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Yogis Points Section */}
                        {yogisPoints?.enabled && (
                            <div style={{
                                border: yogisPoints?.eligible ? '2px solid #3BB77E' : '1.5px dashed #F59E0B',
                                borderRadius: '10px',
                                padding: '18px 20px',
                                marginBottom: '30px',
                                background: yogisPoints?.eligible ? '#f4faf6' : '#FFFDF5'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img 
                                            src="/yogis_farms_coin_smooth_360_spin.svg" 
                                            alt="Coins" 
                                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                            onError={(e) => { e.currentTarget.src = "/assets/imgs/theme/yogis-coin.png"; }}
                                        />
                                        <span style={{ fontWeight: '700', fontSize: '16px', color: '#253D4E' }}>Yogis Points</span>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: yogisPoints?.eligible ? '#046938' : '#B45309' }}>
                                        Available: <strong>{yogisPoints.availablePoints || 0} Points</strong>
                                    </div>
                                </div>

                                {/* Redemption Rules Pill */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                    <span style={{
                                        fontSize: '11px',
                                        color: (offerPriceSum || subtotalBase) >= (yogisPoints.minOrderValue || yogisPoints.minimumCartValue || 0) ? '#15803D' : '#92400E',
                                        backgroundColor: (offerPriceSum || subtotalBase) >= (yogisPoints.minOrderValue || yogisPoints.minimumCartValue || 0) ? '#DCFCE7' : '#FEF3C7',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '600'
                                    }}>
                                        Min. Order: ₹{yogisPoints.minOrderValue || yogisPoints.minimumCartValue || 0}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        color: (yogisPoints.availablePoints || 0) >= (yogisPoints.minPoints || yogisPoints.minimumRedeemablePoints || 0) ? '#15803D' : '#92400E',
                                        backgroundColor: (yogisPoints.availablePoints || 0) >= (yogisPoints.minPoints || yogisPoints.minimumRedeemablePoints || 0) ? '#DCFCE7' : '#FEF3C7',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '600'
                                    }}>
                                        Min. Points to Redeem: {yogisPoints.minPoints || yogisPoints.minimumRedeemablePoints || 0} Pts
                                    </span>
                                </div>

                                {yogisPoints?.eligible ? (
                                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #cce5d6' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#253D4E', margin: 0, userSelect: 'none' }}>
                                            <input
                                                type="checkbox"
                                                checked={useYogisPoints}
                                                onChange={(e) => setUseYogisPoints(e.target.checked)}
                                                style={{ width: '18px', height: '18px', accentColor: '#046938', cursor: 'pointer' }}
                                            />
                                            <span>Use Yogis Points</span>
                                        </label>
                                        {useYogisPoints && (
                                            <div style={{ marginTop: '8px', fontSize: '13px', color: '#046938', fontWeight: '600', paddingLeft: '28px' }}>
                                                {yogisPoints.pointsToUse} Points = ₹{yogisPoints.pointsDiscount} discount
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #E5E7EB', fontSize: '12px', color: '#92400E', lineHeight: '1.5' }}>
                                        {!user ? (
                                            <div>Please log in to redeem your Yogi's Points.</div>
                                        ) : (offerPriceSum || subtotalBase) < (yogisPoints.minOrderValue || yogisPoints.minimumCartValue || 0) ? (
                                            <div>
                                                Minimum order value of <strong>₹{yogisPoints.minOrderValue || yogisPoints.minimumCartValue}</strong> required to redeem points. (Current order value: ₹{(offerPriceSum || subtotalBase || 0).toFixed(0)}) — add <strong>₹{((yogisPoints.minOrderValue || yogisPoints.minimumCartValue || 0) - (offerPriceSum || subtotalBase || 0)).toFixed(0)}</strong> more to unlock.
                                            </div>
                                        ) : (yogisPoints.availablePoints || 0) < (yogisPoints.minPoints || yogisPoints.minimumRedeemablePoints || 0) ? (
                                            <div>
                                                Minimum <strong>{yogisPoints.minPoints || yogisPoints.minimumRedeemablePoints} Points</strong> required to redeem. You currently have <strong>{yogisPoints.availablePoints || 0} Points</strong> (need {((yogisPoints.minPoints || yogisPoints.minimumRedeemablePoints || 0) - (yogisPoints.availablePoints || 0))} more).
                                            </div>
                                        ) : (
                                            <div>
                                                {yogisPoints.reason || 'Points cannot be applied on this order.'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
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
