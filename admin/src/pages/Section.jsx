import React, { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import ReorderModal from '../components/common/ReorderModal';
import FileManager from '../components/common/FileManager';
import { Image, Trash2, Edit } from 'react-feather';
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
        isDeal: false, page: 'home', position: '', image: '', linkType: '', link: ''
    });

    // Multi-banner support for deals
    const [dealBanners, setDealBanners] = useState([]);
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [bannerEditIndex, setBannerEditIndex] = useState(-1);
    const [bannerFormData, setBannerFormData] = useState({
        position: 'DR1C1', image: '', linkType: '', link: ''
    });

    const [productKeyword, setProductKeyword] = useState('');
    const [bannerProductKeyword, setBannerProductKeyword] = useState('');
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
        const activeLinkType = showBannerForm ? bannerFormData.linkType : formData.linkType;
        const activeKeyword = showBannerForm ? bannerProductKeyword : productKeyword;
        
        if (activeLinkType === 'product' && activeKeyword.length > 1) {
            const timer = setTimeout(() => {
                api.get(`/products?search=${activeKeyword}`).then(res => {
                    if (res.data.status) setProductResults(res.data.products);
                });
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setProductResults([]);
        }
    }, [productKeyword, bannerProductKeyword, formData.linkType, bannerFormData.linkType, showBannerForm]);

    const openAddModal = () => {
        setFormData({
            name: '', categoryId: '', status: 'active',
            isDeal: false, page: 'home', position: '', image: '', linkType: '', link: ''
        });
        setDealBanners([]);
        setShowBannerForm(false);
        setBannerEditIndex(-1);
        setProductKeyword('');
        setBannerProductKeyword('');
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        let initialBanners = [];
        const isChallenge = row.position === 'cooking_challenge';
        const isDealOrChallenge = row.isDeal || isChallenge;
        if (isDealOrChallenge && row.image) {
            try {
                initialBanners = JSON.parse(row.image);
            } catch (e) {
                console.error("Failed to parse banners JSON", e);
            }
        }

        setFormData({
            name: row.name || '', categoryId: row.categoryId || '', status: row.status,
            isDeal: row.isDeal || false, page: row.page || 'home', position: row.position || '',
            image: row.image || '', linkType: row.linkType || '', link: row.link || ''
        });
        setDealBanners(initialBanners);
        setShowBannerForm(false);
        setBannerEditIndex(-1);
        setProductKeyword('');
        setBannerProductKeyword('');
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
            const isChallenge = formData.position === 'cooking_challenge';
            const isDealOrChallenge = formData.isDeal || isChallenge;
            const payload = {
                ...formData,
                name: formData.isDeal ? 'Deal' : formData.name,
                categoryId: isDealOrChallenge ? '' : formData.categoryId,
                image: isDealOrChallenge ? JSON.stringify(dealBanners) : formData.image
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

    // Sub-form actions for nested banner editing
    const isChallenge = formData.position === 'cooking_challenge';
    const isFrozen = formData.isDeal || isChallenge;

    const openAddBanner = () => {
        if (isChallenge) {
            setBannerFormData({
                position: `Item ${dealBanners.length + 1}`, image: '', linkType: '', link: '', description: ''
            });
        } else {
            const usedPositions = dealBanners.map(b => b.position);
            const allPositions = ['DR1C1', 'DR1C2', 'DR2C1', 'DR2Mid', 'DR2C2'];
            const firstAvailable = allPositions.find(p => !usedPositions.includes(p)) || 'DR1C1';
            
            setBannerFormData({
                position: firstAvailable, image: '', linkType: '', link: '', description: ''
            });
        }
        setBannerProductKeyword('');
        setBannerEditIndex(-1);
        setShowBannerForm(true);
    };

    const openEditBanner = (idx) => {
        const item = dealBanners[idx];
        setBannerFormData({ ...item });
        setBannerProductKeyword(item.linkType === 'product' ? item.link : '');
        setBannerEditIndex(idx);
        setShowBannerForm(true);
    };

    const handleSaveBanner = (e) => {
        e.preventDefault();
        if (!bannerFormData.image) {
            toast.error('Please upload an image/GIF for the item');
            return;
        }

        const updated = [...dealBanners];
        if (bannerEditIndex >= 0) {
            updated[bannerEditIndex] = bannerFormData;
        } else {
            // Prevent duplicate position addition for deals only
            if (!isChallenge && dealBanners.some(b => b.position === bannerFormData.position)) {
                toast.error('This banner position is already added!');
                return;
            }
            updated.push(bannerFormData);
        }
        setDealBanners(updated);
        setShowBannerForm(false);
    };

    const handleRemoveBanner = (idx) => {
        if (window.confirm('Remove this item?')) {
            setDealBanners(dealBanners.filter((_, i) => i !== idx));
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Type', 
            render: (row) => {
                if (row.isDeal) return <strong style={{ color: '#ff9900' }}>Deal Banners</strong>;
                if (row.position === 'cooking_challenge') return <strong style={{ color: '#0A6738' }}>Cooking Challenge</strong>;
                return 'Product Grid';
            }
        },
        { 
            header: 'Page / Configured Positions', 
            render: (row) => {
                const isRowChallenge = row.position === 'cooking_challenge';
                if (row.isDeal || isRowChallenge) {
                    let banners = [];
                    try { banners = JSON.parse(row.image || '[]'); } catch(e){}
                    if (isRowChallenge) return `Home Page (${banners.length} challenge items)`;
                    return `${row.page === 'deals' ? 'Deals Page' : 'Home Page'} (${banners.map(b => b.position).join(', ') || 'No banners'})`;
                }
                return 'Home Page';
            }
        },
        { 
            header: 'Name / Linked Category', 
            render: (row) => {
                const isRowChallenge = row.position === 'cooking_challenge';
                if (row.isDeal || isRowChallenge) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {(() => {
                                    let banners = [];
                                    try { banners = JSON.parse(row.image || '[]'); } catch(e){}
                                    return banners.slice(0, 5).map((b, idx) => (
                                        <img 
                                            key={idx}
                                            src={getAssetUrl(b.image)} 
                                            alt={b.position} 
                                            title={b.position} 
                                            style={{ height: '30px', width: '30px', objectFit: 'cover', border: '1px solid #eee', borderRadius: '4px' }} 
                                        />
                                    ));
                                })()}
                                {(() => {
                                    let banners = [];
                                    try { banners = JSON.parse(row.image || '[]'); } catch(e){}
                                    return banners.length > 5 && <span style={{ fontSize: '11px', alignSelf: 'center', color: '#666' }}>+{banners.length - 5} more</span>;
                                })()}
                            </div>
                            {isRowChallenge && <span style={{ fontWeight: 600, fontSize: '13px', color: '#0A6738' }}>{row.name}</span>}
                        </div>
                    );
                }
                return (row.category?.name || 'None');
            }
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
                    
                    <div style={{ margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px', marginBottom: '5px' }}>Section Type</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500, color: 'var(--text)' }}>
                                <input 
                                    type="radio" 
                                    name="sectionType" 
                                    value="grid" 
                                    checked={!formData.isDeal && formData.position !== 'cooking_challenge'} 
                                    onChange={() => setFormData({
                                        ...formData,
                                        isDeal: false,
                                        position: '',
                                        name: formData.position === 'cooking_challenge' || formData.isDeal ? '' : formData.name,
                                        categoryId: formData.categoryId
                                    })} 
                                    style={{ width: '16px', height: '16px' }}
                                />
                                Product Grid Section
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500, color: 'var(--text)' }}>
                                <input 
                                    type="radio" 
                                    name="sectionType" 
                                    value="deal" 
                                    checked={formData.isDeal} 
                                    onChange={() => setFormData({
                                        ...formData,
                                        isDeal: true,
                                        position: '',
                                        name: 'Deal',
                                        categoryId: ''
                                    })} 
                                    style={{ width: '16px', height: '16px' }}
                                />
                                Deal Banners Section
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500, color: 'var(--text)' }}>
                                <input 
                                    type="radio" 
                                    name="sectionType" 
                                    value="challenge" 
                                    checked={formData.position === 'cooking_challenge'} 
                                    onChange={() => setFormData({
                                        ...formData,
                                        isDeal: false,
                                        position: 'cooking_challenge',
                                        name: formData.name === 'Deal' ? '' : formData.name,
                                        categoryId: ''
                                    })} 
                                    style={{ width: '16px', height: '16px' }}
                                />
                                Cooking Challenge Section
                            </label>
                        </div>
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
                                placeholder={formData.position === 'cooking_challenge' ? "e.g. Participate In Our Cooking Challenges & Avail The Offer" : "Enter Name"} 
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
                        <label className="admin-label">Category {!isFrozen && <span className="required">*</span>}</label>
                        <select 
                            value={isFrozen ? '' : formData.categoryId} 
                            onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                            required={!isFrozen} 
                            disabled={isFrozen} 
                            className="admin-select"
                        >
                            <option value="">{isFrozen ? 'N/A' : 'Select'}</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    {(formData.isDeal || isChallenge) && (
                        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                            {formData.isDeal && (
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
                            )}

                            {/* Dynamic Banner Positions List */}
                            <div style={{ marginBottom: '20px', border: '1px solid var(--border)', borderRadius: '8px', padding: '15px', background: '#fcfcfc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text)', fontWeight: 600 }}>
                                        {isChallenge ? `Configured Cooking Challenge Items (${dealBanners.length})` : `Configured Banner Positions (${dealBanners.length}/5)`}
                                    </h4>
                                    {(!isChallenge ? dealBanners.length < 5 : true) && !showBannerForm && (
                                        <button type="button" onClick={openAddBanner} style={{ padding: '4px 10px', fontSize: '12px', background: '#0A6738', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                                            {isChallenge ? '+ Add Challenge Item' : '+ Add Banner Position'}
                                        </button>
                                    )}
                                </div>

                                {dealBanners.length === 0 && !showBannerForm && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                                        {isChallenge ? 'No challenge items added yet. Click "+ Add Challenge Item" to add images or GIFs.' : 'No banner positions added yet. Click "+ Add Banner Position" below to configure deal images.'}
                                    </div>
                                )}

                                {/* Banners Table List */}
                                {dealBanners.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: showBannerForm ? '20px' : '0' }}>
                                        {dealBanners.map((banner, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee', borderRadius: '6px', background: '#fff' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img src={getAssetUrl(banner.image)} alt={banner.position} style={{ width: '45px', height: '45px', objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: '4px' }} />
                                                    <div>
                                                        <strong style={{ fontSize: '13px', color: '#0A6738' }}>{banner.position}</strong>
                                                        {banner.description && (
                                                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#333', marginTop: '2px' }}>
                                                                {banner.description}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                            Link: {banner.linkType ? `${banner.linkType} (${banner.link || 'Empty'})` : 'None'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" onClick={() => openEditBanner(idx)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer' }} title="Edit"><Edit size={16} /></button>
                                                    <button type="button" onClick={() => handleRemoveBanner(idx)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#ea4335', cursor: 'pointer' }} title="Remove"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Nested Banner Configuration Card */}
                                {showBannerForm && (
                                    <div style={{ marginTop: '15px', border: '1px solid #ddd', borderRadius: '6px', padding: '15px', background: '#f5f5f5' }}>
                                        <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>
                                            {isChallenge 
                                                ? (bannerEditIndex >= 0 ? `Edit Challenge Item` : 'Add Challenge Item')
                                                : (bannerEditIndex >= 0 ? `Edit Banner: ${bannerFormData.position}` : 'Add Banner Position')
                                            }
                                        </h5>

                                        {!isChallenge && (
                                            <div className="admin-form-group" style={{ marginBottom: '15px' }}>
                                                <label className="admin-label" style={{ fontWeight: 600 }}>Position <span className="required">*</span></label>
                                                <select 
                                                    value={bannerFormData.position} 
                                                    onChange={e => setBannerFormData({ ...bannerFormData, position: e.target.value })} 
                                                    className="admin-select"
                                                    disabled={bannerEditIndex >= 0}
                                                >
                                                    <option value="DR1C1">DR1C1 (Row 1 Left)</option>
                                                    <option value="DR1C2">DR1C2 (Row 1 Right)</option>
                                                    <option value="DR2C1">DR2C1 (Row 2 Left Ad)</option>
                                                    <option value="DR2Mid">DR2Mid (Row 2 Mid Video)</option>
                                                    <option value="DR2C2">DR2C2 (Row 2 Right Ad)</option>
                                                </select>
                                            </div>
                                        )}

                                        {isChallenge && (
                                            <div className="admin-form-group" style={{ marginBottom: '15px' }}>
                                                <label className="admin-label" style={{ fontWeight: 600 }}>Description / Title (Optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={bannerFormData.description || ''} 
                                                    onChange={e => setBannerFormData({ ...bannerFormData, description: e.target.value })} 
                                                    placeholder="Enter item description or title" 
                                                    className="admin-input" 
                                                />
                                            </div>
                                        )}

                                        <div className="admin-form-group" style={{ marginBottom: '15px' }}>
                                            <label className="admin-label" style={{ fontWeight: 600 }}>Image or GIF <span className="required">*</span></label>
                                            <div 
                                                className="image-placeholder-box" 
                                                onClick={() => setFilemanagerOpen(true)}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '120px', 
                                                    border: '2px dashed #ccc', 
                                                    borderRadius: '6px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    background: '#fff'
                                                }}
                                            >
                                                {bannerFormData.image ? (
                                                    <img src={getAssetUrl(bannerFormData.image)} alt="Selected Item" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <div style={{ textAlign: 'center', color: '#aaa' }}>
                                                        <Image size={24} />
                                                        <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: 500 }}>Click to select/upload image or GIF</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="modal-row-2">
                                            <div className="admin-form-group">
                                                <label className="admin-label" style={{ fontWeight: 600 }}>Link Type</label>
                                                <select value={bannerFormData.linkType} onChange={e => setBannerFormData({ ...bannerFormData, linkType: e.target.value, link: '' })} className="admin-select">
                                                    <option value="">None</option>
                                                    <option value="category">Category</option>
                                                    <option value="brand">Brand</option>
                                                    <option value="product">Product</option>
                                                    <option value="url">Custom URL</option>
                                                </select>
                                            </div>
                                            
                                            {bannerFormData.linkType === 'url' && (
                                                <div className="admin-form-group">
                                                    <label className="admin-label" style={{ fontWeight: 600 }}>Custom URL Link</label>
                                                    <input type="text" value={bannerFormData.link} onChange={e => setBannerFormData({ ...bannerFormData, link: e.target.value })} placeholder="https://..." className="admin-input" />
                                                </div>
                                            )}

                                            {bannerFormData.linkType === 'category' && (
                                                <div className="admin-form-group">
                                                    <label className="admin-label" style={{ fontWeight: 600 }}>Select Category</label>
                                                    <select value={bannerFormData.link} onChange={e => setBannerFormData({ ...bannerFormData, link: e.target.value })} className="admin-select">
                                                        <option value="">-- Choose Category --</option>
                                                        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            {bannerFormData.linkType === 'brand' && (
                                                <div className="admin-form-group">
                                                    <label className="admin-label" style={{ fontWeight: 600 }}>Select Brand</label>
                                                    <select value={bannerFormData.link} onChange={e => setBannerFormData({ ...bannerFormData, link: e.target.value })} className="admin-select">
                                                        <option value="">-- Choose Brand --</option>
                                                        {brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {bannerFormData.linkType === 'product' && (
                                            <div className="admin-form-group" style={{ position: 'relative', marginTop: '10px' }}>
                                                <label className="admin-label" style={{ fontWeight: 600 }}>Search Product</label>
                                                <input 
                                                    type="text" 
                                                    value={bannerProductKeyword} 
                                                    onChange={(e) => { setBannerProductKeyword(e.target.value); setBannerFormData({ ...bannerFormData, link: '' }); }}
                                                    placeholder="Type to search and select product..." 
                                                    className="admin-input" 
                                                />
                                                {bannerFormData.link && <div style={{ fontSize: '12px', color: '#046938', marginTop: '5px', fontWeight: 'bold' }}>Selected Product Slug: {bannerFormData.link}</div>}
                                                {productResults.length > 0 && !bannerFormData.link && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '4px', zIndex: 99, maxHeight: '120px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                                        {productResults.map(p => (
                                                            <div 
                                                                key={p.id} 
                                                                style={{ padding: '6px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '12px' }}
                                                                onClick={() => {
                                                                    setBannerFormData({ ...bannerFormData, link: p.slug });
                                                                    setBannerProductKeyword(p.name);
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

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '15px' }}>
                                            <button type="button" onClick={handleSaveBanner} style={{ padding: '4px 12px', fontSize: '12px', background: '#0A6738', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Save Banner</button>
                                            <button type="button" onClick={() => setShowBannerForm(false)} style={{ padding: '4px 12px', fontSize: '12px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button type="submit" disabled={showBannerForm} className="btn-modal-submit" style={{ opacity: showBannerForm ? 0.6 : 1 }}>Submit</button>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                    </div>
                </form>
            </GenericModal>

            <GenericModal isOpen={isFilemanagerOpen} title="File Manager" onClose={() => setFilemanagerOpen(false)}>
                <div style={{ height: '400px' }}>
                    <FileManager
                        onClose={() => setFilemanagerOpen(false)}
                        onSelect={(path) => {
                            if (showBannerForm) {
                                setBannerFormData({ ...bannerFormData, image: path });
                            } else {
                                setFormData({ ...formData, image: path });
                            }
                        }}
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
