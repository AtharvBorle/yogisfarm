import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Shipping = () => {
    const [shippingRules, setShippingRules] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', charge: '', minCartValue: '', status: 'active' });

    const fetchShipping = async () => {
        try {
            const res = await api.get('/shipping');
            if (res.data.status) {
                setShippingRules(res.data.shipping);
            }
        } catch (error) {
            toast.error('Failed to load shipping rules');
        }
    };

    useEffect(() => {
        fetchShipping();
    }, []);

    const openAddModal = () => {
        setFormData({ name: '', charge: '', minCartValue: '', status: 'active' });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({ name: row.name, charge: row.charge, minCartValue: row.minCartValue, status: row.status });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this shipping rule?')) return;
        try {
            const res = await api.delete(`/shipping/${row.id}`);
            if (res.data.status) {
                toast.success('Shipping rule deleted successfully');
                fetchShipping();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete shipping rule');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) {
                res = await api.put(`/shipping/${editingId}`, formData);
            } else {
                res = await api.post('/shipping', formData);
            }
            
            if (res.data.status) {
                toast.success(`Shipping rule ${editingId ? 'updated' : 'added'} successfully`);
                setModalOpen(false);
                fetchShipping();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(`Failed to ${editingId ? 'update' : 'add'} shipping rule`);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', render: (row) => <span style={{ fontWeight: '500' }}>{row.name}</span> },
        { header: 'Charge', render: (row) => `₹${Number(row.charge).toFixed(0)}` },
        { header: 'Free Shipping Above', render: (row) => `₹${Number(row.minCartValue).toFixed(0)}` },
        { 
            header: 'Status', 
            render: (row) => (
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: row.status === 'active' ? '#e6f4ea' : '#fce8e6',
                    color: row.status === 'active' ? '#1a73e8' : '#ea4335'
                }}>
                    {row.status}
                </span>
            )
        },
        { header: 'Created On', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Shipping Management</h2>
                <button onClick={openAddModal} className="btn-add-new">
                    + Add New
                </button>
            </div>
            
            <DataTable 
                columns={columns} 
                data={shippingRules} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
            />

            <GenericModal 
                isOpen={isModalOpen} 
                title={editingId ? "Update Shipping Rule" : "Add New Shipping Rule"} 
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit}>
                    <div className="modal-row-2">
                        <div className="admin-form-group">
                            <label className="admin-label">Name <span className="required">*</span></label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                                className="admin-input"
                                placeholder="e.g., Standard Shipping"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Shipping Charge (₹) <span className="required">*</span></label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.charge} 
                                onChange={e => setFormData({...formData, charge: e.target.value})} 
                                required 
                                className="admin-input"
                                placeholder="e.g., 50"
                            />
                        </div>
                    </div>
                    <div className="modal-row-2">
                        <div className="admin-form-group">
                            <label className="admin-label">Min Cart Value for Free Shipping (₹) <span className="required">*</span></label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.minCartValue} 
                                onChange={e => setFormData({...formData, minCartValue: e.target.value})} 
                                required 
                                className="admin-input"
                                placeholder="e.g., 500 (orders above this = free shipping)"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Status <span className="required">*</span></label>
                            <select 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value})}
                                className="admin-select"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ background: '#f0f9f4', border: '1px solid #c3e6cb', borderRadius: '6px', padding: '12px 16px', margin: '15px 0', fontSize: '13px', color: '#155724' }}>
                        <strong>How it works:</strong> If cart total is below the "Min Cart Value", the shipping charge will be applied. Orders above this value get <strong>free shipping</strong>.
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default Shipping;
