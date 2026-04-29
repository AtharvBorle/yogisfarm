import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; // Fixed from ../../../api
import toast from 'react-hot-toast';

import { User, Clock, CheckCircle, Inbox } from 'react-feather';

const DeliveryDashboard = () => {
    const [boy, setBoy] = useState(null);
    const [stats, setStats] = useState({ pendingCount: 0, assignedTodayCount: 0 });
    const [deliveries, setDeliveries] = useState([]);
    const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'history'
    
    // For History
    const [history, setHistory] = useState([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [historyLoading, setHistoryLoading] = useState(false);

    // For Transactions
    const [transactions, setTransactions] = useState([]);
    const [transPage, setTransPage] = useState(1);
    const [transTotalPages, setTransTotalPages] = useState(1);
    const [transLoading, setTransLoading] = useState(false);
    
    const navigate = useNavigate();

    const fetchMe = async () => {
        try {
            const res = await api.get('/delivery/me');
            if (res.data.status) {
                setBoy(res.data.deliveryBoy);
                setStats(res.data.stats);
            } else {
                toast.error('Session expired, please login again.');
                navigate('/delivery/login');
            }
        } catch (err) {
            navigate('/delivery/login');
        }
    };

    const fetchPending = async () => {
        try {
            const res = await api.get('/delivery/pending-deliveries');
            if (res.data.status) {
                setDeliveries(res.data.orders);
            }
        } catch (err) {
            // ignore
        }
    };

    const fetchHistory = async (page = 1) => {
        setHistoryLoading(true);
        try {
            let query = `?page=${page}&limit=10`;
            if (startDate && endDate) {
                query += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await api.get(`/delivery/history${query}`);
            if (res.data.status) {
                setHistory(res.data.orders);
                setHistoryTotalPages(res.data.totalPages || 1);
                setHistoryPage(page);
            }
        } catch (err) {
            toast.error('Failed to fetch history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchTransactions = async (page = 1) => {
        setTransLoading(true);
        try {
            let query = `?page=${page}&limit=10`;
            if (startDate && endDate) {
                query += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await api.get(`/delivery/transactions${query}`);
            if (res.data.status) {
                setTransactions(res.data.transactions);
                setTransTotalPages(res.data.totalPages);
                setTransPage(page);
            }
        } catch (err) {
            toast.error('Failed to fetch transactions');
        } finally {
            setTransLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
        fetchPending();
    }, []);

    useEffect(() => {
        if (viewMode === 'history') {
            fetchHistory(historyPage);
        } else if (viewMode === 'transactions') {
            fetchTransactions(transPage);
        }
    }, [viewMode, startDate, endDate]);

    const handleLogout = async () => {
        await api.post('/delivery/logout');
        navigate('/delivery/login');
    };

    if (!boy) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

    const navStyle = (active) => ({
        padding: '10px 20px',
        background: active ? '#3BB77E' : '#f4f6f8',
        color: active ? '#fff' : '#253D4E',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        flex: 1
    });

    const convertToCSV = (data) => {
        const headers = ['Order Number', 'Date', 'Customer Name', 'Customer Phone', 'Total Amount', 'Payment Method'];
        const csvRows = [headers.join(',')];
        data.forEach(row => {
            csvRows.push([
                row.orderNumber,
                new Date(row.updatedAt).toLocaleDateString(),
                `"${row.user?.name || ''}"`,
                `"${row.user?.phone || ''}"`,
                row.total,
                row.paymentMethod
            ].join(','));
        });
        return csvRows.join('\n');
    };

    const downloadCSV = () => {
        const csvData = convertToCSV(history);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `delivery_history_${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadTransCSV = () => {
        if (transactions.length === 0) return;
        const headers = ['Date', 'Time', 'Type', 'Amount', 'Description'];
        const csvRows = [headers.join(',')];
        transactions.forEach(t => {
            const date = new Date(t.date);
            csvRows.push([
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                t.type === 'addition' ? 'Credit (+)' : 'Debit (-)',
                t.amount,
                `"${t.description}"`
            ].join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `cash_ledger_${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div style={{ background: '#f4f6f8', minHeight: '100vh', paddingBottom: '30px' }}>
            {/* Header */}
            <div style={{ background: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#253D4E' }}>Hi, {boy.name} <User size={24} /></h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#7E7E7E' }}>Delivery Portal</p>
                </div>
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Logout</button>
            </div>

            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Pending Deliveries</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3BB77E' }}>{stats.pendingCount}</div>
                    </div>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', textAlign: 'center', border: '2px solid #ffeedb' }}>
                        <div style={{ fontSize: '13px', color: '#7E7E7E', marginBottom: '5px' }}>Total COD Outstanding</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>₹{Math.round(Number(boy.outstandingAmount)) === 0 ? '0' : Math.round(Number(boy.outstandingAmount))}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => setViewMode('pending')} style={navStyle(viewMode === 'pending')}><Clock size={16} /> Pending</button>
                    <button onClick={() => { setStartDate(''); setEndDate(''); setViewMode('history'); }} style={navStyle(viewMode === 'history')}><CheckCircle size={16} color="green" /> Deliveries</button>
                    <button onClick={() => { setStartDate(''); setEndDate(''); setViewMode('transactions'); }} style={navStyle(viewMode === 'transactions')}><Inbox size={16} color="#007bff" /> Cash</button>
                </div>

                {/* Content */}
                {viewMode === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {deliveries.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '12px', color: '#999' }}>No pending deliveries</div>
                        ) : (
                            deliveries.map(order => (
                                <div key={order.id} onClick={() => navigate(`/delivery/order/${order.id}`)} style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#253D4E' }}>{order.orderNumber}</span>
                                        <span style={{ fontSize: '11px', background: order.orderStatus === 'out_for_delivery' ? '#fd7e14' : '#007bff', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                            {order.orderStatus === 'out_for_delivery' ? 'Out for Delivery' : 'Shipped'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#555' }}>
                                        <strong>Customer:</strong> {order.user?.name} ({order.user?.phone})
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#555' }}>
                                        <strong>Address:</strong> {order.addressText}, {order.addressCity}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '12px', color: '#999' }}>COD: {order.paymentMethod === 'cod' ? 'Yes' : 'No'}</span>
                                        <span style={{ fontWeight: 'bold', color: '#28a745' }}>₹{Number(order.total).toFixed(0)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {viewMode === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <button onClick={downloadCSV} style={{ background: '#253D4E', color: '#fff', border: 'none', padding: '9px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}><Inbox size={16} /> CSV</button>
                            </div>
                        </div>

                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '12px', color: '#999' }}>Loading...</div>
                        ) : history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '12px', color: '#999' }}>No history found for this period</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {history.map(order => (
                                    <div key={order.id} onClick={() => navigate(`/delivery/order/${order.id}`)} style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#253D4E' }}>{order.orderNumber}</span>
                                            <span style={{ fontSize: '11px', background: '#28a745', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Delivered</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#777' }}>
                                            Delivered on {new Date(order.updatedAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '12px', color: '#555' }}>Customer: {order.user?.name}</span>
                                            <span style={{ fontWeight: 'bold', color: '#253D4E' }}>₹{Number(order.total).toFixed(0)}</span>
                                        </div>
                                    </div>
                                ))}

                                {historyTotalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                                        <button disabled={historyPage === 1} onClick={() => fetchHistory(historyPage - 1)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Prev</button>
                                        <span style={{ fontSize: '13px', alignSelf: 'center', color: '#555' }}>Page {historyPage} of {historyTotalPages}</span>
                                        <button disabled={historyPage === historyTotalPages} onClick={() => fetchHistory(historyPage + 1)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Next</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'transactions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <button onClick={downloadTransCSV} style={{ background: '#253D4E', color: '#fff', border: 'none', padding: '9px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}><Inbox size={16} /> CSV</button>
                            </div>
                        </div>

                        {transLoading ? (
                            <div style={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '12px', color: '#999' }}>Loading...</div>
                        ) : transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '12px', color: '#999' }}>No cash collected by admin in this period</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {transactions.map(t => (
                                    <div key={t.id} style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${t.type === 'addition' ? '#28a745' : '#dc3545'}` }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#253D4E' }}>{new Date(t.date).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '12px', color: '#777' }}>{new Date(t.date).toLocaleTimeString()}</div>
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>{t.description}</div>
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: t.type === 'addition' ? '#28a745' : '#dc3545' }}>
                                            {t.type === 'addition' ? '+' : '-'} ₹{t.amount}
                                        </div>
                                    </div>
                                ))}
                                
                                {transTotalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                                        <button disabled={transPage === 1} onClick={() => fetchTransactions(transPage - 1)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Prev</button>
                                        <span style={{ fontSize: '13px', alignSelf: 'center', color: '#555' }}>Page {transPage} of {transTotalPages}</span>
                                        <button disabled={transPage === transTotalPages} onClick={() => fetchTransactions(transPage + 1)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Next</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
