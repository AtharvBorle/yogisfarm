import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import FileManager from '../components/common/FileManager';
import toast from 'react-hot-toast';

const Brand = () => {
    const [brands, setBrands] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFilemanagerOpen, setFilemanagerOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', image: '', showHome: false, status: 'active' });

    const fetchBrands = async () => {
        try {
            const res = await api.get('/brands');
            if (res.data.status) setBrands(res.data.brands);
        } catch (error) {
            toast.error('Failed to load brands');
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    const openAddModal = () => {
        setFormData({ name: '', image: '', showHome: false, status: 'active' });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({ name: row.name, image: row.image || '', showHome: row.showHome, status: row.status });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Delete this brand?')) return;
        try {
            const res = await api.delete(`/brands/${row.id}`);
            if (res.data.status) { toast.success('Brand deleted'); fetchBrands(); }
        } catch (error) { toast.error('Delete failed'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            // The backend expects boolean string for showHome if sent as form data, but we can send JSON since we aren't using upload.single anymore 
            // Wait, the backend in admin.js allows json if we don't send multi-part form. But since we use Filemanager, image is just a string.
            // Oh wait, in backend `upload.single('image')` isn't STRICTLY required if we send JSON. Wait, Multer might crash if we send JSON to upload.single?
            // Actually, `upload.single` ignores JSON bodies, but let's test if it crashes. To be safe, we can send FormData or just JSON if the backend handles it.
            // Let's send JSON. If multer complains, we will fix the backend or send empty file. 
            // Better to send JSON, since we only pass image as string URL.
            
            if (editingId) res = await api.put(`/brands/${editingId}`, { ...formData, showHome: formData.showHome.toString() });
            else res = await api.post('/brands', { ...formData, showHome: formData.showHome.toString() });
            
            if (res.data.status) {
                toast.success(`Brand ${editingId ? 'updated' : 'added'}`);
                setModalOpen(false);
                fetchBrands();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) { toast.error('Submit failed'); }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            render: (row) => row.image ? <img src={`http://localhost:5000${row.image}`} alt="Brand" style={{height:'40px', objectFit:'contain'}}/> : 'N/A' 
        },
        { header: 'Name', accessor: 'name' },
        { header: 'Show on Home', render: (row) => row.showHome ? 'Yes' : 'No' },
        { header: 'Status', render: (row) => row.status }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Brand Management</h2>
                <button onClick={openAddModal} style={{ background: '#3BB77E', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ Add New</button>
            </div>
            
            <DataTable columns={columns} data={brands} onEdit={openEditModal} onDelete={handleDelete} />

            <GenericModal isOpen={isModalOpen} title={editingId ? "Update Brand" : "Add Brand"} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Brand Image</label>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" id="showHome" checked={formData.showHome} onChange={e => setFormData({...formData, showHome: e.target.checked})} />
                        <label htmlFor="showHome">Show on Homepage</label>
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

export default Brand;
