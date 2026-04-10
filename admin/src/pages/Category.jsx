import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import FileManager from '../components/common/FileManager';
import toast from 'react-hot-toast';

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
            render: (row) => row.image ? <img src={`http://localhost:5000${row.image}`} alt="Cat" style={{height:'40px', objectFit:'contain'}}/> : 'N/A' 
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
                <button onClick={openAddModal} style={{ background: '#3BB77E', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ Add New</button>
            </div>
            
            <DataTable columns={columns} data={categories} onEdit={openEditModal} onDelete={handleDelete} />

            <GenericModal isOpen={isModalOpen} title={editingId ? "Update Category" : "Add Category"} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Category Image</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {formData.image && <img src={`http://localhost:5000${formData.image}`} style={{height:'50px', border:'1px solid #ddd'}} />}
                            <button type="button" onClick={() => setFilemanagerOpen(true)} style={{ padding: '8px 15px', background: '#e2e6ea', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                                Select from Filemanager
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Parent Category</label>
                        <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            <option value="">-- No Parent (Top Level) --</option>
                            {availableParents.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                        <label htmlFor="featured">Featured Category</label>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Status *</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '8px 15px', border: 'none', background: '#3BB77E', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
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
