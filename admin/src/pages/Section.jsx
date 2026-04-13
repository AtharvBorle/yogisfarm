import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import ReorderModal from '../components/common/ReorderModal';
import toast from 'react-hot-toast';

const Section = () => {
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isReorderOpen, setReorderOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', categoryId: '', status: 'active' });

    const fetchData = async () => {
        try {
            const [secRes, catRes] = await Promise.all([
                api.get('/sections'),
                api.get('/categories')
            ]);
            if (secRes.data.status) setSections(secRes.data.sections);
            if (catRes.data.status) setCategories(catRes.data.categories);
        } catch (error) {
            toast.error('Failed to load sections data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openAddModal = () => {
        setFormData({ name: '', categoryId: '', status: 'active' });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({ name: row.name, categoryId: row.categoryId || '', status: row.status });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Delete this section?')) return;
        try {
            const res = await api.delete(`/sections/${row.id}`);
            if (res.data.status) {
                toast.success('Section deleted');
                fetchData();
            }
        } catch (error) { toast.error('Delete failed'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) res = await api.put(`/sections/${editingId}`, formData);
            else res = await api.post('/sections', formData);
            
            if (res.data.status) {
                toast.success(`Section ${editingId ? 'updated' : 'added'} successfully`);
                setModalOpen(false);
                fetchData();
            }
        } catch (error) { toast.error('Submit failed'); }
    };

    const handleReorderSave = async (orderedIds) => {
        try {
            const res = await api.put('/sections/order/update', { order: orderedIds });
            if (res.data.status) {
                toast.success('Section order saved');
                setReorderOpen(false);
                fetchData();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error('Order save failed');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Linked Category', render: (row) => row.category?.name || 'None' },
        { 
            header: 'Status', 
            render: (row) => (
                <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', background: row.status === 'active' ? '#e6f4ea' : '#fce8e6', color: row.status === 'active' ? '#1a73e8' : '#ea4335' }}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Section Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setReorderOpen(true)} className="btn-add-new" style={{ backgroundColor: '#ff9900' }}>⇕ Order</button>
                    <button onClick={openAddModal} className="btn-add-new">+ Add New</button>
                </div>
            </div>
            
            <DataTable columns={columns} data={sections} onEdit={openEditModal} onDelete={handleDelete} />

            <GenericModal isOpen={isModalOpen} title={editingId ? "Update Section" : "New Section"} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-row-2">
                        <div className="admin-form-group">
                            <label className="admin-label">Name <span className="required">*</span></label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="admin-input" placeholder="Enter Name" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Status <span className="required">*</span></label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="admin-select">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="admin-form-group">
                        <label className="admin-label">Category <span className="required">*</span></label>
                        <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required className="admin-select">
                            <option value="">Select</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>

            <ReorderModal 
                isOpen={isReorderOpen} 
                onClose={() => setReorderOpen(false)} 
                data={sections} 
                onSave={handleReorderSave} 
                itemLabelKey="name" 
            />
        </div>
    );
};

export default Section;
