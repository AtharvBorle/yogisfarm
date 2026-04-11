import React, { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import FileManager from '../components/common/FileManager';
import toast from 'react-hot-toast';

const Slider = () => {
    const [sliders, setSliders] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFilemanagerOpen, setFilemanagerOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', image: '', status: 'active', type: 'web', position: 'main', linkType: '', link: ''
    });

    const fetchSliders = async () => {
        try {
            const res = await api.get('/sliders');
            if (res.data.status) setSliders(res.data.sliders);
        } catch (err) {
            toast.error('Failed to load sliders');
        }
    };

    useEffect(() => { fetchSliders(); }, []);

    const openAddModal = () => {
        setFormData({ name: '', image: '', status: 'active', type: 'web', position: 'main', linkType: '', link: '' });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({
            name: row.name || '', image: row.image || '', status: row.status,
            type: row.type || 'web', position: row.position || 'main',
            linkType: row.linkType || '', link: row.link || ''
        });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Delete this slider?')) return;
        try {
            const res = await api.delete(`/sliders/${row.id}`);
            if (res.data.status) { toast.success('Slider deleted'); fetchSliders(); }
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) res = await api.put(`/sliders/${editingId}`, formData);
            else res = await api.post('/sliders', formData);

            if (res.data.status) {
                toast.success(`Slider ${editingId ? 'updated' : 'added'}`);
                setModalOpen(false);
                fetchSliders();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) { toast.error('Submit failed'); }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'Image',
            render: (row) => row.image ? <img src={getAssetUrl(row.image)} alt="Slider" style={{ height: '50px', objectFit: 'cover', borderRadius: '4px' }} /> : 'N/A'
        },
        { header: 'Name', accessor: 'name' },
        { header: 'Type', accessor: 'type' },
        { header: 'Position', accessor: 'position' },
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
                <h2>Slider Management</h2>
                <button onClick={openAddModal} className="btn-add-new">+ Add New</button>
            </div>

            <DataTable columns={columns} data={sliders} onEdit={openEditModal} onDelete={handleDelete} />

            <GenericModal isOpen={isModalOpen} title={editingId ? "Update Slider" : "Add Slider"} onClose={() => setModalOpen(false)}>
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
                                            <div style={{ fontSize: '48px', marginBottom: '10px', color: '#ccc' }}>🖼️</div>
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
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input" placeholder="Enter Name" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Status <span className="required">*</span></label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="admin-select">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-row-3">
                                <div className="admin-form-group">
                                    <label className="admin-label">Type <span className="required">*</span></label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="admin-select">
                                        <option value="web">Web</option>
                                        <option value="mobile_app">Mobile App</option>
                                        <option value="mobile_category">Mobile Category</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Position <span className="required">*</span></label>
                                    <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="admin-select">
                                        <option value="main">Main</option>
                                        <option value="top">Top</option>
                                        <option value="middle">Middle</option>
                                        <option value="bottom">Bottom</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Link Type</label>
                                    <select value={formData.linkType} onChange={e => setFormData({ ...formData, linkType: e.target.value })} className="admin-select">
                                        <option value="">None</option>
                                        <option value="category">Category</option>
                                        <option value="brand">Brand</option>
                                        <option value="product">Product</option>
                                        <option value="url">Custom URL</option>
                                    </select>
                                </div>
                            </div>

                            {formData.linkType && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Link</label>
                                    <input type="text" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="URL or ID" className="admin-input" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>

            <GenericModal isOpen={isFilemanagerOpen} title="File Manager" onClose={() => setFilemanagerOpen(false)}>
                <div style={{ height: '400px' }}>
                    <FileManager
                        onClose={() => setFilemanagerOpen(false)}
                        onSelect={(path) => setFormData({ ...formData, image: path })}
                    />
                </div>
            </GenericModal>
        </div>
    );
};

export default Slider;
