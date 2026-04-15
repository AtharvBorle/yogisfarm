import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const Invoice = () => {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get('/orders');
                if (res.data.status) {
                    const found = res.data.orders.find(o => o.orderNumber === orderNumber);
                    if (found) {
                        const detail = await api.get(`/orders/${found.id}`);
                        if (detail.data.status) setOrder(detail.data.order);
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchOrder();
    }, [orderNumber]);

    useEffect(() => {
        if (order) {
            // Auto-print after loading
            setTimeout(() => window.print(), 500);
        }
    }, [order]);

    if (!order) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading invoice...</div>;

    const invoiceNumber = order.orderNumber.replace('YF-O', 'YFT-');
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const thStyle = { padding: '10px 12px', fontSize: '13px', fontWeight: '700', background: '#e0e0e0', border: '1px solid #ccc', textAlign: 'center' };
    const tdStyle = { padding: '10px 12px', fontSize: '13px', border: '1px solid #ccc', textAlign: 'center' };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#333' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <img src="/assets/imgs/theme/logo.svg" alt="Yogis Farm" style={{ height: '60px', marginBottom: '10px' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ color: '#046938', fontSize: '32px', fontWeight: '800', margin: '0' }}>INVOICE</h1>
                </div>
            </div>

            {/* Company Info + Invoice Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div>
                    <strong>Yogis Farm (Yogis Farm)</strong><br />
                    S.No 18, Saikrupa Bunglow, Sudarshan Park society, Ingale Nagar, Warje, Pune 411058, Pune<br />
                    Pune, Maharashtra - 411058<br />
                    E-Mail Address: info@yogisfarm.in<br />
                    Phone Number: +91 9119501177
                </div>
                <div style={{ textAlign: 'right' }}>
                    Invoice Number: <strong>{invoiceNumber}</strong><br />
                    Order Id: <strong>{order.orderNumber}</strong><br />
                    Order Date: <strong>{formatDate(order.createdAt)}</strong>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '20px 0' }} />

            {/* Bill To */}
            <div style={{ marginBottom: '30px' }}>
                <strong>Bill To:</strong><br />
                {order.addressText}, {order.addressCity}, {order.addressState}, India - {order.addressPincode}<br />
                E-Mail Address: {order.user?.email || 'N/A'}<br />
                Phone Number: +91 - {order.addressPhone}<br />
                Address Type: {order.addressType || 'Home'}<br />
                Order-Note: {order.orderNote || ''}
            </div>

            {/* Products Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        {['#', 'Product', 'Unit', 'Price', 'Discount', 'Sub Total', 'Tax', 'Total', 'Quantity', 'Grand Total'].map(h => (
                            <th key={h} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(order.items || []).map((item, i) => (
                        <tr key={item.id}>
                            <td style={tdStyle}>{i + 1}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{item.name}</td>
                            <td style={tdStyle}>{item.variant || '1 Unit'}</td>
                            <td style={tdStyle}>₹{Number(item.price).toFixed(0)}</td>
                            <td style={tdStyle}>
                                {Number(item.discount) > 0 ? (
                                    <>₹{Number(item.discount).toFixed(0)}<br /><small>(₹{Number(item.discount).toFixed(0)})</small></>
                                ) : '—'}
                            </td>
                            <td style={tdStyle}>₹{Number(item.total).toFixed(2)}</td>
                            <td style={tdStyle}>₹{Number(item.gst).toFixed(0)}{item.product?.tax ? `\n(${Number(item.product.tax.tax)}% Including)` : ''}</td>
                            <td style={tdStyle}>{Number(item.total).toFixed(0)}</td>
                            <td style={tdStyle}>{item.quantity}</td>
                            <td style={{ ...tdStyle, fontWeight: '700' }}>₹{Number(item.total).toFixed(0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ textAlign: 'right', marginBottom: '30px' }}>
                <div style={{ marginBottom: '3px' }}><strong>Sub Total</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.subtotal).toFixed(0)}</span></div>
                <div style={{ marginBottom: '3px' }}><strong>Shipping Charges</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.shipping).toFixed(0)}</span></div>
                <div style={{ marginBottom: '3px' }}><strong>Coupon Discount</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.discount).toFixed(0)}</span></div>
                <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '5px' }}><strong>Grand Total</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.total).toFixed(0)}</span></div>
            </div>

            {/* Signature */}
            <div style={{ border: '1px solid #ccc', padding: '30px', textAlign: 'right', marginTop: '30px' }}>
                <em>Authorized Signature</em>
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #root { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
                    #root * { visibility: visible; }
                    .sidebar, header, nav, .admin-sidebar { display: none !important; }
                    button { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Invoice;
