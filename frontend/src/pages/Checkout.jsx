import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

import { X, ArrowRight } from 'react-feather';

const Checkout = () => {
    const { user, loading: authLoading } = useAuth();
    const { cartItems, cartTotal } = useCart();
    const navigate = useNavigate();
    
    // Check if the user is coming from cart; if not, they can still checkout if cart has items.
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        phone: '',
        country: 'India',
        pincode: '',
        state: '',
        city: '',
        address: '',
        addressType: 'Home'
    });
    const [loadingPincode, setLoadingPincode] = useState(false);
    
    // Set initial user details if not yet initialized
    useEffect(() => {
        if (user && !newAddress.name) {
            setNewAddress(prev => ({ ...prev, name: user.name || '', phone: user.phone || '' }));
        }
    }, [user, newAddress.name]);

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
    const rawGrandTotal = cartTotal + totalTax + shipping - discount;
    const grandTotal = Math.round(rawGrandTotal);

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
        if (!user) { navigate('/login?redirect=/checkout'); return; }
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

    const handlePincodeChange = async (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setNewAddress(prev => ({ ...prev, pincode: value }));
        if (value.length === 6) {
            setLoadingPincode(true);
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const data = await res.json();
                if (data && data[0] && data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    setNewAddress(prev => ({
                        ...prev,
                        state: postOffice.State || '',
                        city: postOffice.District || postOffice.Block || postOffice.Region || '',
                    }));
                } else {
                    toast.error('Invalid Pincode');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingPincode(false);
            }
        }
    };

    const handleSaveAddress = async () => {
        try {
            const payload = { ...newAddress, isDefault: addresses.length === 0 || newAddress.isDefault };
            const res = await api.post('/addresses', payload);
            if (res.data.status) {
                toast.success('Address saved successfully');
                if (payload.isDefault) {
                    const updatedAddresses = addresses.map(a => ({ ...a, isDefault: false }));
                    setAddresses([...updatedAddresses, res.data.address]);
                } else {
                    setAddresses([...addresses, res.data.address]);
                }
                setSelectedAddress(res.data.address);
                setShowModal(false);
                setNewAddress({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    country: 'India',
                    pincode: '',
                    state: '',
                    city: '',
                    address: '',
                    addressType: 'Home'
                });
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save address');
        }
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
                                        <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>₹{(price * item.quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '10px 0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>Subtotal :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '18px' }}>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>{activeTax ? `${activeTax.name} (${activeTax.tax}%)` : 'Tax'} :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>₹{totalTax.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontWeight: '600', color: '#253D4E' }}>Shipping :</span>
                                <span style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
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
                                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ background: '#046938', border: 'none' }}>Add Address</button>
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
                                        <button onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none', color: '#046938', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ Add New Address</button>
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
                            Proceed To Payment <span style={{ fontSize: '18px' }}><ArrowRight size={16} /></span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={() => setShowModal(false)}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '8px', overflow: 'hidden' }} onMouseDown={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #e6e6e6' }}>
                            <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#253D4E' }}>New Address</h5>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#7E7E7E' }}><X size={18} /></button>
                        </div>
                        
                        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '14px', color: '#7E7E7E', marginBottom: '5px', display: 'block' }}>Name</label>
                                    <input type="text" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} style={{ width: '100%', border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '14px', color: '#7E7E7E', marginBottom: '5px', display: 'block' }}>Phone</label>
                                    <input type="text" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} style={{ width: '100%', border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                <label style={{ width: '100px', fontSize: '14px', color: '#7E7E7E' }}>Country</label>
                                <input type="text" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px', outline: 'none' }} />
                            </div>
                            
                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                <label style={{ width: '100px', fontSize: '14px', color: '#7E7E7E' }}>Postal Code</label>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input type="text" value={newAddress.pincode} onChange={handlePincodeChange} style={{ width: '100%', border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px', outline: 'none' }} />
                                    {loadingPincode && <span style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '12px', color: '#046938' }}>Loading...</span>}
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                <label style={{ width: '100px', fontSize: '14px', color: '#7E7E7E' }}>Division</label>
                                <input type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px', outline: 'none' }} />
                            </div>

                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                <label style={{ width: '100px', fontSize: '14px', color: '#7E7E7E' }}>City</label>
                                <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px', outline: 'none' }} />
                            </div>

                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start' }}>
                                <label style={{ width: '100px', fontSize: '14px', color: '#7E7E7E', marginTop: '10px' }}>Address</label>
                                <textarea value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', padding: '10px', outline: 'none', minHeight: '60px', resize: 'vertical' }} />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '700', color: '#253D4E', marginBottom: '10px', display: 'block' }}>Save Address As</label>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    {['Home', 'Work', 'Other'].map(type => (
                                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#7E7E7E', fontSize: '14px', margin: 0 }}>
                                            <input type="radio" checked={newAddress.addressType === type} onChange={() => setNewAddress({...newAddress, addressType: type})} style={{ width: '16px', height: '16px', accentColor: '#046938' }} />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" id="isDefaultCheckout" checked={newAddress.isDefault || false} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: '#046938' }} />
                                    <label htmlFor="isDefaultCheckout" style={{ color: '#253D4E', fontWeight: '600', cursor: 'pointer', margin: 0, fontSize: '14px' }}>Set as Default Address</label>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '15px 20px', borderTop: '1px solid #e6e6e6', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setShowModal(false)} style={{ background: '#4A5568', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 20px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                            <button onClick={handleSaveAddress} style={{ background: '#046938', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 20px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <FeatureBanners />
        </main>
    );
};

export default Checkout;
