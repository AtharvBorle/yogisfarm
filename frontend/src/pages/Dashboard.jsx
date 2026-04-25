import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

import { ArrowLeft } from 'react-feather';

const Dashboard = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'dashboard';
    const viewOrderNum = searchParams.get('order') || null;
    
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loadingPincode, setLoadingPincode] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '', addressType: 'Home', isDefault: false });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [orderPage, setOrderPage] = useState(1);
    const ordersPerPage = 10;

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/addresses');
            if (res.data.status) setAddresses(res.data.addresses);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        const fetchData = async () => {
            try {
                if (tab === 'orders' || tab === 'dashboard') {
                    const res = await api.get('/orders');
                    if (res.data.status) setOrders(res.data.orders);
                }
                if (tab === 'addresses' || tab === 'dashboard') {
                    fetchAddresses();
                }
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [user, tab, navigate]);

    useEffect(() => {
        if (viewOrderNum) {
            const fetchOrderDetail = async () => {
                try {
                    const res = await api.get(`/orders/detail/${viewOrderNum}`);
                    if (res.data.status) setSelectedOrder(res.data.order);
                } catch (err) { console.error(err); }
            };
            fetchOrderDetail();
        } else { setSelectedOrder(null); }
    }, [viewOrderNum]);

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/');
    };

    const handleSaveAddress = async () => {
        try {
            let res;
            const addressData = { ...newAddress, isDefault: addresses.length === 0 ? true : !!newAddress.isDefault };
            if (newAddress.id) {
                res = await api.put(`/addresses/${newAddress.id}`, addressData);
            } else {
                res = await api.post('/addresses', addressData);
            }
            if (res.data.status) {
                toast.success(`Address ${newAddress.id ? 'updated' : 'saved'} successfully`);
                setShowAddressForm(false);
                setNewAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '', addressType: 'Home', isDefault: false });
                fetchAddresses();
            } else {
                toast.error(res.data.message || 'Failed to save address');
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error saving address');
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await api.delete(`/addresses/${id}`);
            if (res.data.status) {
                toast.success('Address deleted successfully');
                fetchAddresses();
            } else {
                toast.error(res.data.message || 'Failed to delete address');
            }
        } catch (e) { toast.error('Error deleting address'); }
    };

    const handlePincodeChange = async (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setNewAddress(prev => ({ ...prev, pincode: value }));
        
        if (value.length === 6) {
            setLoadingPincode(true);
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const data = await res.json();
                if (data && data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    setNewAddress(prev => ({
                        ...prev,
                        city: postOffice.District,
                        state: postOffice.State
                    }));
                } else {
                    toast.error('Invalid Pincode');
                }
            } catch (err) {
                console.error("Error fetching pincode data", err);
            } finally {
                setLoadingPincode(false);
            }
        }
    };

    const handleSubmitReview = async () => {
        try {
            const res = await api.post('/orders/review', { productId: reviewModal.productId, ...reviewForm });
            if (res.data.status) { toast.success(res.data.message); setReviewModal(null); setReviewForm({ rating: 5, comment: '' }); }
            else toast.error(res.data.message);
        } catch (err) { toast.error('Failed to submit review'); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatDateTime = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
    };

    const sidebarItems = [
        { key: 'dashboard', icon: 'fi-rs-settings-sliders', label: 'Dashboard' },
        { key: 'orders', icon: 'fi-rs-shopping-bag', label: 'My Order' },
        { key: 'addresses', icon: 'fi-rs-marker', label: 'My Addresses' },
        { key: 'profile', icon: 'fi-rs-user', label: 'My Profile' },
    ];

    const payBadge = (status) => {
        if (status === 'verified' || status === 'completed' || status === 'paid') return { bg: '#28a745', label: 'Paid' };
        if (status === 'refunded') return { bg: '#ffc107', label: 'Refunded' };
        if (status === 'failed') return { bg: '#dc3545', label: 'Failed' };
        return { bg: '#dc3545', label: 'Unpaid' };
    };

    const orderBadge = (status) => {
        const bgColors = {
            placed: '#fff4e5', pending: '#fff4e5', confirmed: '#e3f2fd', processing: '#e0d4f5',
            shipped: '#cce5ff', out_for_delivery: '#ffe8cc', delivered: '#e6f4ea', cancelled: '#f8d7da', returned: '#e2e3e5'
        };
        const textColors = {
            placed: '#ff9800', pending: '#ff9800', confirmed: '#007bff', processing: '#6f42c1',
            shipped: '#0056b3', out_for_delivery: '#fd7e14', delivered: '#3BB77E', cancelled: '#dc3545', returned: '#383d41'
        };
        return { bg: bgColors[status] || '#f0f0f0', color: textColors[status] || '#555' };
    };

    const borderStyle = '1px solid #dee2e6';
    const cellPd = { padding: '10px 15px', borderBottom: borderStyle };
    const headerCell = { ...cellPd, fontWeight: '600', color: '#253D4E', background: '#f8f9fa' };

    if (!user) return null;

    if (authLoading) return <div style={{height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><img src="/assets/imgs/theme/loader.gif" alt="Loading..." style={{ width: '50px' }} /></div>;

    return (
        <main className="main">
            <Breadcrumb items={[{ label: 'Dashboard' }]} />
            <div className="page-content pt-50 pb-50">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 m-auto">
                            <div className="row">
                                {/* Sidebar */}
                                <div className="col-md-3">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                        {sidebarItems.map(item => (
                                            <Link key={item.key}
                                                to={`?tab=${item.key}`}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 20px',
                                                    borderRadius: '5px', fontSize: '15px', fontWeight: '600',
                                                    textDecoration: 'none', marginBottom: '5px',
                                                    background: tab === item.key ? '#046938' : '#fff',
                                                    color: tab === item.key ? '#fff' : '#253D4E',
                                                    border: tab === item.key ? 'none' : '1px solid #f0f0f0',
                                                    transition: 'all 0.2s'
                                                }}>
                                                <i className={item.icon}></i> {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="col-md-9">

                                    {/* Dashboard Overview */}
                                    {tab === 'dashboard' && (
                                        <div className="card">
                                            <div className="card-header"><h3 className="mb-0">Hello {user.name || 'User'}!</h3></div>
                                            <div className="card-body">
                                                <p>From your account dashboard you can view your recent orders, manage your shipping addresses, and edit your profile.</p>
                                                <div className="row mt-20">
                                                    <div className="col-4 text-center">
                                                        <div className="p-3 border rounded">
                                                            <h2 style={{ color: '#046938' }}>{orders.length}</h2>
                                                            <p className="mb-0">Orders</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-4 text-center">
                                                        <div className="p-3 border rounded">
                                                            <h2 style={{ color: '#046938' }}>0</h2>
                                                            <p className="mb-0">Wishlist</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-4 text-center">
                                                        <div className="p-3 border rounded">
                                                            <h2 style={{ color: '#046938' }}>{addresses.length}</h2>
                                                            <p className="mb-0">Addresses</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Orders Tab */}
                                    {tab === 'orders' && !viewOrderNum && (
                                        <div>
                                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#253D4E', marginBottom: '20px' }}>Your Orders</h3>
                                            {orders.length === 0 ? (
                                                <p>No orders yet. <Link to="/shop" style={{ color: '#046938' }}>Start shopping!</Link></p>
                                            ) : (
                                                <>
                                                    <div className="table-responsive">
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#253D4E' }}>Code</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#253D4E' }}>Date</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#253D4E' }}>Amount</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#253D4E' }}>Delivery Status</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#253D4E' }}>Payment Status</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#253D4E' }}>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {orders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage).map(order => {
                                                                const pb = payBadge(order.paymentStatus);
                                                                return (
                                                                    <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                                        <td style={{ padding: '12px' }}>
                                                                            <Link to={`?tab=orders&order=${order.orderNumber}`} style={{ color: '#046938', fontWeight: '600' }}>{order.orderNumber}</Link>
                                                                        </td>
                                                                        <td style={{ padding: '12px', color: '#555' }}>{formatDate(order.createdAt)}</td>
                                                                        <td style={{ padding: '12px' }}>₹{Number(order.total).toFixed(0)}</td>
                                                                        <td style={{ padding: '12px' }}>
                                                                            {(() => { const ob = orderBadge(order.orderStatus); return (
                                                                                <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: ob.bg, color: ob.color }}>
                                                                                    {order.orderStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                                                </span>
                                                                            ); })()}
                                                                        </td>
                                                                        <td style={{ padding: '12px' }}>
                                                                            <span style={{ padding: '3px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: pb.bg, color: '#fff' }}>
                                                                                {pb.label}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                                                                            <Link to={`?tab=orders&order=${order.orderNumber}`} title="View" style={{ color: '#046938', fontSize: '16px' }}>
                                                                                <i className="fi-rs-eye"></i>
                                                                            </Link>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); window.open(`/invoice/${order.orderNumber}`, '_blank'); }} title="Download Invoice" style={{ color: '#555', fontSize: '16px' }}>
                                                                                <i className="fi-rs-download"></i>
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {/* Pagination */}
                                                {orders.length > ordersPerPage && (
                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                                                        <button disabled={orderPage === 1} onClick={() => setOrderPage(p => p - 1)}
                                                            style={{ padding: '6px 16px', border: '1px solid #dee2e6', borderRadius: '5px', background: orderPage === 1 ? '#f8f9fa' : '#fff', cursor: orderPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', color: '#253D4E' }}>
                                                            Previous
                                                        </button>
                                                        <span style={{ fontSize: '13px', color: '#555' }}>Page {orderPage} of {Math.ceil(orders.length / ordersPerPage)}</span>
                                                        <button disabled={orderPage >= Math.ceil(orders.length / ordersPerPage)} onClick={() => setOrderPage(p => p + 1)}
                                                            style={{ padding: '6px 16px', border: '1px solid #dee2e6', borderRadius: '5px', background: orderPage >= Math.ceil(orders.length / ordersPerPage) ? '#f8f9fa' : '#fff', cursor: orderPage >= Math.ceil(orders.length / ordersPerPage) ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', color: '#253D4E' }}>
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Order Detail View */}
                                    {tab === 'orders' && viewOrderNum && selectedOrder && (
                                        <div>
                                            {/* Order Summary */}
                                            <div style={{ border: borderStyle, borderRadius: '8px', overflow: 'hidden', marginBottom: '25px' }}>
                                                <div style={{ padding: '12px 15px', background: '#f8f9fa', borderBottom: borderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h5 style={{ margin: 0, fontWeight: '700' }}>Order Summary</h5>
                                                    <Link to="?tab=orders" className="btn btn-sm" style={{ background: '#046938', color: '#fff', padding: '5px 12px', fontSize: '13px', borderRadius: '4px' }}>
                                                        <i className="fi-rs-arrow-left" style={{ marginRight: '5px' }}></i> Back to Orders
                                                    </Link>
                                                </div>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={headerCell}>Order Code:</td>
                                                            <td style={cellPd}>{selectedOrder.orderNumber}</td>
                                                            <td style={headerCell}>Order Date:</td>
                                                            <td style={cellPd}>{formatDateTime(selectedOrder.createdAt)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={headerCell}>Customer Name:</td>
                                                            <td style={cellPd}>{selectedOrder.user?.name}</td>
                                                            <td style={headerCell}>Order Status:</td>
                                                            <td style={cellPd}>{selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={headerCell}>Phone Number:</td>
                                                            <td style={cellPd}>{selectedOrder.user?.phone}</td>
                                                            <td style={headerCell}>Total Order Amount:</td>
                                                            <td style={cellPd}>₹{Number(selectedOrder.total).toFixed(0)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={headerCell}>E-Mail Address:</td>
                                                            <td style={cellPd}>{selectedOrder.user?.email || 'N/A'}</td>
                                                            <td style={headerCell}>Payment Method:</td>
                                                            <td style={cellPd}>{selectedOrder.paymentMethod === 'cod' ? 'COD' : selectedOrder.paymentMethod?.toUpperCase()}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={headerCell}>Shipping Address:</td>
                                                            <td style={cellPd}>{selectedOrder.addressText}, {selectedOrder.addressCity}, {selectedOrder.addressState}, India - {selectedOrder.addressPincode}</td>
                                                            <td style={headerCell}>Payment Status:</td>
                                                            <td style={cellPd}>
                                                                <span style={{ padding: '3px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: payBadge(selectedOrder.paymentStatus).bg, color: '#fff' }}>
                                                                    {payBadge(selectedOrder.paymentStatus).label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={headerCell}></td>
                                                            <td style={cellPd}></td>
                                                            <td style={headerCell}>Address Type:</td>
                                                            <td style={cellPd}>{selectedOrder.addressType || 'Home'}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Order Details - Products */}
                                            <div style={{ border: borderStyle, borderRadius: '8px', overflow: 'hidden', marginBottom: '25px' }}>
                                                <h5 style={{ padding: '12px 15px', margin: 0, fontWeight: '700', background: '#f8f9fa', borderBottom: borderStyle }}>Order Details</h5>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ background: '#f8f9fa' }}>
                                                            <th style={{ ...cellPd, textAlign: 'left' }}>#</th>
                                                            <th style={{ ...cellPd, textAlign: 'center' }}>Image</th>
                                                            <th style={{ ...cellPd, textAlign: 'left' }}>Product</th>
                                                            <th style={{ ...cellPd, textAlign: 'left' }}>Brand</th>
                                                            <th style={{ ...cellPd, textAlign: 'right' }}>Price</th>
                                                            <th style={{ ...cellPd, textAlign: 'center' }}>Quantity</th>
                                                            <th style={{ ...cellPd, textAlign: 'right' }}>Total</th>
                                                            <th style={{ ...cellPd, textAlign: 'center' }}>Review</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedOrder.items?.map((item, i) => (
                                                            <tr key={item.id}>
                                                                <td style={{ ...cellPd, color: '#046938' }}>{i + 1}</td>
                                                                <td style={{ ...cellPd, textAlign: 'center' }}>
                                                                    {item.product?.image ? (
                                                                        <img src={getAssetUrl(item.product.image)} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                                                    ) : (
                                                                        <span>—</span>
                                                                    )}
                                                                </td>
                                                                <td style={cellPd}>
                                                                    <Link to={item.product?.slug ? `/product/${item.product.slug}` : '#'} style={{ color: '#046938' }}>{item.name}</Link>
                                                                </td>
                                                                <td style={cellPd}>{item.brand || '—'}</td>
                                                                <td style={{ ...cellPd, textAlign: 'right' }}>₹{Number(item.price).toFixed(0)}</td>
                                                                <td style={{ ...cellPd, textAlign: 'center' }}>{item.quantity}</td>
                                                                <td style={{ ...cellPd, textAlign: 'right' }}>₹{Number(item.total).toFixed(0)}</td>
                                                                <td style={{ ...cellPd, textAlign: 'center' }}>
                                                                    <button onClick={() => setReviewModal({ productId: item.productId, productName: item.name })}
                                                                        style={{ background: '#046938', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                                                                        Review
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Order Amount */}
                                            <div style={{ border: borderStyle, borderRadius: '8px', overflow: 'hidden', marginBottom: '25px' }}>
                                                <h5 style={{ padding: '12px 15px', margin: 0, fontWeight: '700', background: '#f8f9fa', borderBottom: borderStyle }}>Order Amount</h5>
                                                <div style={{ padding: '0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: borderStyle }}>
                                                        <span style={{ fontWeight: '600', color: '#253D4E' }}>Subtotal</span>
                                                        <span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: borderStyle }}>
                                                        <span style={{ fontWeight: '600', color: '#253D4E' }}>{selectedOrder.taxName ? `${selectedOrder.taxName} (${selectedOrder.taxRate}%)` : 'Tax Amount'}</span>
                                                        <span>₹{Number(selectedOrder.tax || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: borderStyle }}>
                                                        <span style={{ fontWeight: '600', color: '#253D4E' }}>Shipping Charges</span>
                                                        <span>₹{Number(selectedOrder.shipping).toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: borderStyle }}>
                                                        <span style={{ fontWeight: '600', color: '#253D4E' }}>Discount Amount</span>
                                                        <span>₹{Number(selectedOrder.discount).toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', fontWeight: '700' }}>
                                                        <span style={{ color: '#046938' }}>Total</span>
                                                        <span>₹{Number(selectedOrder.total).toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link to="?tab=orders" style={{ color: '#046938', fontWeight: '600' }}><ArrowLeft size={16} /> Back to Orders</Link>
                                        </div>
                                    )}

                                    {/* Addresses Tab */}
                                    {tab === 'addresses' && (
                                        <div className="card">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">My Addresses</h5>
                                                <button className="btn btn-sm" style={{ background: '#046938', color: '#fff' }} onClick={() => setShowAddressForm(!showAddressForm)}>+ Add New</button>
                                            </div>
                                            <div className="card-body">
                                                {showAddressForm && (
                                                    <div className="mb-20 p-3 border rounded">
                                                        <div className="row">
                                                            <div className="col-md-6 mb-10"><input type="text" className="form-control" placeholder="Name *" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} /></div>
                                                            <div className="col-md-6 mb-10"><input type="text" className="form-control" placeholder="Phone *" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} maxLength="10" /></div>
                                                            
                                                            <div className="col-md-4 mb-10" style={{ position: 'relative' }}>
                                                                <input type="text" className="form-control" placeholder="Pincode *" value={newAddress.pincode} onChange={handlePincodeChange} maxLength="6" />
                                                                {loadingPincode && <span style={{ position: 'absolute', right: '20px', top: '10px', fontSize: '12px', color: '#046938' }}>Loading...</span>}
                                                            </div>
                                                            <div className="col-md-4 mb-10"><input type="text" className="form-control" placeholder="State/Division *" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} /></div>
                                                            <div className="col-md-4 mb-10"><input type="text" className="form-control" placeholder="City *" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} /></div>

                                                            <div className="col-12 mb-10"><textarea className="form-control" placeholder="Address *" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})}></textarea></div>
                                                            
                                                            <div className="col-md-6 mb-10">
                                                                <select className="form-control" value={newAddress.addressType} onChange={e => setNewAddress({...newAddress, addressType: e.target.value})}>
                                                                    <option value="Home">Home</option>
                                                                    <option value="Work">Work</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                                <div className="mt-10" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input type="checkbox" id="isDefault" checked={newAddress.isDefault || false} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: '#046938' }} />
                                                                    <label htmlFor="isDefault" style={{ color: '#253D4E', fontWeight: '600', cursor: 'pointer', margin: 0 }}>Set as Default Address</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button type="button" className="btn btn-sm" style={{ background: '#046938', color: '#fff' }} onClick={handleSaveAddress}>Save</button>
                                                    </div>
                                                )}
                                                <div className="row">
                                                    {addresses.map(addr => (
                                                        <div key={addr.id} className="col-md-6 mb-15">
                                                            <div className="card p-3">
                                                                <strong>{addr.name}</strong>
                                                                <p className="mb-0 font-sm">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                                                <small>{addr.phone}</small>
                                                                <div style={{ marginTop: '5px', display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                    {addr.isDefault && <span className="badge bg-success">Default</span>}
                                                                    <span className="badge" style={{ background: '#f0f0f0', color: '#555' }}>{addr.addressType || 'Home'}</span>
                                                                    <button onClick={() => { setNewAddress(addr); setShowAddressForm(true); }} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #e6e6e6', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', color: '#046938', cursor: 'pointer' }}>Edit</button>
                                                                    <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: 'none', border: '1px solid #ff4d4f', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', color: '#ff4d4f', cursor: 'pointer' }}>Delete</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Profile Tab */}
                                    {tab === 'profile' && (
                                        <div className="card">
                                            <div className="card-header"><h5 className="mb-0">My Profile</h5></div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6 mb-15"><label>Name</label><p className="font-lg"><strong>{user.name}</strong></p></div>
                                                    <div className="col-md-6 mb-15"><label>Email</label><p className="font-lg"><strong>{user.email || 'Not Provided'}</strong></p></div>
                                                    <div className="col-md-6 mb-15"><label>Phone</label><p className="font-lg"><strong>{user.phone}</strong></p></div>
                                                    <div className="col-md-6 mb-15"><label>Member Since</label><p className="font-lg"><strong>{new Date(user.createdAt).toLocaleDateString()}</strong></p></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {reviewModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setReviewModal(null)}>
                    <div style={{ background: '#fff', borderRadius: '10px', padding: '30px', width: '100%', maxWidth: '450px', margin: '20px' }}
                        onClick={e => e.stopPropagation()}>
                        <h5 style={{ marginBottom: '15px', fontWeight: '700' }}>Review: {reviewModal.productName}</h5>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {[1,2,3,4,5].map(star => (
                                    <span key={star} onClick={() => setReviewForm({...reviewForm, rating: star})}
                                        style={{ cursor: 'pointer', fontSize: '24px', color: star <= reviewForm.rating ? '#FDC040' : '#ddd' }}>★</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Comment</label>
                            <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                                style={{ width: '100%', border: '1px solid #e6e6e6', borderRadius: '6px', padding: '10px', minHeight: '80px', resize: 'vertical' }}
                                placeholder="Write your review..." />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setReviewModal(null)} style={{ padding: '8px 20px', border: '1px solid #ccc', borderRadius: '5px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSubmitReview} style={{ padding: '8px 20px', border: 'none', borderRadius: '5px', background: '#046938', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            <FeatureBanners />
        </main>
    );
};

export default Dashboard;
