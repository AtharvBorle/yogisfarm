import React, { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import FileManager from '../components/common/FileManager';
import toast from 'react-hot-toast';

import { Image } from 'react-feather';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFilemanagerOpen, setFilemanagerOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', image: '', parentId: '', featured: false, status: 'active' });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.status) setCategories(res.data.categories);
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openAddModal = () => {
        setFormData({ name: '', image: '', parentId: '', featured: false, status: 'active' });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({ name: row.name, image: row.image || '', parentId: row.parentId || '', featured: row.featured, status: row.status });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            const res = await api.delete(`/categories/${row.id}`);
            if (res.data.status) { toast.success('Category deleted'); fetchCategories(); }
        } catch (error) { toast.error('Delete failed'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, featured: formData.featured.toString() };
            if (!payload.parentId) delete payload.parentId; // If empty, don't send to backend or send null equivalent
            
            let res;
            if (editingId) res = await api.put(`/categories/${editingId}`, payload);
            else res = await api.post('/categories', payload);
            
            if (res.data.status) {
                toast.success(`Category ${editingId ? 'updated' : 'added'}`);
                setModalOpen(false);
                fetchCategories();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) { toast.error('Submit failed'); }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            render: (row) => row.image ? <img src={getAssetUrl(row.image)} alt="Cat" style={{height:'40px', objectFit:'contain'}}/> : 'N/A' 
        },
        { header: 'Name', accessor: 'name' },
        { header: 'Parent', render: (row) => row.parent ? row.parent.name : 'No Parent' },
        { header: 'Featured', render: (row) => row.featured ? 'Yes' : 'No' },
        { header: 'Status', render: (row) => row.status }
    ];

    // Filter available parents to NOT include self (if editing)
    const availableParents = categories.filter(c => c.id !== editingId);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Category Management</h2>
                <button onClick={openAddModal} className="btn-add-new">+ Add New</button>
            </div>
            
            <DataTable columns={columns} data={categories} onEdit={openEditModal} onDelete={handleDelete} />

            <GenericModal isOpen={isModalOpen} title={editingId ? "Update Category" : "Add Category"} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-grid">
                        
                        {/* LEFT COLUMN: Image */}
                        <div className="modal-image-col">
                            <div className="admin-form-group">
                                <label className="admin-label">Image <span className="required">*</span></label>
                                <div 
                                    className="image-placeholder-box" 
                                    onClick={() => setFilemanagerOpen(true)}
                                >
                                    {formData.image ? (
                                        <img src={getAssetUrl(formData.image)} alt="Selected" />
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '10px', color: '#ccc' }}><Image size={48} /></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Inputs */}
                        <div className="modal-inputs-col">
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
                                <label className="admin-label">Parent</label>
                                <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} className="admin-select">
                                    <option value="">No Parent</option>
                                    {availableParents.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                <label htmlFor="featured" style={{ cursor: 'pointer', fontWeight: '500', fontSize: '14px', color: 'var(--text)' }}>Featured Category</label>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>

            {/* Inner Modal for Filemanager */}
            <GenericModal isOpen={isFilemanagerOpen} title="File Manager" onClose={() => setFilemanagerOpen(false)}>
                <div style={{ height: '400px' }}>
                    <FileManager 
                        onClose={() => setFilemanagerOpen(false)} 
                        onSelect={(path) => setFormData({...formData, image: path})} 
                    />
                </div>
            </GenericModal>
        </div>
    );
};

export default Category;
