import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api';
import html2pdf from 'html2pdf.js';

const Invoice = () => {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);
    const [gstNumber, setGstNumber] = useState('');
    const [activeTax, setActiveTax] = useState(null);
    const [searchParams] = useSearchParams();
    const autoDownload = searchParams.get('download') === 'true';

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get('/orders');
                if (res.data.status) {
                    const found = res.data.orders.find(o => o.orderNumber === orderNumber);
                    if (found) {
                        const detail = await api.get(`/orders/${found.id}`);
                        if (detail.data.status) {
                            const orderData = detail.data.order;
                            if (detail.data.coupon) {
                                orderData.coupon = detail.data.coupon;
                            }
                            setOrder(orderData);
                        }
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchOrder();
        // Fetch GST number
        api.get('/settings').then(res => {
            if (res.data.status && res.data.settings) setGstNumber(res.data.settings.gst_number || '');
        }).catch(() => {});
        // Fetch Taxes
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
                    margin:       0.3,
                    filename:     `Invoice_${order.orderNumber}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
                };
                html2pdf().set(opt).from(element).save().then(() => {
                    if (autoDownload) {
                        setTimeout(() => {
                            window.close();
                        }, 500);
                    }
                });
            }, 500);
        }
    }, [order, autoDownload]);

    if (!order) return <div style={{ padding: '80px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}><i className="fi-rs-spinner" style={{ animation: 'spin 1s linear infinite' }}></i> {autoDownload ? 'Preparing PDF Download...' : 'Loading Invoice...'}</div>;

    let invoiceNumber = order.orderNumber;
    if (order.orderNumber.startsWith('YF') && order.orderNumber.length >= 15 && !order.orderNumber.includes('-')) {
        const oNum = order.orderNumber;
        const len = oNum.length;
        const series = oNum.substring(8, len - 6);
        const seq = oNum.substring(len - 6, len - 2);
        const random = oNum.substring(len - 2);
        
        const date = order.labelPrintedAt ? new Date(order.labelPrintedAt) : new Date(order.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        let fyStart, fyEnd;
        if (month >= 4) {
            fyStart = String(year).slice(2);
            fyEnd = String(year + 1).slice(2);
        } else {
            fyStart = String(year - 1).slice(2);
            fyEnd = String(year).slice(2);
        }
        const fy = fyStart + fyEnd;
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        
        invoiceNumber = `INV${fy}${mm}${dd}${series}${seq}${random}`;
    } else {
        invoiceNumber = order.orderNumber.replace('YF-O', 'YFT-');
    }
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const thStyle = { padding: '10px 12px', fontSize: '13px', fontWeight: '700', background: '#e0e0e0', border: '1px solid #ccc', textAlign: 'center' };
    const tdStyle = { padding: '10px 12px', fontSize: '13px', border: '1px solid #ccc', textAlign: 'center' };

    const isMaharashtra = order.addressState && order.addressState.toLowerCase().includes('maharashtra');

    return (
        <div id="invoice-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#333', background: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <img src="/assets/imgs/theme/icons/logo.png" alt="YogisFarms" style={{ height: '45px', marginBottom: '10px' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ color: '#046938', fontSize: '32px', fontWeight: '800', margin: '0' }}>INVOICE</h1>
                </div>
            </div>

            {/* Company Info + Invoice Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div>
                    <strong>YogisFarms (YogisFarms)</strong><br />
                    S.No 18, Saikrupa Bunglow, Sudarshan Park society, Ingale Nagar, Warje, Pune 411058, Pune<br />
                    Pune, Maharashtra - 411058<br />
                    E-Mail Address: info@yogisfarms.com<br />
                    Phone Number: +91 9119501177
                    {gstNumber && <><br />GST Number: <strong>{gstNumber}</strong></>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    Invoice Number: <strong>{invoiceNumber}</strong><br />
                    Order Id: <strong>{order.orderNumber}</strong><br />
                    Invoice Date: <strong>{formatDate(order.labelPrintedAt || order.createdAt)}</strong><br />
                    Order Date: <strong>{formatDate(order.createdAt)}</strong>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '20px 0' }} />

            {/* Bill To */}
            <div style={{ marginBottom: '30px' }}>
                <strong>Bill To:</strong><br />
                {order.addressName || order.user?.name}<br />
                {order.addressText}, {order.addressCity}, {order.addressState}, India - {order.addressPincode}<br />
                E-Mail Address: {order.user?.email || 'N/A'}<br />
                Phone Number: +91 - {order.addressPhone}<br />
                Address Type: {order.addressType || 'Home'}
            </div>

            {/* Products Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        {['#', 'Product', 'Unit', 'MRP', 'Gross Amt', 'Discount', 'Taxable Val', 
                          isMaharashtra ? 'CGST' : 'IGST', 
                          isMaharashtra ? 'SGST' : null, 
                          'Total'
                        ].filter(Boolean).map(h => (
                            <th key={h} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(order.items || []).map((item, i) => {
                        const mrp = Number(item.mrp) || Number(item.price) || 0;
                        const pd = Number(item.productDiscount) || 0;
                        const od = Number(item.orderDiscount) || 0;
                        const taxableVal = Number(item.taxableValue) || 0;
                        const cgst = Number(item.cgst) || 0;
                        const sgst = Number(item.sgst) || 0;
                        const igst = Number(item.gstAmount) || 0;
                        const gstPercent = Number(item.taxRate) || 0;
                        const lineTotal = Number(item.total) || 0;
                        const hsn = item.hsnCode || '—';

                        return (
                            <React.Fragment key={item.id}>
                                <tr>
                                    <td style={tdStyle}>{i + 1}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left' }}>
                                        <div>{item.name}</div>
                                        {hsn !== '—' && <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>HSN: {hsn}</div>}
                                    </td>
                                    <td style={tdStyle}>{item.variant || '1 Unit'} ×{item.quantity}</td>
                                    <td style={tdStyle}>₹{mrp.toFixed(2)}</td>
                                    <td style={tdStyle}>₹{(mrp * item.quantity).toFixed(2)}</td>
                                    <td style={{ ...tdStyle, fontSize: '11px' }}>
                                        {pd > 0 && <div>PD: ₹{pd.toFixed(2)}</div>}
                                        {od > 0 && <div>OD: ₹{od.toFixed(2)}</div>}
                                        {pd === 0 && od === 0 && '—'}
                                    </td>
                                    <td style={tdStyle}>₹{taxableVal.toFixed(2)}</td>
                                    {isMaharashtra ? (
                                        <>
                                            <td style={tdStyle}>₹{cgst.toFixed(2)}<br /><small>({gstPercent/2}%)</small></td>
                                            <td style={tdStyle}>₹{sgst.toFixed(2)}<br /><small>({gstPercent/2}%)</small></td>
                                        </>
                                    ) : (
                                        <td style={tdStyle}>₹{igst.toFixed(2)}<br /><small>({gstPercent}%)</small></td>
                                    )}
                                    <td style={{ ...tdStyle, fontWeight: '700' }}>₹{lineTotal.toFixed(2)}</td>
                                </tr>
                                {i === order.items.length - 1 && (
                                    <>
                                        <tr>
                                            <td colSpan={isMaharashtra ? "9" : "8"} style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>
                                                Shipping and charges : {Number(order.shippingTaxable || (order.shipping / 1.18)).toFixed(2)} | shipping gst 18% : {Number(order.shippingGST || (order.shipping - (order.shipping / 1.18))).toFixed(2)}
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 'bold' }}>₹{Number(order.shipping).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>TOTAL QTY: {order.items.reduce((acc, curr) => acc + curr.quantity, 0)}</td>
                                            <td colSpan={isMaharashtra ? "6" : "5"} style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>GRAND TOTAL:</td>
                                            <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '16px' }}>₹{Number(order.total).toFixed(2)}</td>
                                        </tr>
                                    </>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>

            {/* Signature */}
            <div style={{ border: '1px solid #ccc', padding: '30px', textAlign: 'right', marginTop: '30px' }}>
                <em>Authorized Signature</em>
            </div>

            {/* Removed print styles as html2pdf renders directly */}
        </div>
    );
};

export default Invoice;
