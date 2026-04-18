import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const Tax = () => {
    const [taxes, setTaxes] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', tax: 0, status: 'active' });

    const fetchTaxes = async () => {
        try {
            const res = await api.get('/taxes');
            if (res.data.status) {
                setTaxes(res.data.taxes);
            }
        } catch (error) {
            toast.error('Failed to load taxes');
        }
    };

    useEffect(() => {
        fetchTaxes();
    }, []);

    const openAddModal = () => {
        setFormData({ name: '', tax: 0, status: 'active' });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({ name: row.name, tax: row.tax, status: row.status });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this tax?')) return;
        try {
            const res = await api.delete(`/taxes/${row.id}`);
            if (res.data.status) {
                toast.success('Tax deleted successfully');
                fetchTaxes();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete tax');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) {
                res = await api.put(`/taxes/${editingId}`, formData);
            } else {
                res = await api.post('/taxes', formData);
            }
            
            if (res.data.status) {
                toast.success(`Tax ${editingId ? 'updated' : 'added'} successfully`);
                setModalOpen(false);
                fetchTaxes();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(`Failed to ${editingId ? 'update' : 'add'} tax`);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Tax %', render: (row) => `${row.tax}%` },
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
                <h2>Tax Management</h2>
                <button onClick={openAddModal} className="btn-add-new">
                    + Add New
                </button>
            </div>
            
            <DataTable 
                columns={columns} 
                data={taxes} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
            />

            <GenericModal 
                isOpen={isModalOpen} 
                title={editingId ? "Update Tax" : "Add New Tax"} 
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit}>
                    <div className="modal-row-3">
                        <div className="admin-form-group">
                            <label className="admin-label">Name <span className="required">*</span></label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                                className="admin-input"
                                placeholder="e.g., GST 5%"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Tax (%) <span className="required">*</span></label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.tax} 
                                onChange={e => setFormData({...formData, tax: parseFloat(e.target.value)})} 
                                required 
                                className="admin-input"
                                placeholder="e.g., 5"
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default Tax;
