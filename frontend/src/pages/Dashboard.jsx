import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'dashboard';
    
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0); // placeholder if wishlist isn't fully implemented
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });

    useEffect(() => {
        if(!user) {
            navigate('/login');
            return;
        }
        
        const fetchDashboardData = async () => {
            try {
                if(tab === 'orders' || tab === 'dashboard') {
                    const res = await api.get('/orders');
                    if(res.data.status) setOrders(res.data.orders);
                }
                if(tab === 'addresses' || tab === 'dashboard') {
                    const res = await api.get('/addresses');
                    if(res.data.status) setAddresses(res.data.addresses);
                }
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchDashboardData();
    }, [user, tab, navigate]);

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/');
    };

    const handleSaveAddress = async () => {
        try {
            const res = await api.post('/addresses', { ...newAddress, isDefault: addresses.length === 0 });
            if (res.data.status) {
                toast.success('Address saved');
                setAddresses([...addresses, res.data.address]);
                setShowAddressForm(false);
                setNewAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save address');
        }
    };

    const statusColors = { pending:'warning', confirmed:'info', processing:'primary', shipped:'info', delivered:'success', cancelled:'danger' };

    if(!user) return null;

    return (
        <main className="main">
            <Breadcrumb items={[{ label: 'Dashboard' }]} />
            <div className="page-content pt-50 pb-50">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 m-auto">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="dashboard-menu">
                                        <ul className="nav flex-column" role="tablist">
                                            <li className="nav-item"><Link className={`nav-link ${tab==='dashboard'?'active':''}`} to="?tab=dashboard"><i className="fi-rs-settings-sliders mr-10"></i>Dashboard</Link></li>
                                            <li className="nav-item"><Link className={`nav-link ${tab==='orders'?'active':''}`} to="?tab=orders"><i className="fi-rs-shopping-bag mr-10"></i>Orders</Link></li>
                                            <li className="nav-item"><Link className={`nav-link ${tab==='addresses'?'active':''}`} to="?tab=addresses"><i className="fi-rs-marker mr-10"></i>Addresses</Link></li>
                                            <li className="nav-item"><Link className={`nav-link ${tab==='profile'?'active':''}`} to="?tab=profile"><i className="fi-rs-user mr-10"></i>Profile</Link></li>
                                            <li className="nav-item"><a className="nav-link" href="#" onClick={handleLogout}><i className="fi-rs-sign-out mr-10"></i>Logout</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    {tab === 'dashboard' && (
                                        <div className="card">
                                            <div className="card-header"><h3 className="mb-0">Hello {user.name || 'User'}!</h3></div>
                                            <div className="card-body">
                                                <p>From your account dashboard you can view your recent orders, manage your shipping addresses, and edit your profile.</p>
                                                <div className="row mt-20">
                                                    <div className="col-4 text-center">
                                                        <div className="p-3 border rounded">
                                                            <h2 className="text-brand">{orders.length}</h2>
                                                            <p className="mb-0">Orders</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-4 text-center">
                                                        <div className="p-3 border rounded">
                                                            <h2 className="text-brand">{wishlistCount}</h2>
                                                            <p className="mb-0">Wishlist</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-4 text-center">
                                                        <div className="p-3 border rounded">
                                                            <h2 className="text-brand">{addresses.length}</h2>
                                                            <p className="mb-0">Addresses</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tab === 'orders' && (
                                        <div className="card">
                                            <div className="card-header"><h5 className="mb-0">Your Orders</h5></div>
                                            <div className="card-body">
                                                {orders.length === 0 ? (
                                                    <p>No orders yet. <Link to="/shop">Start shopping!</Link></p>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table">
                                                            <thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th>Items</th></tr></thead>
                                                            <tbody>
                                                                {orders.map(order => (
                                                                    <tr key={order.id}>
                                                                        <td><strong>#{order.orderNumber}</strong></td>
                                                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                                        <td><span className={`badge bg-${statusColors[order.orderStatus]||'secondary'}`}>{order.orderStatus}</span></td>
                                                                        <td>₹{parseFloat(order.total).toFixed(2)}</td>
                                                                        <td>
                                                                            {order.items?.map(item => (
                                                                                <small key={item.id} className="d-block">{item.productName} × {item.quantity}</small>
                                                                            ))}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {tab === 'addresses' && (
                                        <div className="card">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">My Addresses</h5>
                                                <button className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff' }} onClick={() => setShowAddressForm(!showAddressForm)}>+ Add New</button>
                                            </div>
                                            <div className="card-body">
                                                {showAddressForm && (
                                                    <div className="mb-20 p-3 border rounded">
                                                        <div className="row">
                                                            <div className="col-md-6 mb-10"><input type="text" className="form-control" placeholder="Name *" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} /></div>
                                                            <div className="col-md-6 mb-10"><input type="text" className="form-control" placeholder="Phone *" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} /></div>
                                                            <div className="col-12 mb-10"><textarea className="form-control" placeholder="Address *" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})}></textarea></div>
                                                            <div className="col-md-4 mb-10"><input type="text" className="form-control" placeholder="City *" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} /></div>
                                                            <div className="col-md-4 mb-10"><input type="text" className="form-control" placeholder="State *" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} /></div>
                                                            <div className="col-md-4 mb-10"><input type="text" className="form-control" placeholder="Pincode *" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} /></div>
                                                        </div>
                                                        <button type="button" className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleSaveAddress}>Save</button>
                                                    </div>
                                                )}
                                                <div className="row">
                                                    {addresses.map(addr => (
                                                        <div key={addr.id} className="col-md-6 mb-15">
                                                            <div className="card p-3">
                                                                <strong>{addr.name}</strong>
                                                                <p className="mb-0 font-sm">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                                                <small>{addr.phone}</small>
                                                                {addr.isDefault && <span className="badge bg-success mt-5 w-25">Default</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tab === 'profile' && (
                                        <div className="card">
                                            <div className="card-header"><h5 className="mb-0">Profile</h5></div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6 mb-15">
                                                        <label>Name</label>
                                                        <p className="font-lg"><strong>{user.name}</strong></p>
                                                    </div>
                                                    <div className="col-md-6 mb-15">
                                                        <label>Email</label>
                                                        <p className="font-lg"><strong>{user.email || 'Not Provided'}</strong></p>
                                                    </div>
                                                    <div className="col-md-6 mb-15">
                                                        <label>Phone</label>
                                                        <p className="font-lg"><strong>{user.phone}</strong></p>
                                                    </div>
                                                    <div className="col-md-6 mb-15">
                                                        <label>Member Since</label>
                                                        <p className="font-lg"><strong>{new Date(user.createdAt).toLocaleDateString()}</strong></p>
                                                    </div>
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
        </main>
    );
};

export default Dashboard;
