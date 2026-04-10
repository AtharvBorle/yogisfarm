import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [filters, setFilters] = useState({ orderStatus: '', paymentMethod: '', paymentStatus: '' });
    const [isViewOpen, setViewOpen] = useState(false);
    const [isStatusOpen, setStatusOpen] = useState(false);
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [isDeliveryOpen, setDeliveryOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Form states
    const [statusForm, setStatusForm] = useState('');
    const [paymentForm, setPaymentForm] = useState({ paymentStatus: '', paymentDescription: '' });
    const [deliveryForm, setDeliveryForm] = useState('');

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.orderStatus) params.set('status', filters.orderStatus);
            if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
            if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
            const res = await api.get(`/orders?${params.toString()}`);
            if (res.data.status) setOrders(res.data.orders);
        } catch (err) {
            toast.error('Failed to load orders');
        }
    };

    const fetchDeliveryBoys = async () => {
        try {
            const res = await api.get('/delivery-boys');
            if (res.data.status) setDeliveryBoys(res.data.deliveryBoys);
        } catch (err) { /* ignore */ }
    };

    useEffect(() => { fetchOrders(); fetchDeliveryBoys(); }, []);
    useEffect(() => { fetchOrders(); }, [filters]);

    const openViewModal = async (row) => {
        try {
            const res = await api.get(`/orders/${row.id}`);
            if (res.data.status) {
                setSelectedOrder(res.data.order);
                setViewOpen(true);
            }
        } catch (err) { toast.error('Failed to load order details'); }
    };

    const openStatusModal = (row) => {
        setSelectedOrder(row);
        setStatusForm(row.orderStatus);
        setStatusOpen(true);
    };

    const openPaymentModal = (row) => {
        setSelectedOrder(row);
        setPaymentForm({ paymentStatus: row.paymentStatus, paymentDescription: row.paymentDescription || '' });
        setPaymentOpen(true);
    };

    const openDeliveryModal = (row) => {
        setSelectedOrder(row);
        setDeliveryForm(row.deliveryBoyId || '');
        setDeliveryOpen(true);
    };

    const updateOrderStatus = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/orders/${selectedOrder.id}/status`, { orderStatus: statusForm });
            if (res.data.status) { toast.success('Order status updated'); setStatusOpen(false); fetchOrders(); }
        } catch (err) { toast.error('Update failed'); }
    };

    const updatePayment = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/orders/${selectedOrder.id}/payment`, paymentForm);
            if (res.data.status) { toast.success('Payment updated'); setPaymentOpen(false); fetchOrders(); }
        } catch (err) { toast.error('Update failed'); }
    };

    const assignDeliveryBoy = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/orders/${selectedOrder.id}/delivery-boy`, { deliveryBoyId: deliveryForm });
            if (res.data.status) { toast.success('Delivery boy assigned'); setDeliveryOpen(false); fetchOrders(); }
        } catch (err) { toast.error('Assignment failed'); }
    };

    const statusColors = {
        pending: '#ffc107', confirmed: '#17a2b8', processing: '#6f42c1',
        shipped: '#007bff', delivered: '#28a745', cancelled: '#dc3545', returned: '#6c757d'
    };

    const paymentColors = { pending: '#ffc107', verified: '#28a745', failed: '#dc3545', refunded: '#6c757d' };

    const columns = [
        { header: '#', render: (row) => row.orderNumber },
        {
            header: 'Customer',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '500' }}>{row.user?.name || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{row.user?.phone}</div>
                </div>
            )
        },
        { header: 'Total', render: (row) => <strong>₹{Number(row.total).toFixed(2)}</strong> },
        { header: 'Payment', render: (row) => <span style={{ fontSize: '12px' }}>{row.paymentMethod?.toUpperCase()}</span> },
        {
            header: 'Order Status',
            render: (row) => (
                <span onClick={() => openStatusModal(row)} style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer',
                    background: (statusColors[row.orderStatus] || '#6c757d') + '22',
                    color: statusColors[row.orderStatus] || '#6c757d', fontWeight: '600', border: `1px solid ${statusColors[row.orderStatus] || '#6c757d'}40`
                }}>
                    {row.orderStatus}
                </span>
            )
        },
        {
            header: 'Pay Status',
            render: (row) => (
                <span onClick={() => openPaymentModal(row)} style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer',
                    background: (paymentColors[row.paymentStatus] || '#6c757d') + '22',
                    color: paymentColors[row.paymentStatus] || '#6c757d', fontWeight: '600', border: `1px solid ${paymentColors[row.paymentStatus] || '#6c757d'}40`
                }}>
                    {row.paymentStatus}
                </span>
            )
        },
        {
            header: 'Delivery',
            render: (row) => (
                <span onClick={() => openDeliveryModal(row)} style={{ fontSize: '12px', cursor: 'pointer', color: row.deliveryBoy ? '#28a745' : '#dc3545', textDecoration: 'underline' }}>
                    {row.deliveryBoy?.name || 'Assign'}
                </span>
            )
        },
        {
            header: 'Date',
            render: (row) => <span style={{ fontSize: '12px', color: '#888' }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</span>
        }
    ];

    const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Order Management</h2>
                <div style={{ fontSize: '14px', color: '#666' }}>Total: {orders.length} orders</div>
            </div>

            {/* ─── Filters ─── */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Order Status</label>
                    <select value={filters.orderStatus} onChange={e => setFilters({ ...filters, orderStatus: e.target.value })} style={inputStyle}>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Payment Method</label>
                    <select value={filters.paymentMethod} onChange={e => setFilters({ ...filters, paymentMethod: e.target.value })} style={inputStyle}>
                        <option value="">All</option>
                        <option value="cod">COD</option>
                        <option value="online">Online</option>
                        <option value="upi">UPI</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Payment Status</label>
                    <select value={filters.paymentStatus} onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })} style={inputStyle}>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={() => setFilters({ orderStatus: '', paymentMethod: '', paymentStatus: '' })}
                        style={{ padding: '8px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Clear Filters
                    </button>
                </div>
            </div>

            <DataTable columns={columns} data={orders} onView={openViewModal} />

            {/* ─── Order Detail View ─── */}
            <GenericModal isOpen={isViewOpen} title={`Order #${selectedOrder?.orderNumber || ''}`} onClose={() => setViewOpen(false)}>
                {selectedOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                                <div style={{ fontSize: '12px', color: '#888' }}>Customer</div>
                                <div style={{ fontWeight: '600' }}>{selectedOrder.user?.name || 'N/A'}</div>
                                <div style={{ fontSize: '13px' }}>{selectedOrder.user?.phone} | {selectedOrder.user?.email}</div>
                            </div>
                            <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                                <div style={{ fontSize: '12px', color: '#888' }}>Delivery Address</div>
                                <div style={{ fontWeight: '600' }}>{selectedOrder.addressName}</div>
                                <div style={{ fontSize: '13px' }}>{selectedOrder.addressText}, {selectedOrder.addressCity}, {selectedOrder.addressState} - {selectedOrder.addressPincode}</div>
                                <div style={{ fontSize: '13px' }}>📞 {selectedOrder.addressPhone}</div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div style={{ padding: '12px', background: '#f0f7f4', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Subtotal:</span><span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Shipping:</span><span>₹{Number(selectedOrder.shipping).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Discount:</span><span style={{ color: '#28a745' }}>-₹{Number(selectedOrder.discount).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Tax:</span><span>₹{Number(selectedOrder.tax).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', borderTop: '1px solid #ccc', paddingTop: '6px' }}><span>Total:</span><span>₹{Number(selectedOrder.total).toFixed(2)}</span></div>
                            {selectedOrder.couponCode && <div style={{ fontSize: '12px', color: '#6f42c1', marginTop: '4px' }}>🎫 Coupon: {selectedOrder.couponCode}</div>}
                        </div>

                        {/* Status row */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <div style={{ padding: '8px 12px', background: '#e8f5e9', borderRadius: '6px', fontSize: '13px' }}>
                                <strong>Order:</strong> {selectedOrder.orderStatus}
                            </div>
                            <div style={{ padding: '8px 12px', background: '#fff3e0', borderRadius: '6px', fontSize: '13px' }}>
                                <strong>Payment:</strong> {selectedOrder.paymentMethod} — {selectedOrder.paymentStatus}
                            </div>
                            {selectedOrder.deliveryBoy && (
                                <div style={{ padding: '8px 12px', background: '#e3f2fd', borderRadius: '6px', fontSize: '13px' }}>
                                    <strong>Delivery:</strong> {selectedOrder.deliveryBoy.name} ({selectedOrder.deliveryBoy.phone})
                                </div>
                            )}
                        </div>

                        {selectedOrder.orderNote && (
                            <div style={{ padding: '10px', background: '#fffde7', borderRadius: '6px', fontSize: '13px' }}>
                                📝 <strong>Note:</strong> {selectedOrder.orderNote}
                            </div>
                        )}

                        {/* Order items */}
                        <div>
                            <strong>Items ({selectedOrder.items?.length || 0}):</strong>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                        <th style={{ padding: '8px', textAlign: 'left' }}>Product</th>
                                        <th style={{ padding: '8px', textAlign: 'left' }}>Variant</th>
                                        <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                                        <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
                                        <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedOrder.items || []).map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px' }}>
                                                <div>{item.name}</div>
                                                {item.brand && <div style={{ fontSize: '11px', color: '#888' }}>{item.brand}</div>}
                                            </td>
                                            <td style={{ padding: '8px', fontSize: '13px' }}>{item.variant || '—'}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>₹{Number(item.price).toFixed(2)}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>₹{Number(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </GenericModal>

            {/* ─── Change Order Status ─── */}
            <GenericModal isOpen={isStatusOpen} title="Update Order Status" onClose={() => setStatusOpen(false)}>
                <form onSubmit={updateOrderStatus} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={labelStyle}>Order Status</label>
                        <select value={statusForm} onChange={e => setStatusForm(e.target.value)} style={inputStyle}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update Status</button>
                    </div>
                </form>
            </GenericModal>

            {/* ─── Update Payment ─── */}
            <GenericModal isOpen={isPaymentOpen} title="Update Payment Status" onClose={() => setPaymentOpen(false)}>
                <form onSubmit={updatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={labelStyle}>Payment Status</label>
                        <select value={paymentForm.paymentStatus} onChange={e => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })} style={inputStyle}>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Payment Notes</label>
                        <textarea value={paymentForm.paymentDescription} onChange={e => setPaymentForm({ ...paymentForm, paymentDescription: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} placeholder="Transaction ID, notes..." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update Payment</button>
                    </div>
                </form>
            </GenericModal>

            {/* ─── Assign Delivery Boy ─── */}
            <GenericModal isOpen={isDeliveryOpen} title="Assign Delivery Boy" onClose={() => setDeliveryOpen(false)}>
                <form onSubmit={assignDeliveryBoy} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={labelStyle}>Delivery Boy</label>
                        <select value={deliveryForm} onChange={e => setDeliveryForm(e.target.value)} required style={inputStyle}>
                            <option value="">-- Select --</option>
                            {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name} ({db.phone})</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Assign</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default Order;
