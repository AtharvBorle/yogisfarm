import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Collections = () => {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedBoy, setSelectedBoy] = useState(null);
    const [collectAmount, setCollectAmount] = useState('');
    const [isHistoryOpen, setHistoryOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState([]);

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
        setCollectAmount(boy.outstandingAmount);
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

    const openHistoryModal = (boy) => {
        setSelectedHistory(boy.collections || []);
        setHistoryOpen(true);
    };

    const columns = [
        { header: 'Delivery Boy', accessor: row => <span style={{ fontWeight: '600' }}>{row.name}</span> },
        { header: 'Phone', accessor: 'phone' },
        { 
            header: 'Outstanding Balance', 
            accessor: row => (
                <span style={{ 
                    color: Number(row.outstandingAmount) > 0 ? '#dc3545' : '#28a745', 
                    fontWeight: 'bold' 
                }}>
                    ₹{Number(row.outstandingAmount).toFixed(0)}
                </span>
            ) 
        },
        {
            header: 'Actions',
            accessor: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openCollectModal(row)} className="btn-edit" style={{ background: '#28a745', padding: '6px 12px' }}>💰 Collect Cash</button>
                    <button onClick={() => openHistoryModal(row)} className="btn-edit" style={{ background: '#6c757d', padding: '6px 12px' }}>🕒 History</button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#333' }}>COD Collections</h2>
            </div>

            <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
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
                                Total Outstanding: <strong>₹{Number(selectedBoy.outstandingAmount).toFixed(0)}</strong>
                            </p>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Amount to Collect (₹)</label>
                            <input
                                type="number"
                                value={collectAmount}
                                onChange={e => setCollectAmount(e.target.value)}
                                max={Number(selectedBoy.outstandingAmount)}
                                step="0.01"
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" style={{ padding: '8px 20px', background: '#3BB77E', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Collection</button>
                        </div>
                    </form>
                )}
            </GenericModal>

            <GenericModal isOpen={isHistoryOpen} title="Recent Collections" onClose={() => setHistoryOpen(false)}>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedHistory.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No collection history available.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Date & Time</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedHistory.map(h => (
                                    <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{new Date(h.createdAt).toLocaleString()}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>₹{Number(h.amount).toFixed(0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </GenericModal>
        </div>
    );
};

export default Collections;
