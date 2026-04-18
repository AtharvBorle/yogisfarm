import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Coupon = () => {
    const [coupons, setCoupons] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', code: '', status: 'active', amountType: 'percent', 
        amount: 0, minOrderAmount: 0, description: '', expireOn: '' 
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            if (res.data.status) {
                setCoupons(res.data.coupons);
            }
        } catch (error) {
            toast.error('Failed to load coupons');
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const generateCode = () => {
        const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) code += text.charAt(Math.floor(Math.random() * text.length));
        setFormData({ ...formData, code });
    };

    const openAddModal = () => {
        setFormData({ 
            name: '', code: '', status: 'active', amountType: 'percent', 
            amount: 0, minOrderAmount: 0, description: '', expireOn: '' 
        });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({ 
            name: row.name, code: row.code, status: row.status, 
            amountType: row.amountType, amount: row.amount, 
            minOrderAmount: row.minOrderAmount, description: row.description || '', 
            expireOn: row.expireOn ? new Date(row.expireOn).toISOString().split('T')[0] : '' 
        });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await api.delete(`/coupons/${row.id}`);
            if (res.data.status) {
                toast.success('Coupon deleted successfully');
                fetchCoupons();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) {
                res = await api.put(`/coupons/${editingId}`, formData);
            } else {
                res = await api.post('/coupons', formData);
            }
            
            if (res.data.status) {
                toast.success(`Coupon ${editingId ? 'updated' : 'added'} successfully`);
                setModalOpen(false);
                fetchCoupons();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(`Failed to ${editingId ? 'update' : 'add'} coupon`);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Code', render: (row) => <strong>{row.code}</strong> },
        { header: 'Type', accessor: 'amountType' },
        { header: 'Amount', accessor: 'amount' },
        { header: 'Min Order', accessor: 'minOrderAmount' },
        { header: 'Expiry', render: (row) => row.expireOn ? new Date(row.expireOn).toLocaleDateString() : 'Never' },
        { 
            header: 'Status', 
            render: (row) => (
                <span style={{
                    padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                    background: row.status === 'active' ? '#e6f4ea' : '#fce8e6',
                    color: row.status === 'active' ? '#1a73e8' : '#ea4335'
                }}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Coupon Management</h2>
                <button onClick={openAddModal} className="btn-add-new">
                    + Add New
                </button>
            </div>
            
            <DataTable 
                columns={columns} 
                data={coupons} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
            />

            <GenericModal 
                isOpen={isModalOpen} 
                title={editingId ? "Update Coupon" : "Add New Coupon"} 
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-label">Coupon Name *</label>
                            <input 
                                type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                                required className="admin-input"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Coupon Code *</label>
                            <div style={{ display: 'flex' }}>
                                <input 
                                    type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                                    required className="admin-input" style={{ borderRadius: '6px 0 0 6px' }}
                                />
                                <button type="button" onClick={generateCode} style={{ background: '#1a6e3a', color: 'white', border: 'none', padding: '0 15px', borderRadius: '0 6px 6px 0', cursor: 'pointer' }}>Generate</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-label">Discount Type *</label>
                            <select value={formData.amountType} onChange={e => setFormData({...formData, amountType: e.target.value})} className="admin-select">
                                <option value="percent">Percent (%)</option>
                                <option value="amount">Amount (₹)</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Amount *</label>
                            <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} required className="admin-input" />
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-label">Min Order Amount (₹)</label>
                            <input type="number" step="0.01" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: parseFloat(e.target.value)})} className="admin-input" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Expire On</label>
                            <input type="date" value={formData.expireOn} onChange={e => setFormData({...formData, expireOn: e.target.value})} className="admin-input" />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Status *</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="admin-select">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    
                    <div className="admin-form-group">
                        <label className="admin-label">Description</label>
                        <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="admin-textarea"></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default Coupon;
