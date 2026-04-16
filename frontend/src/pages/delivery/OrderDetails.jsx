import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api'; // Fixed from ../../../api
import toast from 'react-hot-toast';

const DeliveryOrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/delivery/orders/${id}`);
            if (res.data.status) {
                setOrder(res.data.order);
            } else {
                toast.error(res.data.message);
                navigate('/delivery/dashboard');
            }
        } catch (err) {
            toast.error('Failed to load order');
            navigate('/delivery/dashboard');
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Mark this order as ${newStatus.replace(/_/g, ' ')}?`)) return;
        setLoading(true);
        try {
            const res = await api.put(`/delivery/orders/${id}/status`, { orderStatus: newStatus });
            if (res.data.status) {
                toast.success('Status updated successfully');
                fetchOrder();
                if (newStatus === 'delivered') {
                    setTimeout(() => {
                        navigate('/delivery/dashboard');
                    }, 1500);
                }
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    if (!order) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

    const isCod = order.paymentMethod === 'cod';

    return (
        <div style={{ background: '#f4f6f8', minHeight: '100vh', paddingBottom: '30px' }}>
            {/* Header */}
            <div style={{ background: '#fff', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate('/delivery/dashboard')} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}>←</button>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#253D4E' }}>Order {order.orderNumber}</h2>
            </div>

            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Status Card */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#7E7E7E', marginBottom: '4px' }}>Current Status</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: order.orderStatus === 'delivered' ? '#28a745' : order.orderStatus === 'out_for_delivery' ? '#fd7e14' : '#007bff' }}>
                            {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                        </div>
                    </div>
                    {isCod && order.paymentStatus === 'pending' && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#7E7E7E', marginBottom: '4px' }}>Collect Cash</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>₹{Number(order.total).toFixed(0)}</div>
                        </div>
                    )}
                </div>

                {/* Customer Details */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>Customer Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#444' }}>
                        <div><strong>Name:</strong> {order.user?.name || order.addressName}</div>
                        <div><strong>Phone:</strong> {order.user?.phone || order.addressPhone}
                            <a href={`tel:${order.user?.phone}`} style={{ marginLeft: '10px', background: '#e3f2fd', color: '#007bff', padding: '3px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>Call</a>
                        </div>
                    </div>
                </div>

                {/* Address Details */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>Delivery Address</h3>
                    <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.5' }}>
                        {order.addressText}<br />
                        {order.addressCity}, {order.addressState} - {order.addressPincode}
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.addressText}, ${order.addressCity}, ${order.addressPincode}`)}`} 
                           target="_blank" rel="noreferrer" 
                           style={{ display: 'inline-block', background: '#f4f6f8', color: '#253D4E', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
                           🗺️ Open in Google Maps
                        </a>
                    </div>
                </div>

                {/* Order Items */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>Items to Deliver</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {order.items?.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#444' }}>
                                <span>{item.quantity}x {item.name}</span>
                                <span style={{ fontWeight: '500' }}>₹{Number(item.total).toFixed(0)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #f0f0f0', paddingTop: '10px', marginTop: '5px' }}>
                            <span>Total Amount {isCod ? '(COD)' : '(Paid)'}</span>
                            <span>₹{Number(order.total).toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {order.orderStatus === 'shipped' && (
                    <button 
                        onClick={() => handleStatusUpdate('out_for_delivery')}
                        disabled={loading}
                        style={{ background: '#fd7e14', color: '#fff', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        {loading ? 'Updating...' : 'Mark Out For Delivery'}
                    </button>
                )}

                {order.orderStatus === 'out_for_delivery' && (
                    <div style={{ background: isCod ? '#ffeedb' : '#e8f5e9', padding: '20px', borderRadius: '12px', border: `2px solid ${isCod ? '#fd7e14' : '#28a745'}`, marginTop: '10px', textAlign: 'center' }}>
                        {isCod && (
                            <p style={{ margin: '0 0 15px 0', color: '#dc3545', fontWeight: 'bold', fontSize: '15px' }}>
                                ⚠️ Collect ₹{Number(order.total).toFixed(0)} Cash
                            </p>
                        )}
                        <button 
                            onClick={() => handleStatusUpdate('delivered')}
                            disabled={loading}
                            style={{ background: '#28a745', color: '#fff', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                            {loading ? 'Updating...' : 'Confirm Delivery'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryOrderDetails;
