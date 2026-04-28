import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Download, Shield } from 'lucide-react';

const Logs = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!startDate || !endDate) {
            return toast.error('Please select both start and end dates');
        }

        setIsDownloading(true);
        try {
            const res = await api.get(`/logs/download?startDate=${startDate}&endDate=${endDate}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `admin_logs_${startDate}_to_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Logs downloaded successfully');
        } catch (error) {
            toast.error('Failed to download logs');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: 'var(--text)' }}>Admin Action Logs</h2>
                <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted, #888)', fontSize: '14px' }}>Download system logs for security and auditing purposes.</p>
            </div>

            <div className="admin-card" style={{ padding: '30px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', padding: '15px', background: 'var(--sidebar-hover)', borderRadius: '8px', color: 'var(--text)' }}>
                    <Shield size={24} color="#3BB77E" />
                    <div>
                        <strong style={{ display: 'block', fontSize: '14px' }}>Security Audit Log</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted, #888)' }}>Logs are only available via CSV download to optimize system performance.</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text)', fontSize: '13px' }}>Start Date</label>
                        <input 
                            type="date" 
                            className="admin-input" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text)', fontSize: '13px' }}>End Date</label>
                        <input 
                            type="date" 
                            className="admin-input" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        background: '#3BB77E', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: isDownloading ? 'not-allowed' : 'pointer',
                        fontSize: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isDownloading ? 0.7 : 1
                    }}
                >
                    <Download size={18} />
                    {isDownloading ? 'Generating CSV...' : 'Download Logs CSV'}
                </button>
            </div>
        </div>
    );
};

export default Logs;
