import React, { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import FileManager from '../components/common/FileManager';
import ReorderModal from '../components/common/ReorderModal';
import toast from 'react-hot-toast';

import { Image } from 'react-feather';

const Slider = () => {
    const [sliders, setSliders] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFilemanagerOpen, setFilemanagerOpen] = useState(false);
    const [filemanagerTarget, setFilemanagerTarget] = useState('image');
    const [isReorderOpen, setReorderOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', image: '', mobileImage: '', status: 'active', type: 'web', position: 'main', subposition: '', linkType: '', link: ''
    });

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [productKeyword, setProductKeyword] = useState('');
    const [productResults, setProductResults] = useState([]);

    const fetchSliders = async () => {
        try {
            const res = await api.get('/sliders');
            if (res.data.status) setSliders(res.data.sliders);
        } catch (err) {
            toast.error('Failed to load sliders');
        }
    };

    useEffect(() => { 
        fetchSliders(); 
        api.get('/categories').then(res => res.data.status && setCategories(res.data.categories));
        api.get('/brands').then(res => res.data.status && setBrands(res.data.brands));
    }, []);

    useEffect(() => {
        if (formData.linkType === 'product' && productKeyword.length > 1) {
            const timer = setTimeout(() => {
                api.get(`/products?search=${productKeyword}`).then(res => {
                    if (res.data.status) setProductResults(res.data.products);
                });
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setProductResults([]);
        }
    }, [productKeyword, formData.linkType]);

    const openAddModal = () => {
        setFormData({ name: '', image: '', mobileImage: '', status: 'active', type: 'web', position: 'main', subposition: '', linkType: '', link: '' });
        setProductKeyword('');
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({
            name: row.name || '', image: row.image || '', mobileImage: row.mobileImage || '', status: row.status,
            type: row.type || 'web', position: row.position || 'main', subposition: row.subposition || '',
            linkType: row.linkType || '', link: row.link || ''
        });
        setProductKeyword('');
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

    const handleReorderSave = async (orderedIds) => {
        try {
            const res = await api.put('/sliders/order/update', { order: orderedIds });
            if (res.data.status) {
                toast.success('Slider order saved');
                setReorderOpen(false);
                fetchSliders();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error('Order save failed');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'Images',
            render: (row) => (
                <div style={{ display: 'flex', gap: '5px' }}>
                    {row.image && <img src={getAssetUrl(row.image)} alt="Desktop" title="Desktop" style={{ height: '40px', width: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                    {row.mobileImage && <img src={getAssetUrl(row.mobileImage)} alt="Mobile" title="Mobile" style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #0A6738' }} />}
                </div>
            )
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setReorderOpen(true)} className="btn-add-new" style={{ backgroundColor: '#ff9900' }}>⇕ Order</button>
                    <button onClick={openAddModal} className="btn-add-new">+ Add New</button>
                </div>
            </div>

            <DataTable columns={columns} data={sliders} onEdit={openEditModal} onDelete={handleDelete} />

            <GenericModal isOpen={isModalOpen} title={editingId ? "Update Slider" : "Add Slider"} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-grid">
                        {/* LEFT COLUMN: Images */}
                        <div className="modal-image-col" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="admin-form-group">
                                <label className="admin-label">Desktop Image <span className="required">*</span></label>
                                <div 
                                    className="image-placeholder-box" 
                                    onClick={() => { setFilemanagerTarget('image'); setFilemanagerOpen(true); }}
                                    style={{ cursor: 'pointer', border: '2px dashed #ccc', borderRadius: '8px', padding: '10px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', overflow: 'hidden' }}
                                >
                                    {formData.image ? (
                                        <img src={getAssetUrl(formData.image)} alt="Desktop Selected" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '32px', color: '#ccc', display: 'flex', justifyContent: 'center' }}><Image size={32} /></div>
                                            <span style={{ fontSize: '12px', color: '#666' }}>Upload Desktop</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Mobile Image (312px x 190px)</label>
                                <div 
                                    className="image-placeholder-box" 
                                    onClick={() => { setFilemanagerTarget('mobileImage'); setFilemanagerOpen(true); }}
                                    style={{ cursor: 'pointer', border: '2px dashed #ccc', borderRadius: '8px', padding: '10px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', overflow: 'hidden' }}
                                >
                                    {formData.mobileImage ? (
                                        <img src={getAssetUrl(formData.mobileImage)} alt="Mobile Selected" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '32px', color: '#ccc', display: 'flex', justifyContent: 'center' }}><Image size={32} /></div>
                                            <span style={{ fontSize: '12px', color: '#666' }}>Upload Mobile</span>
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
                                        <option value="BD">BD</option>
                                        <option value="top">Top</option>
                                        <option value="middle">Middle</option>
                                        <option value="bottom">Bottom</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Link Type</label>
                                    <select value={formData.linkType} onChange={e => setFormData({ ...formData, linkType: e.target.value, link: '' })} className="admin-select">
                                        <option value="">None</option>
                                        <option value="category">Category</option>
                                        <option value="brand">Brand</option>
                                        <option value="product">Product</option>
                                        <option value="url">Custom URL</option>
                                    </select>
                                </div>
                            </div>

                            {formData.position === 'main' && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Subposition (Main Only)</label>
                                    <select value={formData.subposition} onChange={e => setFormData({ ...formData, subposition: e.target.value })} className="admin-select">
                                        <option value="">None (Default Middle)</option>
                                        <option value="R1C1">R1C1</option>
                                        <option value="R1C2">R1C2</option>
                                        <option value="R2C1">R2C1</option>
                                        <option value="R2C2">R2C2</option>
                                        <option value="Main">Main</option>
                                    </select>
                                </div>
                            )}

                            {formData.linkType === 'category' && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Select Category</label>
                                    <select value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="admin-select">
                                        <option value="">-- Choose Category --</option>
                                        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {formData.linkType === 'brand' && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Select Brand</label>
                                    <select value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="admin-select">
                                        <option value="">-- Choose Brand --</option>
                                        {brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {formData.linkType === 'product' && (
                                <div className="admin-form-group" style={{ position: 'relative' }}>
                                    <label className="admin-label">Search Product</label>
                                    <input 
                                        type="text" 
                                        value={productKeyword} 
                                        onChange={(e) => { setProductKeyword(e.target.value); setFormData({ ...formData, link: '' }); }}
                                        placeholder="Type to search and select product..." 
                                        className="admin-input" 
                                    />
                                    {formData.link && <div style={{ fontSize: '13px', color: '#046938', marginTop: '6px', fontWeight: 'bold' }}>Selected Product Slug: {formData.link}</div>}
                                    {productResults.length > 0 && !formData.link && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '4px', zIndex: 99, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                            {productResults.map(p => (
                                                <div 
                                                    key={p.id} 
                                                    style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '14px' }}
                                                    onClick={() => {
                                                        setFormData({ ...formData, link: p.slug });
                                                        setProductKeyword(p.name);
                                                        setProductResults([]);
                                                    }}
                                                >
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {formData.linkType === 'url' && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Custom URL Link</label>
                                    <input type="text" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." className="admin-input" />
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
                        onSelect={(path) => setFormData({ ...formData, [filemanagerTarget]: path })}
                    />
                </div>
            </GenericModal>

            <ReorderModal 
                isOpen={isReorderOpen} 
                onClose={() => setReorderOpen(false)} 
                data={sliders} 
                onSave={handleReorderSave} 
                itemLabelKey="name"
                itemImageKey="image"
                getImageUrl={getAssetUrl}
            />
        </div>
    );
};

export default Slider;
