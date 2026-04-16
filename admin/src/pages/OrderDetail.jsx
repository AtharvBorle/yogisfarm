import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [courierPartners, setCourierPartners] = useState([]);
    const [isStatusOpen, setStatusOpen] = useState(false);
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [isDeliveryOptionOpen, setDeliveryOptionOpen] = useState(false);
    const [isManageOpen, setManageOpen] = useState(false);
    const [statusForm, setStatusForm] = useState('');
    const [paymentForm, setPaymentForm] = useState({ paymentStatus: '', paymentDescription: '' });

    // Delivery option form
    const [deliveryOptionType, setDeliveryOptionType] = useState('delivery_boy');
    const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState('');
    const [selectedCourierPartnerId, setSelectedCourierPartnerId] = useState('');
    const [trackingId, setTrackingId] = useState('');

    // Manage form
    const [manageType, setManageType] = useState('delivery_boy');
    const [addDeliveryBoyForm, setAddDeliveryBoyForm] = useState({ name: '', phone: '', city: '', pincode: '' });
    const [addCourierForm, setAddCourierForm] = useState({ name: '', trackingLink: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders`);
            if (res.data.status) {
                const found = res.data.orders.find(o => o.orderNumber === orderNumber);
                if (found) {
                    const detail = await api.get(`/orders/${found.id}`);
                    if (detail.data.status) setOrder(detail.data.order);
                }
            }
        } catch (err) { toast.error('Failed to load order'); }
    };

    const fetchDeliveryBoys = async () => {
        try {
            const res = await api.get('/delivery-boys');
            if (res.data.status) setDeliveryBoys(res.data.deliveryBoys);
        } catch (err) { /* ignore */ }
    };

    const fetchCourierPartners = async () => {
        try {
            const res = await api.get('/courier-partners');
            if (res.data.status) setCourierPartners(res.data.courierPartners);
        } catch (err) { /* ignore */ }
    };

    useEffect(() => { fetchOrder(); fetchDeliveryBoys(); fetchCourierPartners(); }, [orderNumber]);

    const updateStatus = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/orders/${order.id}/status`, { orderStatus: statusForm });
            if (res.data.status) { toast.success('Status updated'); setStatusOpen(false); fetchOrder(); }
        } catch (err) { toast.error('Update failed'); }
    };

    const updatePayment = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/orders/${order.id}/payment`, paymentForm);
            if (res.data.status) { toast.success('Payment updated'); setPaymentOpen(false); fetchOrder(); }
        } catch (err) { toast.error('Update failed'); }
    };

    const assignDeliveryOption = async (e) => {
        e.preventDefault();
        try {
            const payload = { deliveryType: deliveryOptionType };
            if (deliveryOptionType === 'delivery_boy') {
                if (!selectedDeliveryBoyId) { toast.error('Please select a delivery boy'); return; }
                payload.deliveryBoyId = selectedDeliveryBoyId;
            } else {
                if (!selectedCourierPartnerId) { toast.error('Please select a courier partner'); return; }
                payload.courierPartnerId = selectedCourierPartnerId;
                payload.trackingId = trackingId;
            }
            const res = await api.put(`/orders/${order.id}/delivery-option`, payload);
            if (res.data.status) { toast.success('Delivery option updated'); setDeliveryOptionOpen(false); fetchOrder(); }
        } catch (err) { toast.error('Assignment failed'); }
    };

    const handleAddDeliveryBoy = async (e) => {
        e.preventDefault();
        if (!addDeliveryBoyForm.name || !addDeliveryBoyForm.phone) { toast.error('Name and phone are required'); return; }
        try {
            const res = await api.post('/delivery-boys', addDeliveryBoyForm);
            if (res.data.status) {
                toast.success('Delivery boy added');
                setAddDeliveryBoyForm({ name: '', phone: '', city: '', pincode: '' });
                fetchDeliveryBoys();
            } else { toast.error(res.data.message); }
        } catch (err) { toast.error('Failed to add'); }
    };

    const handleAddCourier = async (e) => {
        e.preventDefault();
        if (!addCourierForm.name || !addCourierForm.trackingLink) { toast.error('Name and tracking link are required'); return; }
        try {
            const res = await api.post('/courier-partners', addCourierForm);
            if (res.data.status) {
                toast.success('Courier partner added');
                setAddCourierForm({ name: '', trackingLink: '' });
                fetchCourierPartners();
            } else { toast.error(res.data.message); }
        } catch (err) { toast.error('Failed to add'); }
    };

    const handleEditSave = async () => {
        try {
            if (manageType === 'delivery_boy') {
                const res = await api.put(`/delivery-boys/${editingId}`, editForm);
                if (res.data.status) { toast.success('Updated'); setEditingId(null); fetchDeliveryBoys(); }
                else { toast.error(res.data.message); }
            } else {
                const res = await api.put(`/courier-partners/${editingId}`, editForm);
                if (res.data.status) { toast.success('Updated'); setEditingId(null); fetchCourierPartners(); }
                else { toast.error(res.data.message); }
            }
        } catch (err) { toast.error('Update failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this?')) return;
        try {
            if (manageType === 'delivery_boy') {
                const res = await api.delete(`/delivery-boys/${id}`);
                if (res.data.status) { toast.success('Removed'); fetchDeliveryBoys(); }
            } else {
                const res = await api.delete(`/courier-partners/${id}`);
                if (res.data.status) { toast.success('Removed'); fetchCourierPartners(); }
            }
        } catch (err) { toast.error('Delete failed'); }
    };

    const openDeliveryOptionModal = () => {
        setDeliveryOptionType(order.deliveryType || 'delivery_boy');
        setSelectedDeliveryBoyId(order.deliveryBoyId || '');
        setSelectedCourierPartnerId(order.courierPartnerId || '');
        setTrackingId(order.trackingId || '');
        setDeliveryOptionOpen(true);
    };

    const formatDateTime = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
    };

    const statusColors = {
        placed: '#ffc107', pending: '#ffc107', confirmed: '#17a2b8', processing: '#6f42c1',
        shipped: '#007bff', delivered: '#28a745', cancelled: '#dc3545', returned: '#6c757d'
    };

    if (!order) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading order...</div>;

    const cardStyle = { border: '1px solid #e8e8e8', borderRadius: '10px', padding: '25px', background: '#fff', height: '100%' };
    const iconCircle = { width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#555', flexShrink: 0 };
    const labelStyle = { fontSize: '12px', color: '#999', marginBottom: '2px' };
    const valueStyle = { fontSize: '14px', fontWeight: '600', color: '#253D4E' };
    const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' };
    const radioLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#253D4E' }}>{order.orderNumber}</h2>
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '3px' }}>
                        Dashboard / Order / {order.orderNumber}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={openDeliveryOptionModal}
                        style={{ padding: '8px 18px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🚚 Delivery Option
                    </button>
                    <button onClick={() => { setManageType('delivery_boy'); setEditingId(null); setManageOpen(true); }}
                        style={{ padding: '8px 18px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚙️ Manage
                    </button>
                    <button onClick={() => navigate(`/orders/invoice/${order.orderNumber}`)}
                        style={{ padding: '8px 18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🖨 Print
                    </button>
                    <button onClick={() => navigate('/orders')}
                        style={{ padding: '8px 18px', background: '#253D4E', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ☰ Order List
                    </button>
                </div>
            </div>

            {/* 3 Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                {/* Contact Details */}
                <div style={cardStyle}>
                    <h5 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '16px', color: '#253D4E' }}>Contact Details</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconCircle}>👤</div>
                            <div>
                                <div style={labelStyle}>Name</div>
                                <div style={valueStyle}>{order.user?.name || 'N/A'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconCircle}>📱</div>
                            <div>
                                <div style={labelStyle}>Mobile No</div>
                                <div style={valueStyle}>+91 - {order.user?.phone}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconCircle}>✉️</div>
                            <div>
                                <div style={labelStyle}>Email Id</div>
                                <div style={valueStyle}>{order.user?.email || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                <div style={cardStyle}>
                    <h5 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '16px', color: '#253D4E' }}>Delivery Address</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={iconCircle}>📍</div>
                            <div>
                                <div style={labelStyle}>Address</div>
                                <div style={valueStyle}>{order.addressText}, {order.addressCity}, {order.addressState}, India - {order.addressPincode}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconCircle}>📞</div>
                            <div>
                                <div style={labelStyle}>Phone</div>
                                <div style={valueStyle}>+91 - {order.addressPhone}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                        <h5 style={{ fontWeight: '700', fontSize: '16px', color: '#253D4E', margin: 0 }}>Order Details</h5>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setPaymentForm({ paymentStatus: order.paymentStatus, paymentDescription: order.paymentDescription || '' }); setPaymentOpen(true); }}
                                style={{ padding: '4px 10px', background: '#ffc107', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                ✏️ Edit Payment
                            </button>
                            {!['delivered', 'cancelled', 'returned'].includes(order.orderStatus) && (
                                <button onClick={() => { setStatusForm(''); setStatusOpen(true); }}
                                    style={{ padding: '4px 10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                    ✏️ Edit Order
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconCircle}>📅</div>
                            <div>
                                <div style={labelStyle}>Date & Time</div>
                                <div style={valueStyle}>{formatDateTime(order.createdAt)}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconCircle}>📊</div>
                            <div>
                                <div style={labelStyle}>Order Status</div>
                                <span style={{
                                    padding: '4px 20px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                                    background: statusColors[order.orderStatus] || '#6c757d', color: '#fff'
                                }}>
                                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={iconCircle}>💳</div>
                            <div>
                                <div style={labelStyle}>Payment Status</div>
                                <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
                                    <span style={{ padding: '4px 14px', borderRadius: '4px 0 0 4px', fontSize: '12px', fontWeight: '600', background: '#28a745', color: '#fff' }}>
                                        {order.paymentMethod?.toUpperCase()}
                                    </span>
                                    <span style={{ padding: '4px 14px', borderRadius: '0 4px 4px 0', fontSize: '12px', fontWeight: '600', background: order.paymentStatus === 'completed' ? '#28a745' : order.paymentStatus === 'failed' ? '#dc3545' : '#ffc107', color: '#fff' }}>
                                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                    </span>
                                </div>
                                {order.paymentMethod === 'online' && order.paymentDescription && (
                                    <div style={{ fontSize: '12px', color: '#007bff', marginTop: '6px', fontWeight: '500' }}>
                                        💳 Payment ID: <strong>{order.paymentDescription}</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Info Card */}
            {(order.deliveryBoy || order.courierPartner) && (
                <div style={{ ...cardStyle, marginBottom: '25px' }}>
                    <h5 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '16px' }}>
                        {order.deliveryType === 'courier' ? '📦 Courier Partner' : '🚚 Delivery Boy'}
                    </h5>
                    {order.deliveryType === 'courier' && order.courierPartner ? (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600' }}>{order.courierPartner.name}</span>
                            {order.trackingId && (
                                <span style={{ fontSize: '13px', color: '#555' }}>Tracking ID: <strong>{order.trackingId}</strong></span>
                            )}
                            {order.courierPartner.trackingLink && (
                                <a href={order.courierPartner.trackingLink} target="_blank" rel="noreferrer"
                                    style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', background: '#007bff', color: '#fff', textDecoration: 'none' }}>
                                    Track
                                </a>
                            )}
                            <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', background: '#28a745', color: '#fff' }}>Assigned</span>
                        </div>
                    ) : order.deliveryBoy ? (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600' }}>{order.deliveryBoy.name}</span>
                            <span style={{ color: '#888' }}>{order.deliveryBoy.phone}</span>
                            {order.deliveryBoy.city && <span style={{ fontSize: '12px', color: '#555' }}>📍 {order.deliveryBoy.city}{order.deliveryBoy.pincode ? ` - ${order.deliveryBoy.pincode}` : ''}</span>}
                            <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', background: '#28a745', color: '#fff' }}>Assigned</span>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Order Note */}
            <div style={{ ...cardStyle, marginBottom: '25px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={iconCircle}>📝</div>
                    <strong>Order Note:</strong> <span style={{ color: '#555' }}>{order.orderNote || '—'}</span>
                </div>
            </div>

            {/* Products */}
            <h4 style={{ fontWeight: '700', marginBottom: '15px', color: '#253D4E' }}>Products</h4>
            <div style={{ ...cardStyle, marginBottom: '25px', padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                            {['#', 'PRODUCT', 'BRAND', 'PRICE', 'DISCOUNT', 'SUB TOTAL', 'GST', 'TOTAL', 'QUANTITY', 'GRAND TOTAL'].map(h => (
                                <th key={h} style={{ padding: '12px 10px', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(order.items || []).map((item, i) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px 10px' }}>{i + 1}</td>
                                <td style={{ padding: '12px 10px', fontWeight: '500' }}>{item.name}</td>
                                <td style={{ padding: '12px 10px' }}>{item.brand || item.product?.brand?.name || '—'}</td>
                                <td style={{ padding: '12px 10px' }}>₹{Number(item.price).toFixed(0)}</td>
                                <td style={{ padding: '12px 10px' }}>{Number(item.discount) > 0 ? `₹${Number(item.discount).toFixed(0)}` : '—'}</td>
                                <td style={{ padding: '12px 10px' }}>₹{Number(item.total).toFixed(2)}</td>
                                <td style={{ padding: '12px 10px' }}>₹{Number(item.gst).toFixed(0)}{item.product?.tax ? ` (${Number(item.product.tax.tax)}% Including)` : ''}</td>
                                <td style={{ padding: '12px 10px' }}>₹{Number(item.total).toFixed(0)}</td>
                                <td style={{ padding: '12px 10px' }}>{item.quantity}</td>
                                <td style={{ padding: '12px 10px', fontWeight: '600' }}>₹{(Number(item.total)).toFixed(0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ borderTop: '2px solid #dee2e6' }}>
                    {[
                        { label: 'Sub Total', value: `₹${Number(order.subtotal).toFixed(0)}` },
                        { label: 'Shipping Charges', value: `₹${Number(order.shipping).toFixed(0)}` },
                        { label: 'Coupon Discount', value: `₹${Number(order.discount).toFixed(0)}` },
                    ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', borderBottom: '1px solid #eee' }}>
                            <span style={{ fontWeight: '600' }}>{row.label}</span>
                            <span>{row.value}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', fontWeight: '700', fontSize: '20px' }}>
                        <span>TOTAL</span>
                        <span>₹{Number(order.total).toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* Edit Order Status Modal */}
            <GenericModal isOpen={isStatusOpen} title="Update Order Status" onClose={() => setStatusOpen(false)}>
                <form onSubmit={updateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <div style={{ marginBottom: '10px', padding: '10px 15px', background: '#f8f9fa', borderRadius: '6px', fontSize: '13px' }}>
                            Current Status: <strong style={{ color: statusColors[order.orderStatus], textTransform: 'capitalize' }}>{order.orderStatus}</strong>
                        </div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>New Status *</label>
                        <select value={statusForm} onChange={e => setStatusForm(e.target.value)} style={inputStyle}>
                            <option value="">Select Next Status</option>
                            {order.orderStatus === 'placed' && <option value="confirmed">Confirmed</option>}
                            {order.orderStatus === 'placed' && <option value="cancelled">Cancelled</option>}
                            {order.orderStatus === 'confirmed' && <option value="shipped">Shipped</option>}
                            {order.orderStatus === 'confirmed' && <option value="cancelled">Cancelled</option>}
                            {order.orderStatus === 'shipped' && <option value="delivered">Delivered</option>}
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={!statusForm} style={{ padding: '8px 20px', background: statusForm ? '#3BB77E' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: statusForm ? 'pointer' : 'not-allowed', fontWeight: '600' }}>Update</button>
                    </div>
                </form>
            </GenericModal>

            {/* Edit Payment Modal */}
            <GenericModal isOpen={isPaymentOpen} title="Update Payment Status" onClose={() => setPaymentOpen(false)}>
                <form onSubmit={updatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {order.paymentMethod === 'online' && order.paymentDescription && (
                        <div style={{ padding: '10px 15px', background: '#e3f2fd', borderRadius: '6px', fontSize: '13px' }}>
                            💳 Razorpay Payment ID: <strong style={{ color: '#007bff' }}>{order.paymentDescription}</strong>
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Payment Status</label>
                        <select value={paymentForm.paymentStatus} onChange={e => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })} style={inputStyle}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Notes</label>
                        <textarea value={paymentForm.paymentDescription} onChange={e => setPaymentForm({ ...paymentForm, paymentDescription: e.target.value })}
                            style={{ ...inputStyle, minHeight: '60px' }} placeholder="Admin notes..." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Update</button>
                    </div>
                </form>
            </GenericModal>

            {/* Delivery Option Modal */}
            <GenericModal isOpen={isDeliveryOptionOpen} title="Assign Delivery Option" onClose={() => setDeliveryOptionOpen(false)}>
                <form onSubmit={assignDeliveryOption} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Radio Selection */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ ...radioLabelStyle, background: deliveryOptionType === 'delivery_boy' ? '#e8f5e9' : '#f5f5f5', border: deliveryOptionType === 'delivery_boy' ? '2px solid #28a745' : '2px solid transparent' }}>
                            <input type="radio" name="deliveryOptionType" value="delivery_boy" checked={deliveryOptionType === 'delivery_boy'}
                                onChange={(e) => setDeliveryOptionType(e.target.value)} style={{ accentColor: '#28a745' }} />
                            🚚 Delivery Boy
                        </label>
                        <label style={{ ...radioLabelStyle, background: deliveryOptionType === 'courier' ? '#e3f2fd' : '#f5f5f5', border: deliveryOptionType === 'courier' ? '2px solid #007bff' : '2px solid transparent' }}>
                            <input type="radio" name="deliveryOptionType" value="courier" checked={deliveryOptionType === 'courier'}
                                onChange={(e) => setDeliveryOptionType(e.target.value)} style={{ accentColor: '#007bff' }} />
                            📦 Courier Partner
                        </label>
                    </div>

                    {/* Delivery Boy Dropdown */}
                    {deliveryOptionType === 'delivery_boy' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Select Delivery Boy</label>
                            <select value={selectedDeliveryBoyId} onChange={e => setSelectedDeliveryBoyId(e.target.value)} style={inputStyle}>
                                <option value="">-- Select Delivery Boy --</option>
                                {deliveryBoys.map(db => (
                                    <option key={db.id} value={db.id}>{db.name} ({db.phone})</option>
                                ))}
                            </select>
                            {deliveryBoys.length === 0 && (
                                <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '5px' }}>No delivery boys available. Use the ⚙️ Manage button to create one.</div>
                            )}
                        </div>
                    )}

                    {/* Courier Partner Dropdown + Tracking ID */}
                    {deliveryOptionType === 'courier' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Select Courier Partner</label>
                                <select value={selectedCourierPartnerId} onChange={e => setSelectedCourierPartnerId(e.target.value)} style={inputStyle}>
                                    <option value="">-- Select Courier Partner --</option>
                                    {courierPartners.map(cp => (
                                        <option key={cp.id} value={cp.id}>{cp.name}</option>
                                    ))}
                                </select>
                                {courierPartners.length === 0 && (
                                    <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '5px' }}>No courier partners available. Use the ⚙️ Manage button to create one.</div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tracking ID</label>
                                <input type="text" value={trackingId} onChange={e => setTrackingId(e.target.value)}
                                    placeholder="Enter tracking ID" style={inputStyle} />
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Assign</button>
                    </div>
                </form>
            </GenericModal>

            {/* Manage Delivery Boys / Courier Partners Modal */}
            <GenericModal isOpen={isManageOpen} title="Manage Delivery Boys / Courier Partners" onClose={() => { setManageOpen(false); setEditingId(null); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Radio Selection */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ ...radioLabelStyle, background: manageType === 'delivery_boy' ? '#e8f5e9' : '#f5f5f5', border: manageType === 'delivery_boy' ? '2px solid #28a745' : '2px solid transparent' }}>
                            <input type="radio" name="manageType" value="delivery_boy" checked={manageType === 'delivery_boy'}
                                onChange={(e) => { setManageType(e.target.value); setEditingId(null); }} style={{ accentColor: '#28a745' }} />
                            🚚 Delivery Boys
                        </label>
                        <label style={{ ...radioLabelStyle, background: manageType === 'courier' ? '#e3f2fd' : '#f5f5f5', border: manageType === 'courier' ? '2px solid #007bff' : '2px solid transparent' }}>
                            <input type="radio" name="manageType" value="courier" checked={manageType === 'courier'}
                                onChange={(e) => { setManageType(e.target.value); setEditingId(null); }} style={{ accentColor: '#007bff' }} />
                            📦 Courier Partners
                        </label>
                    </div>

                    {/* --- Delivery Boys List + Add --- */}
                    {manageType === 'delivery_boy' && (
                        <>
                            {/* Existing List */}
                            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Name</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Phone</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>City</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Pincode</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryBoys.length === 0 && (
                                            <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#999' }}>No delivery boys added yet</td></tr>
                                        )}
                                        {deliveryBoys.map(db => (
                                            <tr key={db.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                {editingId === db.id ? (
                                                    <>
                                                        <td style={{ padding: '6px 8px' }}><input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }} /></td>
                                                        <td style={{ padding: '6px 8px' }}><input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }} /></td>
                                                        <td style={{ padding: '6px 8px' }}><input value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }} /></td>
                                                        <td style={{ padding: '6px 8px' }}><input value={editForm.pincode || ''} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }} /></td>
                                                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                <button onClick={handleEditSave} style={{ padding: '3px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>Save</button>
                                                                <button onClick={() => setEditingId(null)} style={{ padding: '3px 10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ padding: '8px 10px', fontWeight: '500' }}>{db.name}</td>
                                                        <td style={{ padding: '8px 10px' }}>{db.phone}</td>
                                                        <td style={{ padding: '8px 10px' }}>{db.city || '—'}</td>
                                                        <td style={{ padding: '8px 10px' }}>{db.pincode || '—'}</td>
                                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                <button onClick={() => { setEditingId(db.id); setEditForm({ name: db.name, phone: db.phone, city: db.city || '', pincode: db.pincode || '' }); }}
                                                                    style={{ padding: '3px 10px', background: '#ffc107', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                                                                <button onClick={() => handleDelete(db.id)}
                                                                    style={{ padding: '3px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add New Form */}
                            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '15px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#253D4E' }}>➕ Add New Delivery Boy</div>
                                <form onSubmit={handleAddDeliveryBoy} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ flex: '1', minWidth: '120px' }}>
                                        <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '11px' }}>Name *</label>
                                        <input type="text" value={addDeliveryBoyForm.name} onChange={e => setAddDeliveryBoyForm({ ...addDeliveryBoyForm, name: e.target.value })}
                                            placeholder="Name" required style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }} />
                                    </div>
                                    <div style={{ flex: '1', minWidth: '120px' }}>
                                        <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '11px' }}>Phone *</label>
                                        <input type="text" value={addDeliveryBoyForm.phone} onChange={e => setAddDeliveryBoyForm({ ...addDeliveryBoyForm, phone: e.target.value })}
                                            placeholder="Phone" required style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }} />
                                    </div>
                                    <div style={{ flex: '1', minWidth: '100px' }}>
                                        <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '11px' }}>City</label>
                                        <input type="text" value={addDeliveryBoyForm.city} onChange={e => setAddDeliveryBoyForm({ ...addDeliveryBoyForm, city: e.target.value })}
                                            placeholder="City" style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }} />
                                    </div>
                                    <div style={{ flex: '1', minWidth: '80px' }}>
                                        <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '11px' }}>Pincode</label>
                                        <input type="text" value={addDeliveryBoyForm.pincode} onChange={e => setAddDeliveryBoyForm({ ...addDeliveryBoyForm, pincode: e.target.value })}
                                            placeholder="Pincode" style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }} />
                                    </div>
                                    <button type="submit" style={{ padding: '7px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>Add</button>
                                </form>
                            </div>
                        </>
                    )}

                    {/* --- Courier Partners List + Add --- */}
                    {manageType === 'courier' && (
                        <>
                            {/* Existing List */}
                            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Name</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Tracking Link</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courierPartners.length === 0 && (
                                            <tr><td colSpan="3" style={{ padding: '15px', textAlign: 'center', color: '#999' }}>No courier partners added yet</td></tr>
                                        )}
                                        {courierPartners.map(cp => (
                                            <tr key={cp.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                {editingId === cp.id ? (
                                                    <>
                                                        <td style={{ padding: '6px 8px' }}><input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }} /></td>
                                                        <td style={{ padding: '6px 8px' }}><input value={editForm.trackingLink || ''} onChange={e => setEditForm({ ...editForm, trackingLink: e.target.value })} style={{ ...inputStyle, padding: '5px 8px', fontSize: '12px' }} /></td>
                                                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                <button onClick={handleEditSave} style={{ padding: '3px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>Save</button>
                                                                <button onClick={() => setEditingId(null)} style={{ padding: '3px 10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ padding: '8px 10px', fontWeight: '500' }}>{cp.name}</td>
                                                        <td style={{ padding: '8px 10px' }}>
                                                            <a href={cp.trackingLink} target="_blank" rel="noreferrer" style={{ color: '#007bff', fontSize: '12px', wordBreak: 'break-all' }}>{cp.trackingLink}</a>
                                                        </td>
                                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                <button onClick={() => { setEditingId(cp.id); setEditForm({ name: cp.name, trackingLink: cp.trackingLink }); }}
                                                                    style={{ padding: '3px 10px', background: '#ffc107', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                                                                <button onClick={() => handleDelete(cp.id)}
                                                                    style={{ padding: '3px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add New Form */}
                            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '15px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#253D4E' }}>➕ Add New Courier Partner</div>
                                <form onSubmit={handleAddCourier} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ flex: '1', minWidth: '150px' }}>
                                        <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '11px' }}>Name *</label>
                                        <input type="text" value={addCourierForm.name} onChange={e => setAddCourierForm({ ...addCourierForm, name: e.target.value })}
                                            placeholder="Partner name" required style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }} />
                                    </div>
                                    <div style={{ flex: '2', minWidth: '200px' }}>
                                        <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '11px' }}>Tracking Link *</label>
                                        <input type="text" value={addCourierForm.trackingLink} onChange={e => setAddCourierForm({ ...addCourierForm, trackingLink: e.target.value })}
                                            placeholder="https://track.example.com/" required style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }} />
                                    </div>
                                    <button type="submit" style={{ padding: '7px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>Add</button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </GenericModal>
        </div>
    );
};

export default OrderDetail;
