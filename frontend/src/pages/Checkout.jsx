import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { user } = useAuth();
    const { cartItems, cartTotal, fetchCart } = useCart();
    const navigate = useNavigate();
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
    
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const shipping = cartTotal >= 500 ? 0 : 50;
    const grandTotal = cartTotal + shipping - discount;

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=checkout');
            return;
        }
        if (cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        const fetchAddresses = async () => {
            try {
                const res = await api.get('/addresses');
                if (res.data.status) {
                    setAddresses(res.data.addresses);
                    const defaultAddr = res.data.addresses.find(a => a.isDefault);
                    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                    else if (res.data.addresses.length > 0) setSelectedAddressId(res.data.addresses[0].id);
                    else setShowNewAddress(true);
                }
            } catch (error) {
                console.error("Failed to load addresses", error);
            }
        };
        fetchAddresses();
    }, [user, cartItems, navigate]);

    const handleSaveAddress = async () => {
        try {
            const res = await api.post('/addresses', { ...newAddress, isDefault: addresses.length === 0 });
            if (res.data.status) {
                toast.success('Address added');
                setAddresses([...addresses, res.data.address]);
                setSelectedAddressId(res.data.address.id);
                setShowNewAddress(false);
                setNewAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save address');
        }
    };

    const handleApplyCoupon = async () => {
        try {
            const res = await api.post('/cart/coupon', { code: couponCode });
            if (res.data.status) {
                toast.success('Coupon applied');
                setDiscount(res.data.discount || 0);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
            setDiscount(0);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/orders/place', {
                addressId: selectedAddressId,
                paymentMethod: 'COD',
                notes
            });
            if (res.data.status) {
                toast.success(res.data.message);
                fetchCart(); // clear cart
                navigate(`/dashboard?tab=orders&orderId=${res.data.orderId}`);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main">
            <Breadcrumb items={[{ label: 'Checkout' }]} />
            <div className="container mb-80 mt-30">
                <div className="row">
                    <div className="col-lg-8">
                        <h3 className="heading-2 mb-20">Delivery Address</h3>
                        
                        <div className="row mb-30">
                            {addresses.map(addr => (
                                <div key={addr.id} className="col-lg-6 mb-15">
                                    <div className={`card address-card p-3 ${selectedAddressId === addr.id ? 'border-success' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedAddressId(addr.id)}>
                                        <input type="radio" readOnly checked={selectedAddressId === addr.id} className="address-radio" />
                                        <strong>{addr.name}</strong>
                                        <p className="mb-0 font-sm">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                        <small className="text-muted">{addr.phone}</small>
                                    </div>
                                </div>
                            ))}
                            <div className="col-lg-6 mb-15">
                                <div className="card p-3 text-center d-flex align-items-center justify-content-center h-100" style={{ cursor:'pointer', border:'2px dashed #ccc', minHeight:'120px' }} onClick={() => setShowNewAddress(!showNewAddress)}>
                                    <i className="fi-rs-plus" style={{ fontSize: '24px' }}></i><br/>
                                    <span>Add New Address</span>
                                </div>
                            </div>
                        </div>

                        {showNewAddress && (
                            <div id="new-address-section" className="card p-4 mb-30">
                                <h5 className="mb-15">New Delivery Address</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-15"><input type="text" className="form-control" placeholder="Full Name *" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} /></div>
                                    <div className="col-md-6 mb-15"><input type="text" className="form-control" placeholder="Phone Number *" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} /></div>
                                    <div className="col-md-12 mb-15"><textarea className="form-control" placeholder="Full Address *" rows="2" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})}></textarea></div>
                                    <div className="col-md-4 mb-15"><input type="text" className="form-control" placeholder="City *" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} /></div>
                                    <div className="col-md-4 mb-15"><input type="text" className="form-control" placeholder="State *" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} /></div>
                                    <div className="col-md-4 mb-15"><input type="text" className="form-control" placeholder="Pincode *" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} /></div>
                                </div>
                                <button type="button" className="btn btn-sm" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={handleSaveAddress}>Save Address</button>
                            </div>
                        )}

                        <div className="mb-30">
                            <h5>Have a Coupon?</h5>
                            <div className="d-flex mt-10">
                                <input type="text" className="form-control" placeholder="Enter coupon code" style={{ maxWidth: '250px' }} value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                                <button className="btn ml-10" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={handleApplyCoupon}>Apply</button>
                            </div>
                        </div>

                        <div className="mb-30">
                            <h5>Order Notes (optional)</h5>
                            <textarea className="form-control mt-10" rows="3" placeholder="Any special instructions?" value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="border p-md-4 cart-totals">
                            <h4 className="mb-20">Order Summary</h4>
                            {cartItems.map(item => {
                                const price = item.variant ? (item.variant.salePrice || item.variant.price) : (item.product.salePrice || item.product.price);
                                return (
                                    <div key={item.id} className="d-flex justify-content-between mb-10">
                                        <span className="font-sm">{item.product.name} {item.variant ? `(${item.variant.name})` : ''} × {item.quantity}</span>
                                        <span className="font-sm">₹{(price * item.quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                            <hr />
                            <div className="d-flex justify-content-between mb-10">
                                <span>Subtotal</span>
                                <strong>₹{cartTotal.toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-10">
                                <span>Shipping</span>
                                <strong>{shipping === 0 ? 'Free' : `₹${shipping}`}</strong>
                            </div>
                            {discount > 0 && (
                                <div className="d-flex justify-content-between mb-10 text-success">
                                    <span>Discount</span>
                                    <strong>-₹{discount.toFixed(2)}</strong>
                                </div>
                            )}
                            <hr />
                            <div className="d-flex justify-content-between mb-20">
                                <h5>Total</h5>
                                <h4 className="text-brand">₹{grandTotal.toFixed(2)}</h4>
                            </div>

                            <div className="mb-20">
                                <h6>Payment Method</h6>
                                <label className="d-flex align-items-center p-2 border rounded mt-10" style={{ cursor: 'pointer' }}>
                                    <input type="radio" name="payment" value="COD" readOnly checked className="mr-10" /> Cash on Delivery
                                </label>
                            </div>
                            
                            <button className="btn w-100" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={handlePlaceOrder} disabled={loading}>
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
