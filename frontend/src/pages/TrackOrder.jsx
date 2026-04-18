import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import FeatureBanners from '../components/FeatureBanners';

const statusSteps = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
const statusLabels = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const [orderCode, setOrderCode] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-track if ?order= is in the URL (from SMS link)
    useEffect(() => {
        const code = searchParams.get('order');
        if (code) {
            setOrderCode(code);
            fetchOrder(code);
        }
    }, [searchParams]);

    const fetchOrder = async (code) => {
        setLoading(true);
        setError('');
        setOrder(null);
        try {
            const res = await api.get(`/orders/track/${code}`);
            if (res.data.status) {
                setOrder(res.data.order);
            } else {
                setError(res.data.message || 'Order not found');
            }
        } catch (err) {
            setError('Could not fetch order. Please check the order number.');
        }
        setLoading(false);
    };

    const handleTrack = (e) => {
        e.preventDefault();
        if (orderCode.trim()) fetchOrder(orderCode.trim());
    };

    const currentStepIndex = order ? statusSteps.indexOf(order.orderStatus) : -1;
    const isCancelled = order?.orderStatus === 'cancelled';

    return (
        <main className="main">
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Track Order
                    </div>
                </div>
            </div>

            <div className="container mt-80 mb-80">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10" style={{ border: '1px solid #f2f2f2', borderRadius: '10px', padding: 0, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#D9D9D9', padding: '20px', textAlign: 'center', fontWeight: '700', color: '#7E7E7E', fontSize: '18px' }}>
                            Check Your Order Status
                        </div>
                        <div style={{ padding: '40px', background: '#fff' }}>
                            <form onSubmit={handleTrack} style={{ textAlign: 'center', marginBottom: order ? '30px' : 0 }}>
                                <input
                                    type="text"
                                    placeholder="Enter Order Code (e.g. YF-O26-04-0001)"
                                    value={orderCode}
                                    onChange={(e) => setOrderCode(e.target.value)}
                                    style={{
                                        padding: '18px',
                                        border: '1px solid #ececec',
                                        borderRadius: '8px',
                                        width: '100%',
                                        maxWidth: '500px',
                                        marginBottom: '20px',
                                        fontSize: '16px'
                                    }}
                                    required
                                />
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#046938',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '15px 50px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        {loading ? 'Tracking...' : 'Track Order'}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div style={{ textAlign: 'center', color: '#e74c3c', fontWeight: '600', marginTop: '20px', fontSize: '15px' }}>
                                    {error}
                                </div>
                            )}

                            {order && (
                                <div style={{ marginTop: '30px' }}>
                                    {/* Order Info */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '25px', padding: '15px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
                                        <div>
                                            <span style={{ color: '#7E7E7E', fontSize: '13px' }}>Order Number</span>
                                            <div style={{ fontWeight: '700', color: '#253D4E', fontSize: '16px' }}>{order.orderNumber}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: '#7E7E7E', fontSize: '13px' }}>Order Date</span>
                                            <div style={{ fontWeight: '700', color: '#253D4E', fontSize: '16px' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: '#7E7E7E', fontSize: '13px' }}>Total</span>
                                            <div style={{ fontWeight: '700', color: '#046938', fontSize: '16px' }}>₹{parseFloat(order.total).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: '#7E7E7E', fontSize: '13px' }}>Payment</span>
                                            <div style={{ fontWeight: '700', color: '#253D4E', fontSize: '16px', textTransform: 'uppercase' }}>{order.paymentMethod}</div>
                                        </div>
                                    </div>

                                    {/* Status Timeline */}
                                    {isCancelled ? (
                                        <div style={{ textAlign: 'center', padding: '30px', background: '#fff3f3', borderRadius: '10px', border: '1px solid #ffdddd' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>❌</div>
                                            <div style={{ fontWeight: '700', color: '#e74c3c', fontSize: '18px' }}>Order Cancelled</div>
                                            <p style={{ color: '#7E7E7E', marginTop: '8px' }}>This order has been cancelled. If you have questions, please contact support.</p>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', padding: '20px 0' }}>
                                            {/* Progress Line */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '40px',
                                                left: '10%',
                                                right: '10%',
                                                height: '4px',
                                                background: '#e6e6e6',
                                                borderRadius: '2px',
                                                zIndex: 0
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
                                                    background: '#046938',
                                                    borderRadius: '2px',
                                                    transition: 'width 0.5s ease'
                                                }}></div>
                                            </div>

                                            {/* Steps */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                                {statusSteps.map((step, i) => {
                                                    const isCompleted = i <= currentStepIndex;
                                                    const isCurrent = i === currentStepIndex;
                                                    return (
                                                        <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                                                            <div style={{
                                                                width: isCurrent ? '36px' : '28px',
                                                                height: isCurrent ? '36px' : '28px',
                                                                borderRadius: '50%',
                                                                background: isCompleted ? '#046938' : '#e6e6e6',
                                                                border: isCurrent ? '3px solid #034a28' : 'none',
                                                                margin: '0 auto 10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#fff',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                boxShadow: isCurrent ? '0 0 0 4px rgba(4,105,56,0.2)' : 'none',
                                                                transition: 'all 0.3s'
                                                            }}>
                                                                {isCompleted ? '✓' : ''}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                fontWeight: isCurrent ? '700' : '500',
                                                                color: isCompleted ? '#046938' : '#aaa'
                                                            }}>
                                                                {statusLabels[step]}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    {order.items && order.items.length > 0 && (
                                        <div style={{ marginTop: '30px' }}>
                                            <h6 style={{ fontWeight: '700', color: '#253D4E', marginBottom: '15px' }}>Order Items</h6>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ background: '#f8f9fa' }}>
                                                            <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '13px', color: '#7E7E7E' }}>Product</th>
                                                            <th style={{ padding: '10px 15px', textAlign: 'center', fontSize: '13px', color: '#7E7E7E' }}>Qty</th>
                                                            <th style={{ padding: '10px 15px', textAlign: 'right', fontSize: '13px', color: '#7E7E7E' }}>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {order.items.map(item => (
                                                            <tr key={item.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                                                                <td style={{ padding: '12px 15px', fontSize: '14px', color: '#253D4E' }}>
                                                                    {item.name} {item.variant && <span style={{ color: '#7E7E7E', fontSize: '12px' }}>({item.variant})</span>}
                                                                </td>
                                                                <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '14px' }}>×{item.quantity}</td>
                                                                <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '600', color: '#046938' }}>₹{parseFloat(item.total).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default TrackOrder;
