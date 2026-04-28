import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Calendar, Download } from 'react-feather';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = '/logs';
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await api.get(url);
            if (res.data.status) {
                setLogs(res.data.logs);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [startDate, endDate]);

    const convertToCSV = (data) => {
        const headers = ['ID', 'Date', 'Time', 'Admin Name', 'Admin Email', 'Action', 'Details'];
        const csvRows = [headers.join(',')];
        data.forEach(log => {
            const date = new Date(log.createdAt);
            csvRows.push([
                log.id,
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                `"${log.admin?.name || ''}"`,
                `"${log.admin?.email || ''}"`,
                `"${log.action || ''}"`,
                `"${(log.details || '').replace(/"/g, '""')}"`
            ].join(','));
        });
        return csvRows.join('\n');
    };

    const downloadCSV = () => {
        if (logs.length === 0) return toast.error('No logs to download');
        const csvData = convertToCSV(logs);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `admin_logs_${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ marginBottom: '5px' }}>Admin Action Logs</h2>
                    <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                        <span>Dashboard</span> <span style={{ color: '#ccc' }}>/</span> <span style={{ color: '#3BB77E' }}>Logs</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>Start Date</label>
                        <input type="date" className="admin-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>End Date</label>
                        <input type="date" className="admin-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <button onClick={downloadCSV} className="btn-modal-submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#253D4E', padding: '10px 20px', borderRadius: '5px' }}>
                        <Download size={16} /> Download CSV
                    </button>
                </div>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Admin</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No logs found for this period.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{new Date(log.createdAt).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #777)' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{log.admin?.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #777)' }}>{log.admin?.email}</div>
                                    </td>
                                    <td><span style={{ background: 'var(--sidebar-hover)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{log.action}</span></td>
                                    <td style={{ fontSize: '13px' }}>{log.details || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Logs;
