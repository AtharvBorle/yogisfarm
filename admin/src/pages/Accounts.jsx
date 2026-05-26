import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import DataTable from '../components/common/DataTable';
import * as XLSX from 'xlsx';
import { Download, Calendar, Filter, DollarSign, Truck } from 'lucide-react';

const Accounts = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        paymentStatus: 'all',
        orderStatus: 'all',
        startDate: '',
        endDate: ''
    });
    const [showExportMenu, setShowExportMenu] = useState(false);

    const fetchAccountsData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.paymentStatus !== 'all') params.set('paymentStatus', filters.paymentStatus);
            if (filters.orderStatus !== 'all') params.set('orderStatus', filters.orderStatus);
            if (filters.startDate) params.set('startDate', filters.startDate);
            if (filters.endDate) params.set('endDate', filters.endDate);

            const res = await api.get(`/accounts/orders?${params.toString()}`);
            if (res.data.status) {
                setRows(res.data.rows);
            } else {
                toast.error(res.data.message || 'Failed to fetch accounts data');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load accounts data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountsData();
    }, [filters.paymentStatus, filters.orderStatus]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAccountsData();
    };

    const handleClearFilters = () => {
        setFilters({
            paymentStatus: 'all',
            orderStatus: 'all',
            startDate: '',
            endDate: ''
        });
    };

    const formatDateTime = (d) => {
        if (!d) return 'N/A';
        const dt = new Date(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
    };

    const formatExcelDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        const pad = (n) => String(n).padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
    };

    const exportToFormat = (format) => {
        if (rows.length === 0) {
            toast.error('No data available to export');
            return;
        }

        const mappedData = rows.map(row => ({
            "Order Date": formatExcelDate(row.orderDate),
            "Order No": row.orderNo,
            "Invoice Date": formatExcelDate(row.invoiceDate),
            "Invoice No": row.invoiceNo,
            "Customer Name": row.customerName,
            "Customer Address": row.customerAddress,
            "Product Name": row.productName,
            "Qty": row.qty,
            "Product Discount": row.productDiscount,
            "Order Discount": row.orderDiscount,
            "Taxable Amount": row.taxableAmount,
            "Tax %": row.taxPercent,
            "CGST": row.cgst,
            "SGST": row.sgst,
            "IGST": row.igst,
            "Total": row.total,
            "shipping charges": row.shippingCharges,
            "Shipping Gst": row.shippingGst,
            "grand total": row.grandTotal
        }));

        const ws = XLSX.utils.json_to_sheet(mappedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Accounts Report");

        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `accounts_report_${dateStr}.${format}`;

        if (format === 'xlsx') {
            XLSX.writeFile(wb, filename);
        } else if (format === 'xls') {
            XLSX.writeFile(wb, filename, { bookType: 'biff8' });
        } else if (format === 'csv') {
            XLSX.writeFile(wb, filename, { bookType: 'csv' });
        }

        setShowExportMenu(false);
        toast.success(`Report downloaded as ${format.toUpperCase()}`);
    };

    const columns = [
        {
            header: 'ORDER DATE',
            render: (row) => <span style={{ fontSize: '13px', color: '#555' }}>{formatDateTime(row.orderDate)}</span>
        },
        {
            header: 'ORDER NO',
            render: (row) => <strong style={{ color: '#046938' }}>{row.orderNo}</strong>
        },
        {
            header: 'CUSTOMER',
            render: (row) => (
                <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.customerAddress}>
                    <div style={{ fontWeight: '500' }}>{row.customerName}</div>
                    <span style={{ fontSize: '11px', color: '#888' }}>{row.customerAddress}</span>
                </div>
            )
        },
        {
            header: 'PRODUCT NAME',
            render: (row) => <span style={{ fontWeight: '500', fontSize: '13px' }}>{row.productName}</span>
        },
        {
            header: 'QTY',
            render: (row) => <span style={{ fontWeight: '600' }}>{row.qty}</span>
        },
        {
            header: 'TAXABLE AMT',
            render: (row) => <span>₹{row.taxableAmount.toFixed(2)}</span>
        },
        {
            header: 'TAX %',
            render: (row) => <span>{row.taxPercent}%</span>
        },
        {
            header: 'CGST',
            render: (row) => <span style={{ color: '#666' }}>₹{row.cgst.toFixed(2)}</span>
        },
        {
            header: 'SGST',
            render: (row) => <span style={{ color: '#666' }}>₹{row.sgst.toFixed(2)}</span>
        },
        {
            header: 'IGST',
            render: (row) => <span style={{ color: '#666' }}>₹{row.igst.toFixed(2)}</span>
        },
        {
            header: 'ITEM TOTAL',
            render: (row) => <strong>₹{row.total.toFixed(2)}</strong>
        },
        {
            header: 'GRAND TOTAL',
            render: (row) => <span style={{ color: '#046938', fontWeight: '600' }}>₹{row.grandTotal.toFixed(2)}</span>
        }
    ];

    const inputStyle = {
        padding: '8px 12px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        background: 'var(--card-bg)',
        color: 'var(--text)',
        minWidth: '150px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{ padding: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ color: 'var(--text)', margin: 0, fontWeight: '600' }}>Accounts & Tax Report</h2>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted, #888)', fontSize: '14px' }}>
                        View transactions split by line-item products and export to Excel/CSV.
                    </p>
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        style={{
                            padding: '10px 20px',
                            background: '#3BB77E',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(59, 183, 126, 0.2)'
                        }}
                    >
                        <Download size={18} />
                        Export Report
                    </button>

                    {showExportMenu && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '45px',
                            background: 'var(--card-bg, #fff)',
                            border: '1px solid var(--border, #eee)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            minWidth: '160px',
                            overflow: 'hidden'
                        }}>
                            <button
                                onClick={() => exportToFormat('xlsx')}
                                style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', hover: { background: 'var(--sidebar-hover)' } }}
                                className="export-menu-item"
                            >
                                Excel (.xlsx)
                            </button>
                            <button
                                onClick={() => exportToFormat('xls')}
                                style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--text)' }}
                                className="export-menu-item"
                            >
                                Excel 97-2003 (.xls)
                            </button>
                            <button
                                onClick={() => exportToFormat('csv')}
                                style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--text)' }}
                                className="export-menu-item"
                            >
                                CSV (.csv)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Section */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', marginBottom: '25px', padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', color: 'var(--text)' }}>
                        <DollarSign size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Payment Status
                    </label>
                    <select
                        value={filters.paymentStatus}
                        onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified / Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', color: 'var(--text)' }}>
                        <Truck size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Delivery Status
                    </label>
                    <select
                        value={filters.orderStatus}
                        onChange={e => setFilters({ ...filters, orderStatus: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="all">All Deliveries</option>
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out For Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                    </select>
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', color: 'var(--text)' }}>
                        <Calendar size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Start Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', color: 'var(--text)' }}>
                        <Calendar size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        End Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        value={filters.endDate}
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        style={{
                            padding: '8px 20px',
                            background: '#046938',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        style={{
                            padding: '8px 15px',
                            background: '#6c757d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Clear
                    </button>
                </div>
            </form>

            {/* Live Data Preview */}
            <div className="admin-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: 'var(--text)' }}>Transaction Lines Preview</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted, #888)' }}>Showing {rows.length} lines</span>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>Loading preview data...</div>
                ) : (
                    <DataTable columns={columns} data={rows} />
                )}
            </div>
            
            {/* Embedded styles for dropdown hover effects */}
            <style>{`
                .export-menu-item:hover {
                    background: var(--sidebar-hover, #f5f5f5) !important;
                }
            `}</style>
        </div>
    );
};

export default Accounts;
