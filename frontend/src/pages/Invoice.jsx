import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api';
import html2pdf from 'html2pdf.js';

const Invoice = () => {
    const { orderNumber: paramOrderNumber } = useParams();
    const [searchParams] = useSearchParams();
    const orderNumber = paramOrderNumber || searchParams.get('order');
    const autoDownload = searchParams.get('download') === 'true';
    const [order, setOrder] = useState(null);
    const [gstNumber, setGstNumber] = useState('');
    const [activeTax, setActiveTax] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderNumber) {
                setError('Order number missing in URL');
                return;
            }
            try {
                const res = await api.get(`/orders/invoice/${orderNumber}`);
                if (res.data.status) {
                    setOrder(res.data.order);
                } else {
                    setError(res.data.message || 'Order not found');
                }
            } catch (err) { 
                console.error(err);
                setError('Failed to connect to server. Please try again later.');
            }
        };
        fetchOrder();
        api.get('/settings').then(res => {
            if (res.data.status && res.data.settings) setGstNumber(res.data.settings.gst_number || '');
        }).catch(() => {});
        api.get('/taxes').then(res => {
            if (res.data.status && res.data.taxes?.length > 0) {
                const tax = res.data.taxes.find(t => t.status === 'active');
                if (tax) setActiveTax(tax);
            }
        }).catch(() => {});
    }, [orderNumber]);

    useEffect(() => {
        if (order && autoDownload) {
            setTimeout(() => {
                const element = document.getElementById('invoice-content');
                const opt = {
                    margin:       0.5,
                    filename:     `Invoice_${order.orderNumber}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true },
                    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save().then(() => {
                    setTimeout(() => {
                        window.close();
                    }, 500); 
                });
            }, 500);
        }
    }, [order, autoDownload]);

    if (error) return (
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
            <div style={{ color: '#dc3545', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>⚠️ {error}</div>
            <p>Please check the order number in your link or contact support.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 25px', background: '#046938', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Retry</button>
        </div>
    );

    if (!order) return <div style={{ padding: '80px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}><i className="fi-rs-spinner" style={{ animation: 'spin 1s linear infinite' }}></i> {autoDownload ? 'Preparing PDF Download...' : 'Loading Invoice...'}</div>;

    const handleDownloadPDF = () => {
        setDownloading(true);
        const element = document.getElementById('invoice-content');
        const opt = {
            margin:       0.5,
            filename:     `Invoice_${order.orderNumber}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save().then(() => {
            setDownloading(false);
        });
    };

    const invoiceNumber = order.orderNumber.replace('YF-O', 'YFT-');
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const thStyle = { padding: '10px 12px', fontSize: '13px', fontWeight: '700', background: '#e0e0e0', border: '1px solid #ccc', textAlign: 'center' };
    const tdStyle = { padding: '10px 12px', fontSize: '13px', border: '1px solid #ccc', textAlign: 'center' };

    return (
        <>
            {/* Download Button Bar - hidden in PDF */}
            <div id="download-bar" style={{ maxWidth: '1100px', margin: '20px auto 0', padding: '15px 30px', textAlign: 'right' }}>
                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    style={{
                        padding: '12px 30px',
                        background: '#046938',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: downloading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(4, 105, 56, 0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    {downloading ? '⏳ Generating PDF...' : '📥 Download Invoice PDF'}
                </button>
            </div>
        <div id="invoice-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#333', background: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <img src="/assets/imgs/theme/logo.png" alt="Yogis Farm" style={{ height: '60px', marginBottom: '10px' }} />
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
                    {gstNumber && <><br />GST Number: <strong>{gstNumber}</strong></>}
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
                Address Type: {order.addressType || 'Home'}
            </div>

            {/* Products Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        {['#', 'Product', 'Brand', 'Unit', 'Price', 'Discount', 'Sub Total', 'Tax', 'Total', 'Quantity', 'Grand Total'].map(h => (
                            <th key={h} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(order.items || []).map((item, i) => (
                        <tr key={item.id}>
                            <td style={tdStyle}>{i + 1}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{item.name}</td>
                            <td style={tdStyle}>{item.product?.brand?.name || '—'}</td>
                            <td style={tdStyle}>{item.variant || '1 Unit'}</td>
                            <td style={tdStyle}>₹{Number(item.price).toFixed(0)}</td>
                            <td style={tdStyle}>
                                {Number(item.discount) > 0 ? (
                                    <>₹{Number(item.discount).toFixed(0)}<br /><small>(₹{Number(item.discount).toFixed(0)})</small></>
                                ) : '—'}
                            </td>
                            <td style={tdStyle}>₹{Number(item.total).toFixed(2)}</td>
                            <td style={tdStyle}>₹{Number(item.gst).toFixed(2)}<br /><small>({order.taxName || (activeTax ? activeTax.name : 'Tax')} {order.taxRate || (activeTax ? activeTax.tax : '')}%)</small></td>
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
                <div style={{ marginBottom: '3px' }}><strong>{order.taxName || (activeTax ? activeTax.name : 'Tax')} ({order.taxRate || (activeTax ? activeTax.tax : '')}%)</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.tax || 0).toFixed(2)}</span></div>
                <div style={{ marginBottom: '3px' }}><strong>Shipping Charges</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.shipping).toFixed(0)}</span></div>
                <div style={{ marginBottom: '3px' }}><strong>Coupon Discount</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.discount).toFixed(0)}</span></div>
                <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '5px' }}><strong>Grand Total</strong> <span style={{ marginLeft: '40px' }}>₹{Number(order.total).toFixed(0)}</span></div>
            </div>

            {/* Signature */}
            <div style={{ borderTop: '1px solid #ccc', paddingTop: '20px', textAlign: 'center', marginTop: '40px', color: '#666', fontSize: '13px' }}>
                <em>This is a computer generated invoice and does not require a physical signature.</em>
            </div>

            {/* Removed print styles as html2pdf renders directly */}
        </div>
        </>
    );
};

export default Invoice;
