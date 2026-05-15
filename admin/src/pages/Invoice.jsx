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
                    <img src="/assets/imgs/theme/icons/logo-new.svg" alt="YogisFarms" style={{ height: '60px', marginBottom: '10px' }} />
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
                        const isPercentCoupon = order.coupon && order.coupon.amountType === 'percent';
                        const totalOfferPrice = (order.items || []).reduce((sum, it) => sum + Number(it.total), 0);
                        const totalQty = (order.items || []).reduce((sum, it) => sum + it.quantity, 0);
                        const itemCount = order.items.length;

                        // Calculations
                        const mrp = Number(item.price) || 0;
                        const itemTotal = Number(item.total) || 0;
                        const offerPrice = itemTotal / item.quantity;
                        const pdPerUnit = mrp > offerPrice ? mrp - offerPrice : 0;
                        
                        const orderDiscount = Number(order.discount) || 0;
                        let odForLine = 0;
                        if (orderDiscount > 0) {
                            if (isPercentCoupon && totalOfferPrice > 0) {
                                odForLine = (itemTotal / totalOfferPrice) * orderDiscount;
                            } else {
                                odForLine = orderDiscount / itemCount;
                            }
                        }

                        // Tax calculation
                        const gstPercent = Number(item.taxRate) || 0;
                        const lineTotal = itemTotal - odForLine;
                        const gstAmt = lineTotal * (gstPercent / 100);
                        const taxableVal = lineTotal - gstAmt;
                        
                        const hsn = item.hsnCode || '—';

                        let cgst = 0, sgst = 0, igst = 0;
                        if (isMaharashtra) {
                            cgst = gstAmt / 2;
                            sgst = gstAmt / 2;
                        } else {
                            igst = gstAmt;
                        }

                        return (
                            <React.Fragment key={item.id}>
                                <tr>
                                    <td style={tdStyle}>{i + 1}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left' }}>
                                        <div>{item.name}</div>
                                        {hsn !== '—' && <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>HSN: {hsn}</div>}
                                    </td>
                                    <td style={tdStyle}>{item.variant || '1 Unit'} ×{item.quantity}</td>
                                    <td style={tdStyle}>₹{mrp.toFixed(0)}</td>
                                    <td style={tdStyle}>₹{(mrp * item.quantity).toFixed(0)}</td>
                                    <td style={{ ...tdStyle, fontSize: '11px' }}>
                                        {pdPerUnit > 0 && <div>PD: ₹{(pdPerUnit * item.quantity).toFixed(0)}</div>}
                                        {odForLine > 0 && <div>OD: ₹{odForLine.toFixed(0)}</div>}
                                        {pdPerUnit === 0 && odForLine === 0 && '—'}
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
                                    <td style={{ ...tdStyle, fontWeight: '700' }}>₹{lineTotal.toFixed(0)}</td>
                                </tr>
                                {i === order.items.length - 1 && (
                                    <>
                                        <tr>
                                            <td colSpan={isMaharashtra ? "9" : "8"} style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>Shipping & Charges</td>
                                            <td style={{ ...tdStyle, fontWeight: 'bold' }}>₹{Number(order.shipping).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>TOTAL QTY: {totalQty}</td>
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
