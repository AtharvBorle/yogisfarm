import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

import { DollarSign, Clock, Edit, Plus, Download } from 'react-feather';

const Collections = () => {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedBoy, setSelectedBoy] = useState(null);
    const [collectAmount, setCollectAmount] = useState('');
    
    // History State
    const [isHistoryOpen, setHistoryOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [historyLoading, setHistoryLoading] = useState(false);

    // Add/Edit State
    const [isAddEditOpen, setAddEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ id: null, name: '', phone: '', pin: '', city: '', pincode: '' });

    const fetchDeliveryBoys = async () => {
        try {
            const res = await api.get('/delivery-boys');
            if (res.data.status) {
                setDeliveryBoys(res.data.deliveryBoys);
            }
        } catch (err) {
            toast.error('Failed to load delivery boys');
        }
    };

    useEffect(() => {
        fetchDeliveryBoys();
    }, []);

    const openCollectModal = (boy) => {
        if (Number(boy.outstandingAmount) <= 0) {
            toast.error('No outstanding balance to collect');
            return;
        }
        setSelectedBoy(boy);
        setCollectAmount(Math.round(Number(boy.outstandingAmount)));
        setModalOpen(true);
    };

    const handleCollect = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/delivery-boys/${selectedBoy.id}/collect`, { amount: collectAmount });
            if (res.data.status) {
                toast.success(res.data.message);
                setModalOpen(false);
                fetchDeliveryBoys();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error('Failed to collect cash');
        }
    };

    const fetchHistory = async (boyId, page = 1) => {
        setHistoryLoading(true);
        try {
            let query = `?page=${page}&limit=10`;
            if (startDate && endDate) query += `&startDate=${startDate}&endDate=${endDate}`;
            const res = await api.get(`/delivery-boys/${boyId}/collections${query}`);
            if (res.data.status) {
                setHistory(res.data.collections);
                setHistoryTotalPages(res.data.totalPages);
                setHistoryPage(page);
            }
        } catch (e) {
            toast.error('Failed to load history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const openHistoryModal = (boy) => {
        setSelectedBoy(boy);
        setStartDate('');
        setEndDate('');
        fetchHistory(boy.id, 1);
        setHistoryOpen(true);
    };

    useEffect(() => {
        if (isHistoryOpen && selectedBoy) {
            fetchHistory(selectedBoy.id, historyPage);
        }
    }, [startDate, endDate]);

    const downloadHistoryCSV = () => {
        if (history.length === 0) return toast.error('No history to download');
        const headers = ['Date', 'Time', 'Amount'];
        const csvRows = [headers.join(',')];
        history.forEach(h => {
            const date = new Date(h.createdAt);
            csvRows.push([
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                h.amount
            ].join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `collections_${selectedBoy?.name || 'history'}_${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleAddEditSave = async (e) => {
        e.preventDefault();
        try {
            if (editForm.id) {
                const res = await api.put(`/delivery-boys/${editForm.id}`, editForm);
                if (res.data.status) toast.success('Delivery Boy updated');
            } else {
                const res = await api.post('/delivery-boys', editForm);
                if (res.data.status) toast.success('Delivery Boy added');
            }
            setAddEditOpen(false);
            fetchDeliveryBoys();
        } catch (err) {
            toast.error('Failed to save');
        }
    };

    const openAddModal = () => {
        setEditForm({ id: null, name: '', phone: '', pin: '', city: '', pincode: '' });
        setAddEditOpen(true);
    };

    const openEditModal = (boy) => {
        setEditForm({ id: boy.id, name: boy.name, phone: boy.phone, pin: '', city: boy.city || '', pincode: boy.pincode || '' });
        setAddEditOpen(true);
    };

    const columns = [
        { header: 'ID', render: row => <span style={{ color: '#888' }}>#{row.id}</span> },
        { header: 'Delivery Boy', render: row => <span style={{ fontWeight: '600' }}>{row.name}</span> },
        { header: 'Phone', accessor: 'phone' },
        { 
            header: 'Outstanding Balance', 
            render: row => {
                let amt = Math.round(Number(row.outstandingAmount));
                return (
                    <span style={{ 
                        color: amt > 0 ? '#dc3545' : '#28a745', 
                        fontWeight: 'bold' 
                    }}>
                        ₹{amt === 0 ? '0' : amt}
                    </span>
                );
            } 
        },
        {
            header: 'Actions',
            render: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openCollectModal(row)} className="btn-edit" style={{ background: '#28a745', padding: '6px 10px', fontSize: '11px' }}><DollarSign size={14} /> Collect</button>
                    <button onClick={() => openHistoryModal(row)} className="btn-edit" style={{ background: '#6c757d', padding: '6px 10px', fontSize: '11px' }}><Clock size={14} /> History</button>
                    <button onClick={() => openEditModal(row)} className="btn-edit" style={{ background: '#007bff', padding: '6px 10px', fontSize: '11px' }}><Edit size={14} /> Edit</button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: 'var(--text)' }}>COD Collections & Delivery Boys</h2>
                <button onClick={openAddModal} className="btn-modal-submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3BB77E', padding: '8px 16px' }}>
                    <Plus size={16} /> Add Delivery Boy
                </button>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <DataTable columns={columns} data={deliveryBoys} searchPlaceholder="Search delivery boy..." />
            </div>

            <GenericModal isOpen={isModalOpen} title="Collect Cash" onClose={() => setModalOpen(false)}>
                {selectedBoy && (
                    <form onSubmit={handleCollect}>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                                Collection from: <strong>{selectedBoy.name}</strong>
                            </p>
                            <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#dc3545' }}>
                                Total Outstanding: <strong>₹{Math.abs(Number(selectedBoy.outstandingAmount)) < 0.01 ? '0' : Number(selectedBoy.outstandingAmount).toFixed(0)}</strong>
                            </p>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Amount to Collect (₹)</label>
                            <input
                                type="number"
                                value={collectAmount}
                                onChange={e => setCollectAmount(e.target.value)}
                                max={Math.round(Number(selectedBoy.outstandingAmount))}
                                step="1"
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '5px', boxSizing: 'border-box', background: 'var(--card-bg)', color: 'var(--text)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Collection</button>
                        </div>
                    </form>
                )}
            </GenericModal>

            <GenericModal isOpen={isHistoryOpen} title="Recent Collections" onClose={() => setHistoryOpen(false)}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Start Date</label>
                        <input type="date" className="admin-input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '6px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>End Date</label>
                        <input type="date" className="admin-input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '6px' }} />
                    </div>
                    <button onClick={downloadHistoryCSV} className="btn-modal-submit" style={{ background: '#253D4E', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Download size={14} /> CSV
                    </button>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {historyLoading ? (
                        <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Loading...</p>
                    ) : history.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No collection history available.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text)' }}>Date & Time</th>
                                    <th style={{ padding: '10px', textAlign: 'right', color: 'var(--text)' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(h => (
                                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                                        <td style={{ padding: '10px' }}>{new Date(h.createdAt).toLocaleString()}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>₹{Number(h.amount).toFixed(0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {historyTotalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                        <button disabled={historyPage === 1} onClick={() => fetchHistory(selectedBoy.id, historyPage - 1)} className="btn-edit" style={{ background: '#6c757d', padding: '4px 10px' }}>Prev</button>
                        <span style={{ fontSize: '12px', alignSelf: 'center', color: 'var(--text)' }}>Page {historyPage} of {historyTotalPages}</span>
                        <button disabled={historyPage === historyTotalPages} onClick={() => fetchHistory(selectedBoy.id, historyPage + 1)} className="btn-edit" style={{ background: '#6c757d', padding: '4px 10px' }}>Next</button>
                    </div>
                )}
            </GenericModal>

            <GenericModal isOpen={isAddEditOpen} title={editForm.id ? "Edit Delivery Boy" : "Add Delivery Boy"} onClose={() => setAddEditOpen(false)}>
                <form onSubmit={handleAddEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Name *</label>
                        <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="admin-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Phone *</label>
                        <input type="text" required value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="admin-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Login PIN {editForm.id ? '(Leave blank to keep current)' : '*'}</label>
                        <input type="text" required={!editForm.id} value={editForm.pin} onChange={e => setEditForm({...editForm, pin: e.target.value})} className="admin-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>City</label>
                        <input type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="admin-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pincode</label>
                        <input type="text" value={editForm.pincode} onChange={e => setEditForm({...editForm, pincode: e.target.value})} className="admin-input" style={{ width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="submit" className="btn-modal-submit" style={{ background: '#3BB77E', padding: '8px 20px' }}>Save</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default Collections;
