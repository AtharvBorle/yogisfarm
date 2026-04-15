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
    const [isStatusOpen, setStatusOpen] = useState(false);
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [isDeliveryOpen, setDeliveryOpen] = useState(false);
    const [statusForm, setStatusForm] = useState('');
    const [paymentForm, setPaymentForm] = useState({ paymentStatus: '', paymentDescription: '' });
    const [deliveryForm, setDeliveryForm] = useState('');

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

    useEffect(() => { fetchOrder(); fetchDeliveryBoys(); }, [orderNumber]);

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

    const assignDelivery = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/orders/${order.id}/delivery-boy`, { deliveryBoyId: deliveryForm });
            if (res.data.status) { toast.success('Delivery boy assigned'); setDeliveryOpen(false); fetchOrder(); }
        } catch (err) { toast.error('Assignment failed'); }
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
                    <button onClick={() => { setDeliveryForm(order.deliveryBoyId || ''); setDeliveryOpen(true); }}
                        style={{ padding: '8px 18px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🚚 Delivery Boy
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
                            <button onClick={() => { setStatusForm(order.orderStatus); setStatusOpen(true); }}
                                style={{ padding: '4px 10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                                ✏️ Edit Order
                            </button>
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
                                <div style={{ display: 'flex', gap: '0' }}>
                                    <span style={{ padding: '4px 14px', borderRadius: '4px 0 0 4px', fontSize: '12px', fontWeight: '600', background: '#28a745', color: '#fff' }}>
                                        {order.paymentMethod?.toUpperCase()}
                                    </span>
                                    <span style={{ padding: '4px 14px', borderRadius: '0 4px 4px 0', fontSize: '12px', fontWeight: '600', background: '#ffc107', color: '#fff' }}>
                                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Boy */}
            {order.deliveryBoy && (
                <div style={{ ...cardStyle, marginBottom: '25px' }}>
                    <h5 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '16px' }}>Delivery Boy</h5>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600' }}>{order.deliveryBoy.name}</span>
                        <span style={{ color: '#888' }}>{order.deliveryBoy.phone}</span>
                        <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', background: '#28a745', color: '#fff' }}>Assigned</span>
                    </div>
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
            <GenericModal isOpen={isStatusOpen} title="Order Details" onClose={() => setStatusOpen(false)}>
                <form onSubmit={updateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Status *</label>
                        <select value={statusForm} onChange={e => setStatusForm(e.target.value)} style={inputStyle}>
                            <option value="">Select</option>
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Update</button>
                    </div>
                </form>
            </GenericModal>

            {/* Edit Payment Modal */}
            <GenericModal isOpen={isPaymentOpen} title="Update Payment Status" onClose={() => setPaymentOpen(false)}>
                <form onSubmit={updatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Payment Status</label>
                        <select value={paymentForm.paymentStatus} onChange={e => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })} style={inputStyle}>
                            <option value="pending">Pending</option>
                            <option value="verified">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description</label>
                        <textarea value={paymentForm.paymentDescription} onChange={e => setPaymentForm({ ...paymentForm, paymentDescription: e.target.value })}
                            style={{ ...inputStyle, minHeight: '60px' }} placeholder="Notes..." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Update</button>
                    </div>
                </form>
            </GenericModal>

            {/* Assign Delivery Boy Modal */}
            <GenericModal isOpen={isDeliveryOpen} title="Assign Delivery Boy" onClose={() => setDeliveryOpen(false)}>
                <form onSubmit={assignDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Delivery Boy</label>
                        <select value={deliveryForm} onChange={e => setDeliveryForm(e.target.value)} required style={inputStyle}>
                            <option value="">-- Select --</option>
                            {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name} ({db.phone})</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Assign</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default OrderDetail;
