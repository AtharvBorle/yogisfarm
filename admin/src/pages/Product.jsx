import React, { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import FileManager from '../components/common/FileManager';
import toast from 'react-hot-toast';

import { Image, X } from 'react-feather';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFilemanagerOpen, setFilemanagerOpen] = useState(false);
    const [isGalleryFMOpen, setGalleryFMOpen] = useState(false);
    const [isViewOpen, setViewOpen] = useState(false);
    const [viewProduct, setViewProduct] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const defaultForm = {
        name: '', shortDescription: '', description: '', parentCategoryId: '', categoryId: '', brandId: '',
        price: '', salePrice: '', image: '', video: '', tags: '', stock: '0', unit: '',
        status: 'active', featured: false, popular: false, deal: false,
        variants: [], benefits: [], features: [], galleryImages: []
    };
    const [formData, setFormData] = useState({ ...defaultForm });

    const fetchAll = async () => {
        try {
            const [pRes, cRes, bRes, tRes] = await Promise.all([
                api.get('/products'), api.get('/categories'), api.get('/brands'), api.get('/taxes')
            ]);
            if (pRes.data.status) setProducts(pRes.data.products);
            if (cRes.data.status) setCategories(cRes.data.categories);
            if (bRes.data.status) setBrands(bRes.data.brands);
            if (tRes.data.status) setTaxes(tRes.data.taxes);
        } catch (err) {
            toast.error('Failed to load data');
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const openAddModal = () => {
        setFormData({ ...defaultForm, variants: [], benefits: [], features: [], galleryImages: [] });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        let parentCatId = '';
        if (row.categoryId) {
            const cat = categories.find(c => c.id === row.categoryId);
            if (cat && cat.parentId) parentCatId = cat.parentId;
            else parentCatId = row.categoryId || '';
        }

        setFormData({
            name: row.name, shortDescription: row.shortDescription || '', description: row.description || '',
            parentCategoryId: parentCatId, categoryId: row.categoryId || '', brandId: row.brandId || '',
            price: row.price || '', salePrice: row.salePrice || '', image: row.image || '',
            video: row.video || '', tags: row.tags || '', stock: row.stock || 0, unit: row.unit || '',
            status: row.status, featured: row.featured, popular: row.popular, deal: row.deal,
            variants: row.variants || [], benefits: row.benefits || [], features: row.features || [],
            galleryImages: (row.images || []).map(img => img.image)
        });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const openViewModal = (row) => {
        setViewProduct(row);
        setViewOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Delete product "${row.name}"?`)) return;
        try {
            const res = await api.delete(`/products/${row.id}`);
            if (res.data.status) { toast.success('Product deleted'); fetchAll(); }
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleToggle = async (id, field) => {
        try {
            const res = await api.patch(`/products/${id}/toggle`, { field });
            if (res.data.status) { toast.success(res.data.message); fetchAll(); }
        } catch (err) { toast.error('Toggle failed'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name, shortDescription: formData.shortDescription,
                description: formData.description, image: formData.image,
                categoryId: formData.categoryId || null, brandId: formData.brandId || null,
                price: formData.price, salePrice: formData.salePrice || null,
                video: formData.video, tags: formData.tags, stock: formData.stock, unit: formData.unit,
                status: formData.status, featured: formData.featured.toString(),
                popular: formData.popular.toString(), deal: formData.deal.toString()
            };

            // For new and edited products, include variants/benefits/features as JSON string
            if (formData.variants.length > 0) {
                payload.variants = JSON.stringify(formData.variants.map(v => ({
                    name: v.name, price: parseFloat(v.price || 0),
                    salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
                    stock: parseInt(v.stock || 0)
                })));
            } else { payload.variants = "[]"; }
            if (formData.benefits.length > 0) {
                payload.benefits = JSON.stringify(formData.benefits.map(b => ({
                    title: b.title, description: b.description
                })));
            } else { payload.benefits = "[]"; }
            if (formData.features.length > 0) {
                payload.features = JSON.stringify(formData.features.map(f => ({
                    feature: f.feature, description: f.description
                })));
            } else { payload.features = "[]"; }

            let res;
            if (editingId) res = await api.put(`/products/${editingId}`, payload);
            else res = await api.post('/products', payload);

            if (res.data.status) {
                // Sync gallery images
                const productId = editingId || res.data.product?.id;
                if (productId) {
                    await api.post(`/products/${productId}/images`, {
                        images: formData.galleryImages
                    });
                }
                toast.success(`Product ${editingId ? 'updated' : 'created'}`);
                setModalOpen(false);
                fetchAll();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) { toast.error('Submit failed: ' + (err.response?.data?.message || err.message)); }
    };

    // Variant helpers
    const addVariant = () => setFormData({ ...formData, variants: [...formData.variants, { name: '', price: '', salePrice: '', stock: '0' }] });
    const updateVariant = (idx, field, val) => {
        const v = [...formData.variants]; v[idx] = { ...v[idx], [field]: val };
        setFormData({ ...formData, variants: v });
    };
    const removeVariant = (idx) => setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== idx) });

    // Benefit helpers
    const addBenefit = () => setFormData({ ...formData, benefits: [...formData.benefits, { title: '', description: '' }] });
    const updateBenefit = (idx, field, val) => {
        const b = [...formData.benefits]; b[idx] = { ...b[idx], [field]: val };
        setFormData({ ...formData, benefits: b });
    };
    const removeBenefit = (idx) => setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== idx) });

    // Feature helpers
    const addFeature = () => setFormData({ ...formData, features: [...formData.features, { feature: '', description: '' }] });
    const updateFeature = (idx, field, val) => {
        const f = [...formData.features]; f[idx] = { ...f[idx], [field]: val };
        setFormData({ ...formData, features: f });
    };
    const removeFeature = (idx) => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });

    // Gallery image helpers
    const addGalleryImage = (path) => {
        setFormData({ ...formData, galleryImages: [...formData.galleryImages, path] });
    };
    const removeGalleryImage = (idx) => {
        setFormData({ ...formData, galleryImages: formData.galleryImages.filter((_, i) => i !== idx) });
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'Image',
            render: (row) => row.image ? <img src={getAssetUrl(row.image)} alt="" style={{ height: '40px', objectFit: 'contain' }} /> : 'N/A'
        },
        { header: 'Name', render: (row) => <span style={{ fontWeight: '500' }}>{row.name}</span> },
        { header: 'Category', render: (row) => row.category?.name || '—' },
        { header: 'Price', render: (row) => `₹${row.price}` },
        { header: 'Stock', render: (row) => row.stock },
        {
            header: 'Flags',
            render: (row) => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleToggle(row.id, 'featured')}
                        style={{ padding: '2px 6px', fontSize: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: row.featured ? '#3BB77E' : '#e0e0e0', color: row.featured ? '#fff' : '#666' }}>
                        Featured
                    </button>
                    <button onClick={() => handleToggle(row.id, 'popular')}
                        style={{ padding: '2px 6px', fontSize: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: row.popular ? '#17a2b8' : '#e0e0e0', color: row.popular ? '#fff' : '#666' }}>
                        Popular
                    </button>
                    <button onClick={() => handleToggle(row.id, 'deal')}
                        style={{ padding: '2px 6px', fontSize: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: row.deal ? '#ffc107' : '#e0e0e0', color: row.deal ? '#fff' : '#666' }}>
                        Deal
                    </button>
                </div>
            )
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

    const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500' };
    const sectionTitle = { fontSize: '16px', fontWeight: '600', color: '#333', margin: '10px 0 10px 0', paddingBottom: '5px', borderBottom: '1px solid #eee' };
    const miniBtn = { padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Product Management</h2>
                <button onClick={openAddModal} className="btn-add-new">+ Add New</button>
            </div>

            <DataTable columns={columns} data={products} onEdit={openEditModal} onDelete={handleDelete} onView={openViewModal} />

            {/* ─── ADD / EDIT Modal ─── */}
            <GenericModal isOpen={isModalOpen} title={editingId ? "Update Product" : "Add Product"} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="modal-form-grid">
                        {/* LEFT COLUMN: Images */}
                        <div className="modal-image-col">
                            <div className="admin-form-group">
                                <label className="admin-label">Product Image <span className="required">*</span></label>
                                <div className="image-placeholder-box" onClick={() => setFilemanagerOpen(true)}>
                                    {formData.image ? <img src={getAssetUrl(formData.image)} alt="Selected" /> : <div style={{ fontSize: '48px', color: '#ccc' }}><Image size={48} /></div>}
                                </div>
                            </div>

                            <div style={sectionTitle}>Gallery Images</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {formData.galleryImages.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <img src={getAssetUrl(img)} style={{ height: '60px', width: '60px', objectFit: 'cover', border: '1px solid var(--border)', borderRadius: '4px' }} />
                                        <button type="button" onClick={() => removeGalleryImage(idx)}
                                            style={{ position: 'absolute', top: -6, right: -6, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px' }}>X</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => setGalleryFMOpen(true)} className="btn-modal-close" style={{ width: '100%' }}>
                                + Add Gallery Image
                            </button>
                        </div>

                        {/* RIGHT COLUMN: Product Inputs */}
                        <div className="modal-inputs-col">
                            <div className="modal-row-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Name <span className="required">*</span></label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="admin-input" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Short Description</label>
                                    <input type="text" value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} className="admin-input" maxLength={500} />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-input" style={{ minHeight: '80px' }} />
                            </div>

                            <div className="modal-row-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Category</label>
                                    <select 
                                        value={formData.parentCategoryId} 
                                        onChange={e => {
                                            const newParentId = e.target.value;
                                            setFormData({ ...formData, parentCategoryId: newParentId, categoryId: newParentId });
                                        }} 
                                        className="admin-select"
                                    >
                                        <option value="">-- Select --</option>
                                        {categories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                {formData.parentCategoryId && categories.some(c => c.parentId === Number(formData.parentCategoryId)) && (
                                    <div className="admin-form-group">
                                        <label className="admin-label">Sub Category</label>
                                        <select 
                                            value={formData.categoryId !== formData.parentCategoryId ? formData.categoryId : ''} 
                                            onChange={e => {
                                                const newChildId = e.target.value;
                                                // If 'All' is selected, fallback to parent id
                                                setFormData({ ...formData, categoryId: newChildId ? newChildId : formData.parentCategoryId });
                                            }} 
                                            className="admin-select"
                                        >
                                            <option value="">-- All --</option>
                                            {categories.filter(c => c.parentId === Number(formData.parentCategoryId)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="admin-form-group">
                                    <label className="admin-label">Brand</label>
                                    <select value={formData.brandId} onChange={e => setFormData({ ...formData, brandId: e.target.value })} className="admin-select">
                                        <option value="">-- Select --</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-row-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                <div className="admin-form-group">
                                    <label className="admin-label">Price <span className="required">*</span></label>
                                    <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="admin-input" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Sale Price</label>
                                    <input type="number" step="0.01" min="0" value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} className="admin-input" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Stock</label>
                                    <input type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="admin-input" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Unit</label>
                                    <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="admin-input" placeholder="e.g. 1kg" />
                                </div>
                            </div>

                            <div className="modal-row-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Tags</label>
                                    <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="admin-input" placeholder="comma separated" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Video URL</label>
                                    <input type="text" value={formData.video} onChange={e => setFormData({ ...formData, video: e.target.value })} className="admin-input" />
                                </div>
                            </div>

                            {/* Flags */}
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
                                <label style={{ display: 'flex', gap: '5px', alignItems: 'center', cursor: 'pointer', color: 'var(--text)' }}>
                                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} /> Featured
                                </label>
                                <label style={{ display: 'flex', gap: '5px', alignItems: 'center', cursor: 'pointer', color: 'var(--text)' }}>
                                    <input type="checkbox" checked={formData.popular} onChange={e => setFormData({ ...formData, popular: e.target.checked })} /> Popular
                                </label>
                                <label style={{ display: 'flex', gap: '5px', alignItems: 'center', cursor: 'pointer', color: 'var(--text)' }}>
                                    <input type="checkbox" checked={formData.deal} onChange={e => setFormData({ ...formData, deal: e.target.checked })} /> Today's Deal
                                </label>
                                <div style={{ marginLeft: 'auto' }}>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="admin-select" style={{ width: '120px' }}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Lists Area (Variants, Benefits, Features) */}
                            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                                <div style={sectionTitle}>Variants</div>
                                {formData.variants.map((v, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                        <input placeholder="Name" value={v.name} onChange={e => updateVariant(idx, 'name', e.target.value)} className="admin-input" style={{ flex: 2 }} />
                                        <input placeholder="Price" type="number" step="0.01" min="0" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} className="admin-input" style={{ flex: 1 }} />
                                        <input placeholder="Sale Price" type="number" step="0.01" min="0" value={v.salePrice} onChange={e => updateVariant(idx, 'salePrice', e.target.value)} className="admin-input" style={{ flex: 1 }} />
                                        <input placeholder="Stock" type="number" min="0" value={v.stock} onChange={e => updateVariant(idx, 'stock', e.target.value)} className="admin-input" style={{ flex: 1 }} />
                                        <button type="button" onClick={() => removeVariant(idx)} style={{ ...miniBtn, background: '#dc3545', color: '#fff' }}><X size={18} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addVariant} className="btn-modal-close" style={{ padding: '4px 10px' }}>+ Add Variant</button>

                                <div style={sectionTitle}>Benefits</div>
                                {formData.benefits.map((b, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                        <input placeholder="Title" value={b.title} onChange={e => updateBenefit(idx, 'title', e.target.value)} className="admin-input" style={{ flex: 1 }} />
                                        <input placeholder="Description" value={b.description} onChange={e => updateBenefit(idx, 'description', e.target.value)} className="admin-input" style={{ flex: 2 }} />
                                        <button type="button" onClick={() => removeBenefit(idx)} style={{ ...miniBtn, background: '#dc3545', color: '#fff' }}><X size={18} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addBenefit} className="btn-modal-close" style={{ padding: '4px 10px' }}>+ Add Benefit</button>

                                <div style={sectionTitle}>Features</div>
                                {formData.features.map((f, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                        <input placeholder="Feature" value={f.feature} onChange={e => updateFeature(idx, 'feature', e.target.value)} className="admin-input" style={{ flex: 1 }} />
                                        <input placeholder="Description" value={f.description} onChange={e => updateFeature(idx, 'description', e.target.value)} className="admin-input" style={{ flex: 2 }} />
                                        <button type="button" onClick={() => removeFeature(idx)} style={{ ...miniBtn, background: '#dc3545', color: '#fff' }}><X size={18} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addFeature} className="btn-modal-close" style={{ padding: '4px 10px' }}>+ Add Feature</button>
                            </div>

                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" className="btn-modal-submit">{editingId ? 'Update Product' : 'Create Product'}</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>

            {/* ─── VIEW Modal ─── */}
            <GenericModal isOpen={isViewOpen} title={viewProduct?.name || 'Product Details'} onClose={() => setViewOpen(false)}>
                {viewProduct && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {viewProduct.image && <img src={getAssetUrl(viewProduct.image)} style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }} />}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {[
                                    ['Name', viewProduct.name],
                                    ['Category', viewProduct.category?.name || '—'],
                                    ['Brand', viewProduct.brand?.name || '—'],
                                    ['Price', `₹${viewProduct.price}`],
                                    ['Sale Price', viewProduct.salePrice ? `₹${viewProduct.salePrice}` : '—'],
                                    ['Stock', viewProduct.stock],
                                    ['Unit', viewProduct.unit || '—'],
                                    ['Status', viewProduct.status],
                                    ['Featured', viewProduct.featured ? 'Yes' : 'No'],
                                    ['Popular', viewProduct.popular ? 'Yes' : 'No'],
                                    ['Deal', viewProduct.deal ? 'Yes' : 'No'],
                                    ['Tags', viewProduct.tags || '—'],
                                ].map(([label, val]) => (
                                    <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '8px', fontWeight: '600', color: 'var(--text-muted, #888)', width: '130px' }}>{label}</td>
                                        <td style={{ padding: '8px', color: 'var(--text)' }}>{val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {viewProduct.shortDescription && <div><strong>Short Description:</strong><p>{viewProduct.shortDescription}</p></div>}
                        {viewProduct.description && <div><strong>Description:</strong><p style={{ whiteSpace: 'pre-wrap' }}>{viewProduct.description}</p></div>}
                        {viewProduct.variants?.length > 0 && (
                            <div>
                                <strong>Variants:</strong>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px' }}>
                                    <thead><tr style={{ background: 'var(--sidebar-hover)', color: 'var(--text)' }}>
                                        <th style={{ padding: '6px', textAlign: 'left' }}>Name</th>
                                        <th style={{ padding: '6px', textAlign: 'left' }}>Price</th>
                                        <th style={{ padding: '6px', textAlign: 'left' }}>Sale Price</th>
                                        <th style={{ padding: '6px', textAlign: 'left' }}>Stock</th>
                                    </tr></thead>
                                    <tbody style={{ color: 'var(--text)' }}>{viewProduct.variants.map(v => (
                                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '6px' }}>{v.name}</td>
                                            <td style={{ padding: '6px' }}>₹{v.price}</td>
                                            <td style={{ padding: '6px' }}>{v.salePrice ? `₹${v.salePrice}` : '—'}</td>
                                            <td style={{ padding: '6px' }}>{v.stock}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        )}
                        {viewProduct.images?.length > 0 && (
                            <div>
                                <strong>Gallery:</strong>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {viewProduct.images.map(img => <img key={img.id} src={getAssetUrl(img.image)} style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </GenericModal>

            {/* Main image Filemanager */}
            <GenericModal isOpen={isFilemanagerOpen} title="Select Product Image" onClose={() => setFilemanagerOpen(false)}>
                <div style={{ height: '400px' }}>
                    <FileManager onClose={() => setFilemanagerOpen(false)} onSelect={(path) => setFormData({ ...formData, image: path })} />
                </div>
            </GenericModal>

            {/* Gallery Filemanager */}
            <GenericModal isOpen={isGalleryFMOpen} title="Select Gallery Image" onClose={() => setGalleryFMOpen(false)}>
                <div style={{ height: '400px' }}>
                    <FileManager onClose={() => setGalleryFMOpen(false)} onSelect={(path) => { addGalleryImage(path); setGalleryFMOpen(false); }} />
                </div>
            </GenericModal>
        </div>
    );
};

export default Product;
