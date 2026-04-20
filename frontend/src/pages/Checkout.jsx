import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { user, loading: authLoading } = useAuth();
    const { cartItems, cartTotal } = useCart();
    const navigate = useNavigate();
    
    // Check if the user is coming from cart; if not, they can still checkout if cart has items.
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const discount = 0;
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

    }, []);

    useEffect(() => {
        if (authLoading) return;
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

    const handleProceedToPayment = () => {
        if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
        navigate('/payment', { state: { addressId: selectedAddress.id } });
    };

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (authLoading) return <div style={{height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><img src="/assets/imgs/theme/loader.gif" alt="Loading..." style={{ width: '50px' }} /></div>;

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
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#253D4E', marginBottom: '5px' }}>Checkout</h1>
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
                        <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#253D4E', marginBottom: '15px', textAlign: 'center' }}>Delivery Address</h4>
                        <div style={{ border: '1px solid #e6e6e6', borderRadius: '10px', padding: '0', marginBottom: '30px' }}>
                            {addresses.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px' }}>
                                    <h5 style={{ color: '#dc3545', marginBottom: '20px' }}>Please Add Your Delivering Address First..!</h5>
                                    <Link to="/dashboard?tab=addresses" className="btn btn-primary" style={{ background: '#046938', border: 'none' }}>Add Address</Link>
                                </div>
                            ) : (
                                <div>
                                    {addresses.map(addr => (
                                        <div key={addr.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => setSelectedAddress(addr)}>
                                            <input type="radio" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} style={{ width: '18px', height: '18px', accentColor: '#046938', marginRight: '15px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: '#253D4E', fontSize: '15px', marginBottom: '4px' }}>{addr.name} - {addr.phone} <span style={{background: '#f0f0f0', color: '#555', fontSize: '12px', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px'}}>{addr.addressType || 'Home'}</span></div>
                                                <div style={{ color: '#7E7E7E', fontSize: '14px' }}>{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ padding: '15px 20px', textAlign: 'center' }}>
                                        <Link to="/dashboard?tab=addresses" style={{ color: '#046938', fontSize: '14px', fontWeight: '600' }}>+ Add New Address</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {addresses.length > 0 && selectedAddress && (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button onClick={handleProceedToPayment}
                            style={{ background: '#253D4E', color: '#fff', border: 'none', borderRadius: '5px', padding: '14px 40px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            Proceed To Payment <span style={{ fontSize: '18px' }}>➜</span>
                        </button>
                    </div>
                )}
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Checkout;
