import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import FeatureBanners from '../components/FeatureBanners';

const OrderSuccess = () => {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/detail/${orderNumber}`);
                if (res.data.status) setOrder(res.data.order);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchOrder();
    }, [orderNumber]);

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}><i className="fi-rs-spinner" style={{ fontSize: '30px', animation: 'spin 1s linear infinite' }}></i></div>;

    if (!order) return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h3>Order not found</h3>
            <Link to="/" className="btn btn-sm" style={{ background: '#046938', color: '#fff', marginTop: '15px' }}>Go Home</Link>
        </div>
    );

    const formatDate = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
    };

    const paymentStatusColor = order.paymentStatus === 'verified' || order.paymentStatus === 'completed' || order.paymentStatus === 'paid'
        ? { bg: '#28a745', text: '#fff' }
        : { bg: '#dc3545', text: '#fff' };

    const borderStyle = '1px solid #dee2e6';
    const cellPd = { padding: '10px 15px', borderBottom: borderStyle };
    const headerCell = { ...cellPd, fontWeight: '600', color: '#253D4E', background: '#f8f9fa' };

    return (
        <main className="main">
            <div className="container" style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 15px 60px' }}>
                {/* Thank You */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#046938" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="#046938" strokeWidth="2"/></svg>
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#253D4E', marginBottom: '5px' }}>Thank You</h1>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#253D4E' }}>For Your Order!</h2>
                </div>

                {/* Order Summary */}
                <div style={{ border: borderStyle, borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
                    <h4 style={{ textAlign: 'center', padding: '15px', fontWeight: '700', margin: 0, background: '#f8f9fa', borderBottom: borderStyle }}>Order Summary</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={headerCell}>Order Date:</td>
                                <td style={cellPd}>{formatDate(order.createdAt)}</td>
                                <td style={headerCell}>Delivery Status:</td>
                                <td style={cellPd}>{order.orderStatus === 'placed' ? 'Order Placed' : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</td>
                            </tr>
                            <tr>
                                <td style={headerCell}>Name:</td>
                                <td style={cellPd}>{order.user?.name}</td>
                                <td style={headerCell}>Total Order Amount:</td>
                                <td style={cellPd}>₹{Number(order.total).toFixed(0)}</td>
                            </tr>
                            <tr>
                                <td style={headerCell}>E-Mail:</td>
                                <td style={cellPd}>{order.user?.email || 'N/A'}</td>
                                <td style={headerCell}>Payment Method:</td>
                                <td style={cellPd}>{order.paymentMethod === 'cod' ? 'Cash On Delivery' : order.paymentMethod?.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td style={headerCell}>Shipping Address:</td>
                                <td style={cellPd}>{order.addressText}, {order.addressCity}, {order.addressState}, India - {order.addressPincode}</td>
                                <td style={headerCell}>Payment Status:</td>
                                <td style={cellPd}>
                                    <span style={{ padding: '3px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: paymentStatusColor.bg, color: paymentStatusColor.text }}>
                                        {order.paymentStatus === 'pending' ? 'Due' : order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={headerCell}></td>
                                <td style={cellPd}></td>
                                <td style={headerCell}>Address Type:</td>
                                <td style={cellPd}>{order.addressType || 'Home'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Order Code */}
                <div style={{ border: borderStyle, borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
                    <div style={{ textAlign: 'center', padding: '15px 20px' }}>
                        <span style={{ fontSize: '16px', color: '#253D4E' }}>Order Code: </span>
                        <strong style={{ fontSize: '18px', color: '#046938' }}>{order.orderNumber}</strong>
                    </div>

                    {/* Order Details */}
                    <h5 style={{ textAlign: 'center', fontWeight: '700', padding: '10px', margin: 0, borderTop: borderStyle }}>Order Details</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ ...cellPd, textAlign: 'left', fontWeight: '600' }}>#</th>
                                <th style={{ ...cellPd, textAlign: 'left', fontWeight: '600' }}>Product</th>
                                <th style={{ ...cellPd, textAlign: 'center', fontWeight: '600' }}>Quantity</th>
                                <th style={{ ...cellPd, textAlign: 'right', fontWeight: '600' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, i) => (
                                <tr key={item.id}>
                                    <td style={{ ...cellPd, color: '#046938' }}>{i + 1}</td>
                                    <td style={cellPd}>
                                        <Link to={item.product?.slug ? `/product/${item.product.slug}` : '#'} style={{ color: '#046938', fontWeight: '500' }}>{item.name}</Link>
                                    </td>
                                    <td style={{ ...cellPd, textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ ...cellPd, textAlign: 'right' }}>₹{Number(item.total).toFixed(0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div style={{ borderTop: borderStyle }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: borderStyle }}>
                            <span style={{ fontWeight: '600', color: '#253D4E' }}>{order.items && order.items[0]?.product?.tax ? `${order.items[0].product.tax.name} (${order.items[0].product.tax.tax}%)` : 'Tax Amount'}:</span>
                            <span>₹{Number(order.tax || 0).toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: borderStyle }}>
                            <span style={{ fontWeight: '600', color: '#253D4E' }}>Shipping Charges:</span>
                            <span>₹{Number(order.shipping).toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: borderStyle }}>
                            <span style={{ fontWeight: '600', color: '#253D4E' }}>Discount Amount:</span>
                            <span>₹{Number(order.discount).toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', fontWeight: '700' }}>
                            <span style={{ color: '#046938' }}>Total:</span>
                            <span>₹{Number(order.total).toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <FeatureBanners />
        </main>
    );
};

export default OrderSuccess;
