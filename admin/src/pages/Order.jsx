import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Order = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [filters, setFilters] = useState({ orderStatus: '', paymentMethod: '', paymentStatus: '' });
    const [isViewOpen, setViewOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

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

    useEffect(() => { fetchOrders(); }, []);
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

    const statusColors = {
        placed: '#ffc107', pending: '#ffc107', confirmed: '#17a2b8', processing: '#6f42c1',
        shipped: '#007bff', delivered: '#28a745', cancelled: '#dc3545', returned: '#6c757d'
    };

    const paymentColors = { pending: '#ffc107', verified: '#28a745', completed: '#28a745', failed: '#dc3545', refunded: '#6c757d' };

    const formatDateTime = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
    };

    const columns = [
        {
            header: 'ORDER ID',
            render: (row) => <span style={{ color: '#046938', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate(`/orders/detail/${row.orderNumber}`)}>{row.orderNumber}</span>
        },
        {
            header: 'CUSTOMER',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '500' }}>{row.user?.name || 'N/A'}</div>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: '#e8f5e9', color: '#046938' }}>{row.user?.phone}</span>
                </div>
            )
        },
        { header: 'AMOUNT', render: (row) => <strong>₹{Number(row.total).toFixed(0)}</strong> },
        {
            header: 'DELIVERY',
            render: (row) => {
                const isAssigned = row.deliveryBoy || row.courierPartner;
                const isCourier = row.deliveryType === 'courier';
                return (
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', background: isAssigned ? (isCourier ? '#e3f2fd' : '#e8f5e9') : '#fde8e8', color: isAssigned ? (isCourier ? '#007bff' : '#28a745') : '#dc3545' }}>
                        {isCourier && row.courierPartner ? `📦 ${row.courierPartner.name}` : row.deliveryBoy ? `🚚 ${row.deliveryBoy.name}` : 'Not Assigned'}
                    </span>
                );
            }
        },
        {
            header: 'STATUS',
            render: (row) => (
                <span style={{
                    padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                    background: statusColors[row.orderStatus] || '#6c757d', color: '#fff'
                }}>
                    {row.orderStatus === 'placed' ? 'Order Placed' : row.orderStatus.charAt(0).toUpperCase() + row.orderStatus.slice(1)}
                </span>
            )
        },
        {
            header: 'PAYMENT',
            render: (row) => (
                <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                    background: (paymentColors[row.paymentStatus] || '#6c757d'), color: '#fff'
                }}>
                    {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
                </span>
            )
        },
        {
            header: 'CREATED ON',
            render: (row) => <span style={{ fontSize: '12px', color: '#888' }}>{formatDateTime(row.createdAt)}</span>
        },
        {
            header: 'ACTIONS',
            render: (row) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => navigate(`/orders/detail/${row.orderNumber}`)} title="Edit"
                        style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                    <button onClick={() => openViewModal(row)} title="View"
                        style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', background: '#ffc107', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁</button>
                    <button onClick={() => navigate(`/orders/invoice/${row.orderNumber}`)} title="Invoice"
                        style={{ width: '28px', height: '28px', borderRadius: '4px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</button>
                </div>
            )
        }
    ];

    const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', minWidth: '120px' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Order Management</h2>
                <div style={{ fontSize: '14px', color: '#666' }}>Total: {orders.length} orders</div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Order Status</label>
                    <select value={filters.orderStatus} onChange={e => setFilters({ ...filters, orderStatus: e.target.value })} style={inputStyle}>
                        <option value="">All</option>
                        <option value="placed">Placed</option>
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

            <DataTable columns={columns} data={orders} />

            {/* Quick View Modal */}
            <GenericModal isOpen={isViewOpen} title={`Order Details`} onClose={() => setViewOpen(false)}>
                {selectedOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Top Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '5px' }}>Name: {selectedOrder.user?.name}</div>
                                <div style={{ fontSize: '13px', color: '#555' }}>Address: {selectedOrder.addressText},{selectedOrder.addressCity}, {selectedOrder.addressState}, India - {selectedOrder.addressPincode}</div>
                                <div style={{ fontSize: '13px', color: '#555' }}>Email Id: {selectedOrder.user?.email}</div>
                                <div style={{ fontSize: '13px', color: '#555' }}>Phone Number: +91 - {selectedOrder.user?.phone}</div>
                            </div>
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 15px', fontSize: '13px' }}>
                                    <span style={{ fontWeight: '600' }}>Order #</span><span style={{ color: '#046938' }}>{selectedOrder.orderNumber}</span>
                                    <span style={{ fontWeight: '600' }}>Order Status</span>
                                    <span><span style={{ padding: '2px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', background: statusColors[selectedOrder.orderStatus] || '#6c757d', color: '#fff' }}>{selectedOrder.orderStatus === 'placed' ? 'Order Placed' : selectedOrder.orderStatus}</span></span>
                                    <span style={{ fontWeight: '600' }}>Order Date</span><span>{formatDateTime(selectedOrder.createdAt)}</span>
                                    <span style={{ fontWeight: '600' }}>Total Amount</span><span>₹{Number(selectedOrder.total).toFixed(0)}</span>
                                    <span style={{ fontWeight: '600' }}>Payment Method</span><span>{selectedOrder.paymentMethod === 'cod' ? 'Cash On Delivery' : selectedOrder.paymentMethod?.toUpperCase()}</span>
                                    <span style={{ fontWeight: '600' }}>Payment Status</span>
                                    <span><span style={{ padding: '2px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', background: paymentColors[selectedOrder.paymentStatus] || '#ffc107', color: '#fff' }}>{selectedOrder.paymentStatus}</span></span>
                                    <span style={{ fontWeight: '600' }}>Address Type</span><span>{selectedOrder.addressType || 'Home'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>PRODUCT</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>BRAND</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>PRICE</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>QUANTITY</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedOrder.items || []).map((item, i) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px' }}>{i + 1}</td>
                                        <td style={{ padding: '8px' }}>{item.name}</td>
                                        <td style={{ padding: '8px' }}>{item.brand || '—'}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{Number(item.price).toFixed(0)}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>₹{Number(item.total).toFixed(0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div>
                            {[
                                { label: 'Sub Total', value: `₹${Number(selectedOrder.subtotal).toFixed(0)}` },
                                { label: 'Shipping Charges', value: `₹${Number(selectedOrder.shipping).toFixed(0)}` },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span style={{ fontWeight: '600' }}>{row.label}</span>
                                    <span>{row.value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: '700', fontSize: '18px' }}>
                                <span>TOTAL</span>
                                <span>₹{Number(selectedOrder.total).toFixed(0)}</span>
                            </div>
                        </div>

                        {/* Second order section - delivery info */}
                        <div style={{ marginTop: '10px', fontSize: '13px', color: '#555' }}>
                            <div>Address: {selectedOrder.addressText},{selectedOrder.addressCity}, {selectedOrder.addressState}, India - {selectedOrder.addressPincode}</div>
                            <div>Email Id: {selectedOrder.user?.email}</div>
                            <div>Phone Number: +91 - {selectedOrder.user?.phone}</div>
                        </div>
                    </div>
                )}
            </GenericModal>
        </div>
    );
};

export default Order;
