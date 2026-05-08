import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

const BulkInvoice = () => {
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            const orderNumbersParam = searchParams.get('orderNumbers');
            if (!orderNumbersParam) {
                setError('No order numbers provided.');
                setLoading(false);
                return;
            }

            const orderNumbers = orderNumbersParam.split(',').map(n => n.trim()).filter(Boolean);
            
            try {
                // First get all orders to find their internal IDs
                const listRes = await api.get('/orders');
                if (!listRes.data.status) throw new Error('Failed to fetch order list');
                const allOrders = listRes.data.orders;
                
                // Map order numbers to internal IDs
                const idsToFetch = orderNumbers.map(num => allOrders.find(o => o.orderNumber === num)?.id).filter(Boolean);
                
                if (idsToFetch.length === 0) {
                    setError('No matching orders found.');
                    setLoading(false);
                    return;
                }

                // Fetch full details for each order using the admin endpoint
                const promises = idsToFetch.map(id => api.get(`/orders/${id}`));
                const results = await Promise.all(promises);
                
                const fetchedOrders = results
                    .filter(res => res.data.status && res.data.order)
                    .map(res => res.data.order);
                
                if (fetchedOrders.length === 0) {
                    setError('Failed to fetch invoice data.');
                } else {
                    setOrders(fetchedOrders);
                }
            } catch (err) {
                console.error("BulkInvoice Fetch Error:", err);
                setError('Error fetching invoices.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [searchParams]);

    useEffect(() => {
        if (!loading && orders.length > 0) {
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, [loading, orders]);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatDateTime = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Generating Labels... Please wait.</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div style={{ background: '#fff', padding: '0', margin: '0' }}>
            <style>{`
                @media print {
                    @page { margin: 10mm; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                    .page-break { page-break-after: always; }
                }
                .label-container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: Arial, sans-serif;
                    color: #000;
                    background: #fff;
                }
                .border-box { border: 1px solid #000; }
                .border-bottom { border-bottom: 1px solid #000; }
                .border-right { border-right: 1px solid #000; }
                .border-left { border-left: 1px solid #000; }
                .border-top { border-top: 1px solid #000; }
                .text-sm { font-size: 10px; }
                .text-xs { font-size: 8px; }
                .text-md { font-size: 12px; }
                .text-lg { font-size: 16px; font-weight: bold; }
                .text-xl { font-size: 24px; font-weight: bold; }
                .bold { font-weight: bold; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                .text-center { textAlign: center; }
                .p-1 { padding: 4px; }
                .p-2 { padding: 8px; }
                
                table.invoice-table { width: 100%; border-collapse: collapse; }
                table.invoice-table th, table.invoice-table td { border: 1px solid #000; padding: 4px; font-size: 10px; text-align: left; }
                table.invoice-table th { font-weight: bold; }
                table.invoice-table th.right, table.invoice-table td.right { text-align: right; }
                table.invoice-table th.center, table.invoice-table td.center { text-align: center; }
            `}</style>

            {orders.map((order, index) => {
                // Calculate Invoice Number based on labelPrintedAt
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

                // Barcode/Tracking ID (Use trackingId if exists, otherwise orderNumber)
                const awbNo = order.trackingId || order.orderNumber;
                const courierName = order.courierPartner?.name || 'Local Delivery Boy';

                // GST calculations for Invoice Table
                const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

                return (
                    <div key={order.id} className={`label-container ${index < orders.length - 1 ? 'page-break' : ''}`} style={{ paddingBottom: '20px' }}>
                        
                        {/* =========================================
                            TOP HALF: SHIPPING LABEL 
                           ========================================= */}
                        <div className="border-box">
                            {/* Header Row */}
                            <div className="flex border-bottom" style={{ height: '50px' }}>
                                <div className="border-right flex items-center" style={{ width: '15%', justifyContent: 'center' }}>
                                    <span className="text-xl">STD</span>
                                </div>
                                <div className="border-right p-1" style={{ width: '60%' }}>
                                    <div className="text-xs">Courier: {courierName} PREPAID</div>
                                    <div className="text-lg">{awbNo}</div>
                                </div>
                                <div className="border-right p-1 flex items-center" style={{ width: '15%', justifyContent: 'center', flexDirection: 'column' }}>
                                    <div className="text-xs bold">SURFACE</div>
                                    <div className="text-md bold">PRE</div>
                                </div>
                                <div className="flex items-center" style={{ width: '10%', justifyContent: 'center' }}>
                                    <span className="text-xl">E</span>
                                </div>
                            </div>

                            {/* Main Label Body */}
                            <div className="flex border-bottom" style={{ minHeight: '220px' }}>
                                {/* Left Vertical Bar */}
                                <div className="border-right" style={{ width: '25%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
                                    <div className="text-xs bold" style={{ marginBottom: '5px' }}>ORDERED THROUGH</div>
                                    <img src="/assets/imgs/theme/logo.png" alt="Logo" style={{ width: '80%', objectFit: 'contain' }} />
                                    <div style={{ position: 'absolute', bottom: '80px', left: '-50px', transform: 'rotate(-90deg)', transformOrigin: 'top left', whiteSpace: 'nowrap', fontSize: '12px', fontWeight: 'bold', width: '200px', textAlign: 'center' }}>
                                        AWB No. {awbNo}
                                    </div>
                                </div>
                                {/* Right Barcode & Address */}
                                <div style={{ width: '75%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Barcode Area */}
                                    <div className="border-bottom flex items-center" style={{ justifyContent: 'center', padding: '15px 0', height: '100px' }}>
                                        <Barcode value={awbNo} height={50} width={2} displayValue={false} margin={0} />
                                    </div>
                                    {/* Address Area */}
                                    <div className="p-2" style={{ flex: 1 }}>
                                        <div className="text-xs">Shipping/Customer address:</div>
                                        <div className="text-lg" style={{ marginTop: '4px' }}>Name: {order.addressName || order.user?.name}</div>
                                        <div className="text-md" style={{ marginTop: '8px' }}>{order.addressText}, {order.addressCity}</div>
                                        <div className="text-md">{order.addressState}, India</div>
                                        <div className="text-lg" style={{ marginTop: '8px' }}>PIN: {order.addressPincode}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Sold By Footer */}
                            <div className="flex justify-between p-1 border-bottom text-xs bg-gray">
                                <div>Sold By: Yogi's Farms, Pune - 411058</div>
                                <div>GSTIN: 27AAXFN9221D1ZX</div>
                            </div>

                            {/* SKU Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                                <thead>
                                    <tr className="border-bottom bg-gray">
                                        <th style={{ textAlign: 'left', padding: '4px', width: '80%' }}>SKU ID | Item Description</th>
                                        <th style={{ textAlign: 'center', padding: '4px', width: '20%', borderLeft: '1px solid #000' }}>QTY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((item, i) => (
                                        <tr key={i} className="border-bottom">
                                            <td style={{ padding: '4px' }}>{item.productId} | {item.name}</td>
                                            <td style={{ padding: '4px', textAlign: 'center', borderLeft: '1px solid #000', fontWeight: 'bold' }}>{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="text-xs" style={{ textAlign: 'right', padding: '2px 4px', color: '#555' }}>
                                Printed at {formatDateTime(new Date())} | Not for resale
                            </div>
                        </div>

                        {/* =========================================
                            MIDDLE SEPARATOR 
                           ========================================= */}
                        <div style={{ textAlign: 'center', margin: '20px 0', borderBottom: '1px dashed #000', position: 'relative' }}>
                            <span style={{ background: '#fff', padding: '0 10px', position: 'relative', top: '7px', fontSize: '10px', fontWeight: 'bold', color: '#555' }}>
                                ✂ TEAR HERE (ADMIN RECORD BELOW)
                            </span>
                        </div>

                        {/* =========================================
                            BOTTOM HALF: TAX INVOICE
                           ========================================= */}
                        <div style={{ marginTop: '20px' }}>
                            <div className="flex justify-between" style={{ marginBottom: '15px' }}>
                                <div>
                                    <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 15px 0' }}>Tax Invoice</h2>
                                    <div className="text-md" style={{ marginBottom: '4px' }}><span className="bold">Order Id:</span> {order.orderNumber}</div>
                                    <div className="text-md"><span className="bold">Order Date:</span> {formatDateTime(order.createdAt)}</div>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                    <div>
                                        <div className="text-md bold" style={{ marginBottom: '4px' }}>Invoice No: {invoiceNumber}</div>
                                        <div className="text-md bold" style={{ marginBottom: '10px' }}>Invoice Date: {formatDate(order.labelPrintedAt || order.createdAt)}</div>
                                        <div className="text-sm bold">GSTIN: 27AAXFN9221D1ZX</div>
                                    </div>
                                    <div>
                                        {/* QR Code */}
                                        <QRCodeSVG value={invoiceNumber} size={70} />
                                    </div>
                                </div>
                            </div>

                            <div className="border-top" style={{ borderBottom: '2px solid #000', marginBottom: '15px' }}></div>

                            {/* Addresses */}
                            <div className="flex" style={{ marginBottom: '15px' }}>
                                <div style={{ width: '33%', paddingRight: '10px' }}>
                                    <div className="text-md bold border-bottom" style={{ paddingBottom: '4px', marginBottom: '8px' }}>SOLD BY</div>
                                    <div className="text-sm bold" style={{ marginBottom: '4px' }}>Yogi's Farms</div>
                                    <div className="text-xs" style={{ lineHeight: '1.4' }}>
                                        S.No 18, Saikrupa Bunglow, Sudarshan Park Society,<br/>
                                        Ingale Nagar, Warje, Pune, Maharashtra - 411058<br/>
                                        GST: 27AAXFN9221D1ZX
                                    </div>
                                </div>
                                <div style={{ width: '33%', paddingRight: '10px' }}>
                                    <div className="text-md bold border-bottom" style={{ paddingBottom: '4px', marginBottom: '8px' }}>BILLING ADDRESS</div>
                                    <div className="text-sm bold" style={{ marginBottom: '4px' }}>{order.user?.name || order.addressName}</div>
                                    <div className="text-xs" style={{ lineHeight: '1.4' }}>
                                        {order.addressText}, {order.addressCity}<br/>
                                        {order.addressState}, India - {order.addressPincode}<br/>
                                        <span className="bold">PH: +91 {order.addressPhone || order.user?.phone}</span>
                                    </div>
                                </div>
                                <div style={{ width: '34%' }}>
                                    <div className="text-md bold border-bottom" style={{ paddingBottom: '4px', marginBottom: '8px' }}>SHIPPING ADDRESS</div>
                                    <div className="text-sm bold" style={{ marginBottom: '4px' }}>{order.addressName || order.user?.name}</div>
                                    <div className="text-xs" style={{ lineHeight: '1.4' }}>
                                        {order.addressText}, {order.addressCity}<br/>
                                        {order.addressState}, India - {order.addressPincode}<br/>
                                        <span className="bold">PH: +91 {order.addressPhone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Items Table */}
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th className="center" style={{ width: '40px' }}>Qty</th>
                                        <th className="right" style={{ width: '80px' }}>Selling Price</th>
                                        <th className="right" style={{ width: '70px' }}>Discount</th>
                                        <th className="right" style={{ width: '80px' }}>Taxable Val</th>
                                        <th className="center" style={{ width: '50px' }}>GST %</th>
                                        <th className="right" style={{ width: '70px' }}>GST Amt</th>
                                        <th className="right" style={{ width: '80px' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((item, i) => {
                                        const sellingPrice = Number(item.price);
                                        const discount = Number(item.discount || 0);
                                        const taxableVal = sellingPrice - discount;
                                        const gstPercent = Number(order.taxRate) || 0;
                                        const gstAmt = Number(item.gst || 0);
                                        const total = taxableVal + gstAmt;

                                        return (
                                            <tr key={i}>
                                                <td>
                                                    <div className="bold" style={{ fontSize: '11px', marginBottom: '2px' }}>{item.name}</div>
                                                    <div style={{ color: '#666', fontSize: '8px' }}>Variant: {item.variant || 'Default'}</div>
                                                    {/* MRP approximation for display */}
                                                    <div style={{ color: '#888', fontSize: '8px' }}>MRP: ₹{(sellingPrice + 100).toFixed(2)}</div>
                                                </td>
                                                <td className="center bold">{item.quantity}</td>
                                                <td className="right">₹{sellingPrice.toFixed(2)}</td>
                                                <td className="right">₹{discount.toFixed(2)}</td>
                                                <td className="right">₹{taxableVal.toFixed(2)}</td>
                                                <td className="center">{gstPercent}%</td>
                                                <td className="right">₹{gstAmt.toFixed(2)}</td>
                                                <td className="right bold">₹{total.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                    {/* Footer Row */}
                                    <tr>
                                        <td colSpan="2" className="bold" style={{ padding: '8px 4px' }}>TOTAL QTY: {totalQty}</td>
                                        <td colSpan="5" className="right bold" style={{ padding: '8px 4px' }}>GRAND TOTAL:</td>
                                        <td className="right bold" style={{ fontSize: '12px', padding: '8px 4px' }}>₹{Number(order.total).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Footer */}
                            <div className="flex justify-between items-center" style={{ marginTop: '30px' }}>
                                <div className="text-xs" style={{ color: '#555' }}>
                                    <span className="bold">Registered Office:</span> Yogi's Farms, Warje, Pune 411058.
                                </div>
                                <div className="text-xs" style={{ textAlign: 'right' }}>
                                    Ordered Through <span className="bold">YOGI'S FARMS</span><br/>
                                    <span style={{ color: '#777', fontSize: '9px' }}>Authorized Signatory</span>
                                </div>
                            </div>
                            
                            <div className="text-center" style={{ marginTop: '20px', fontSize: '9px', color: '#999', fontStyle: 'italic' }}>
                                ** This is a computer generated invoice and doesn't require a physical signature. **
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BulkInvoice;
