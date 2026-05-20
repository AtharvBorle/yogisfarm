import React, { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import ReorderModal from '../components/common/ReorderModal';
import FileManager from '../components/common/FileManager';
import { Image } from 'react-feather';
import toast from 'react-hot-toast';

const Section = () => {
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFilemanagerOpen, setFilemanagerOpen] = useState(false);
    const [isReorderOpen, setReorderOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '', categoryId: '', status: 'active',
        isDeal: false, page: 'home', position: 'DR1C1', image: '', linkType: '', link: ''
    });

    const [productKeyword, setProductKeyword] = useState('');
    const [productResults, setProductResults] = useState([]);

    const fetchData = async () => {
        try {
            const [secRes, catRes, brandRes] = await Promise.all([
                api.get('/sections'),
                api.get('/categories'),
                api.get('/brands')
            ]);
            if (secRes.data.status) setSections(secRes.data.sections);
            if (catRes.data.status) setCategories(catRes.data.categories);
            if (brandRes.data.status) setBrands(brandRes.data.brands);
        } catch (error) {
            toast.error('Failed to load sections data');
        }
    };

    useEffect(() => { fetchData(); }, []);

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
        setFormData({
            name: '', categoryId: '', status: 'active',
            isDeal: false, page: 'home', position: 'DR1C1', image: '', linkType: '', link: ''
        });
        setProductKeyword('');
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({
            name: row.name || '', categoryId: row.categoryId || '', status: row.status,
            isDeal: row.isDeal || false, page: row.page || 'home', position: row.position || 'DR1C1',
            image: row.image || '', linkType: row.linkType || '', link: row.link || ''
        });
        setProductKeyword('');
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
            const payload = {
                ...formData,
                name: formData.isDeal ? 'Deal' : formData.name,
                categoryId: formData.isDeal ? '' : formData.categoryId
            };

            if (editingId) res = await api.put(`/sections/${editingId}`, payload);
            else res = await api.post('/sections', payload);
            
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
        { 
            header: 'Type', 
            render: (row) => row.isDeal ? <strong style={{ color: '#ff9900' }}>Deal Banner</strong> : 'Product Grid' 
        },
        { 
            header: 'Page / Position', 
            render: (row) => row.isDeal ? `${row.page === 'deals' ? 'Deals' : 'Home'} (${row.position})` : 'Home Page'
        },
        { 
            header: 'Name / Linked Category', 
            render: (row) => row.isDeal ? (
                row.image ? <img src={getAssetUrl(row.image)} alt="Deal Banner" style={{ height: '40px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }} /> : 'No Image'
            ) : (row.category?.name || 'None')
        },
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
                    
                    <div style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                            type="checkbox" 
                            id="isDealCheckbox"
                            checked={formData.isDeal} 
                            onChange={e => setFormData({ 
                                ...formData, 
                                isDeal: e.target.checked,
                                name: e.target.checked ? 'Deal' : '',
                                categoryId: e.target.checked ? '' : formData.categoryId
                            })} 
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isDealCheckbox" style={{ fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontSize: '15px' }}>Deal Banner Section</label>
                    </div>

                    <div className="modal-row-2">
                        <div className="admin-form-group">
                            <label className="admin-label">Name <span className="required">*</span></label>
                            <input 
                                type="text" 
                                value={formData.isDeal ? 'Deal' : formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required={!formData.isDeal} 
                                disabled={formData.isDeal} 
                                className="admin-input" 
                                placeholder="Enter Name" 
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Status <span className="required">*</span></label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="admin-select">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                        <label className="admin-label">Category {!formData.isDeal && <span className="required">*</span>}</label>
                        <select 
                            value={formData.isDeal ? '' : formData.categoryId} 
                            onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                            required={!formData.isDeal} 
                            disabled={formData.isDeal} 
                            className="admin-select"
                        >
                            <option value="">Select</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    {formData.isDeal && (
                        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                            <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                                <label className="admin-label" style={{ fontWeight: 600 }}>Target Page <span className="required">*</span></label>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}>
                                        <input 
                                            type="radio" 
                                            name="dealPage" 
                                            value="home" 
                                            checked={formData.page === 'home'} 
                                            onChange={e => setFormData({ ...formData, page: e.target.value })} 
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        Home Page
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}>
                                        <input 
                                            type="radio" 
                                            name="dealPage" 
                                            value="deals" 
                                            checked={formData.page === 'deals'} 
                                            onChange={e => setFormData({ ...formData, page: e.target.value })} 
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        Deals Page (/deals)
                                    </label>
                                </div>
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                                <label className="admin-label" style={{ fontWeight: 600 }}>Position <span className="required">*</span></label>
                                <select 
                                    value={formData.position} 
                                    onChange={e => setFormData({ ...formData, position: e.target.value })} 
                                    className="admin-select"
                                >
                                    <option value="DR1C1">DR1C1 (Row 1 Left)</option>
                                    <option value="DR1C2">DR1C2 (Row 1 Right)</option>
                                    <option value="DR2C1">DR2C1 (Row 2 Left Ad)</option>
                                    <option value="DR2Mid">DR2Mid (Row 2 Mid Video)</option>
                                    <option value="DR2C2">DR2C2 (Row 2 Right Ad)</option>
                                </select>
                            </div>

                            <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                                <label className="admin-label" style={{ fontWeight: 600 }}>Image (Accepts GIFs) <span className="required">*</span></label>
                                <div 
                                    className="image-placeholder-box" 
                                    onClick={() => setFilemanagerOpen(true)}
                                    style={{ 
                                        width: '100%', 
                                        height: '150px', 
                                        border: '2px dashed var(--border)', 
                                        borderRadius: '8px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        background: '#f9f9f9'
                                    }}
                                >
                                    {formData.image ? (
                                        <img src={getAssetUrl(formData.image)} alt="Selected Deal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#aaa' }}>
                                            <Image size={32} />
                                            <div style={{ fontSize: '13px', marginTop: '5px', fontWeight: 500 }}>Click to select/upload image or GIF</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-row-2">
                                <div className="admin-form-group">
                                    <label className="admin-label" style={{ fontWeight: 600 }}>Link Type</label>
                                    <select value={formData.linkType} onChange={e => setFormData({ ...formData, linkType: e.target.value, link: '' })} className="admin-select">
                                        <option value="">None</option>
                                        <option value="category">Category</option>
                                        <option value="brand">Brand</option>
                                        <option value="product">Product</option>
                                        <option value="url">Custom URL</option>
                                    </select>
                                </div>
                                
                                {formData.linkType === 'url' && (
                                    <div className="admin-form-group">
                                        <label className="admin-label" style={{ fontWeight: 600 }}>Custom URL Link</label>
                                        <input type="text" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." className="admin-input" />
                                    </div>
                                )}

                                {formData.linkType === 'category' && (
                                    <div className="admin-form-group">
                                        <label className="admin-label" style={{ fontWeight: 600 }}>Select Category</label>
                                        <select value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="admin-select">
                                            <option value="">-- Choose Category --</option>
                                            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {formData.linkType === 'brand' && (
                                    <div className="admin-form-group">
                                        <label className="admin-label" style={{ fontWeight: 600 }}>Select Brand</label>
                                        <select value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="admin-select">
                                            <option value="">-- Choose Brand --</option>
                                            {brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {formData.linkType === 'product' && (
                                <div className="admin-form-group" style={{ position: 'relative', marginTop: '10px' }}>
                                    <label className="admin-label" style={{ fontWeight: 600 }}>Search Product</label>
                                    <input 
                                        type="text" 
                                        value={productKeyword} 
                                        onChange={(e) => { setProductKeyword(e.target.value); setFormData({ ...formData, link: '' }); }}
                                        placeholder="Type to search and select product..." 
                                        className="admin-input" 
                                    />
                                    {formData.link && <div style={{ fontSize: '13px', color: '#046938', marginTop: '6px', fontWeight: 'bold' }}>Selected Product Slug: {formData.link}</div>}
                                    {productResults.length > 0 && !formData.link && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '4px', zIndex: 99, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                            {productResults.map(p => (
                                                <div 
                                                    key={p.id} 
                                                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px' }}
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
                        </div>
                    )}
                    
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

            <ReorderModal 
                isOpen={isReorderOpen} 
                onClose={() => setReorderOpen(false)} 
                data={sections.filter(s => !s.isDeal)} 
                onSave={handleReorderSave} 
                itemLabelKey="name" 
            />
        </div>
    );
};

export default Section;
