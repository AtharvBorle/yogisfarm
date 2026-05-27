import React, { useState, useEffect } from 'react';
import api from '../api';
import DataTable from '../components/common/DataTable';
import GenericModal from '../components/common/GenericModal';
import toast from 'react-hot-toast';

const MultiSelect = ({ label, options, selectedIds, onChange }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedArray = selectedIds 
        ? selectedIds.split(',').map(id => parseInt(id.trim())).filter(Boolean)
        : [];
        
    const toggleOption = (id) => {
        let updated;
        if (selectedArray.includes(id)) {
            updated = selectedArray.filter(x => x !== id);
        } else {
            updated = [...selectedArray, id];
        }
        onChange(updated.join(','));
    };

    const filteredOptions = options.filter(opt => 
        (opt.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-form-group" style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <label className="admin-label">{label}</label>
            <div 
                style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '6px', 
                    padding: '6px 12px', 
                    background: 'white', 
                    cursor: 'pointer',
                    minHeight: '38px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px',
                    alignItems: 'center'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedArray.length === 0 ? (
                    <span style={{ color: '#888', fontSize: '13px' }}>Select...</span>
                ) : (
                    selectedArray.map(id => {
                        const opt = options.find(o => o.id === id);
                        return (
                            <span 
                                key={id} 
                                style={{ 
                                    background: '#e8f0fe', 
                                    color: '#1a73e8', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: '500'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(id);
                                }}
                            >
                                {opt ? opt.name : id}
                                <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>&times;</span>
                            </span>
                        );
                    })
                )}
            </div>
            
            {isOpen && (
                <>
                    <div 
                        style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 998 }} 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                    />
                    <div 
                        style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0, 
                            right: 0, 
                            background: 'white', 
                            border: '1px solid #ccc', 
                            borderRadius: '6px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                            zIndex: 999, 
                            marginTop: '5px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}
                    >
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            onClick={e => e.stopPropagation()}
                            style={{ 
                                width: '100%', 
                                border: 'none', 
                                borderBottom: '1px solid #eee', 
                                padding: '8px 12px', 
                                outline: 'none',
                                fontSize: '13px',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ padding: '5px 0' }}>
                            {filteredOptions.length === 0 ? (
                                <div style={{ padding: '8px 12px', color: '#888', fontSize: '13px' }}>No options found</div>
                            ) : (
                                filteredOptions.map(opt => {
                                    const isChecked = selectedArray.includes(opt.id);
                                    return (
                                        <div 
                                            key={opt.id} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOption(opt.id);
                                            }}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                padding: '8px 12px', 
                                                cursor: 'pointer',
                                                background: isChecked ? '#f5f5f5' : 'transparent',
                                                fontSize: '13px'
                                            }}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked} 
                                                readOnly 
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span>{opt.name}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const Coupon = () => {
    const [coupons, setCoupons] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Dependencies lists
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({ 
        name: '', code: '', status: 'active', amountType: 'percent', 
        amount: 0, minOrderAmount: 0, maxDiscount: '', usageLimit: '', description: '', startOn: '', expireOn: '',
        firstOrdersLimit: '', userLimit: '', buyProductIds: '', buyCategoryIds: '', buyBrandIds: '',
        isBogo: false, buyQuantity: 1, getQuantity: 1, getProductIds: '', getCategoryIds: '', getBrandIds: ''
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            if (res.data.status) {
                setCoupons(res.data.coupons);
            }
        } catch (error) {
            toast.error('Failed to load coupons');
        }
    };

    const fetchDependencies = async () => {
        try {
            const [catRes, brandRes, prodRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands'),
                api.get('/products')
            ]);
            if (catRes.data.status) setCategories(catRes.data.categories);
            if (brandRes.data.status) setBrands(brandRes.data.brands);
            if (prodRes.data.status) setProducts(prodRes.data.products);
        } catch (error) {
            console.error('Failed to load dependencies:', error);
        }
    };

    useEffect(() => {
        fetchCoupons();
        fetchDependencies();
    }, []);

    const generateCode = () => {
        const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) code += text.charAt(Math.floor(Math.random() * text.length));
        setFormData({ ...formData, code });
    };

    const toLocalDatetimeString = (dateVal) => {
        if (!dateVal) return '';
        const date = new Date(dateVal);
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    const openAddModal = () => {
        setFormData({ 
            name: '', code: '', status: 'active', amountType: 'percent', 
            amount: 0, minOrderAmount: 0, maxDiscount: '', usageLimit: '', description: '', startOn: '', expireOn: '',
            firstOrdersLimit: '', userLimit: '', buyProductIds: '', buyCategoryIds: '', buyBrandIds: '',
            isBogo: false, buyQuantity: 1, getQuantity: 1, getProductIds: '', getCategoryIds: '', getBrandIds: ''
        });
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setFormData({ 
            name: row.name, code: row.code, status: row.status, 
            amountType: row.amountType, amount: row.amount, 
            minOrderAmount: row.minOrderAmount, 
            maxDiscount: row.maxDiscount || '', usageLimit: row.usageLimit || '',
            description: row.description || '', 
            startOn: toLocalDatetimeString(row.startOn),
            expireOn: toLocalDatetimeString(row.expireOn),
            firstOrdersLimit: row.firstOrdersLimit || '',
            userLimit: row.userLimit || '',
            buyProductIds: row.buyProductIds || '',
            buyCategoryIds: row.buyCategoryIds || '',
            buyBrandIds: row.buyBrandIds || '',
            isBogo: row.isBogo || false,
            buyQuantity: row.buyQuantity || 1,
            getQuantity: row.getQuantity || 1,
            getProductIds: row.getProductIds || '',
            getCategoryIds: row.getCategoryIds || '',
            getBrandIds: row.getBrandIds || ''
        });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await api.delete(`/coupons/${row.id}`);
            if (res.data.status) {
                toast.success('Coupon deleted successfully');
                fetchCoupons();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) {
                res = await api.put(`/coupons/${editingId}`, formData);
            } else {
                res = await api.post('/coupons', formData);
            }
            
            if (res.data.status) {
                toast.success(`Coupon ${editingId ? 'updated' : 'added'} successfully`);
                setModalOpen(false);
                fetchCoupons();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(`Failed to ${editingId ? 'update' : 'add'} coupon`);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Code', render: (row) => <strong>{row.code}</strong> },
        { header: 'Type', render: (row) => (
            <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                background: row.isBogo ? '#e6f4ea' : (row.amountType === 'percent' ? '#e8f0fe' : '#fef7e0'),
                color: row.isBogo ? '#137333' : (row.amountType === 'percent' ? '#1967d2' : '#e37400') }}>
                {row.isBogo ? `BOGO (${row.buyQuantity} Get ${row.getQuantity})` : (row.amountType === 'percent' ? 'Percent' : 'Flat')}
            </span>
        )},
        { header: 'Value', render: (row) => (
            <span style={{ fontWeight: '600' }}>
                {row.isBogo ? 'Free Item(s)' : (row.amountType === 'percent' ? `${row.amount}%` : `₹${row.amount}`)}
                {!row.isBogo && row.amountType === 'percent' && row.maxDiscount ? <span style={{ display: 'block', fontSize: '11px', color: '#888' }}>Max ₹{row.maxDiscount}</span> : null}
            </span>
        )},
        { header: 'Min Order', render: (row) => `₹${row.minOrderAmount}` },
        { header: 'Usage', render: (row) => (
            <span>{row.usedCount || 0}{row.usageLimit ? ` / ${row.usageLimit}` : ' / ∞'}</span>
        )},
        { header: 'Start Date', render: (row) => row.startOn ? new Date(row.startOn).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Immediate' },
        { header: 'Expiry Date', render: (row) => row.expireOn ? new Date(row.expireOn).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Never' },
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
                <h2>Coupon Management</h2>
                <button onClick={openAddModal} className="btn-add-new">
                    + Add New
                </button>
            </div>
            
            <DataTable 
                columns={columns} 
                data={coupons} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
            />

            <GenericModal 
                isOpen={isModalOpen} 
                title={editingId ? "Update Coupon" : "Add New Coupon"} 
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-label">Coupon Name *</label>
                            <input 
                                type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                                required className="admin-input"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Coupon Code *</label>
                            <div style={{ display: 'flex' }}>
                                <input 
                                    type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                                    required className="admin-input" style={{ borderRadius: '6px 0 0 6px' }}
                                />
                                <button type="button" onClick={generateCode} style={{ background: '#1a6e3a', color: 'white', border: 'none', padding: '0 15px', borderRadius: '0 6px 6px 0', cursor: 'pointer' }}>Generate</button>
                            </div>
                        </div>
                    </div>
                    
                    {!formData.isBogo && (
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-label">Discount Type *</label>
                                <select value={formData.amountType} onChange={e => setFormData({...formData, amountType: e.target.value, maxDiscount: e.target.value === 'amount' ? '' : formData.maxDiscount})} className="admin-select">
                                    <option value="percent">Percent (%)</option>
                                    <option value="amount">Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">{formData.amountType === 'percent' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}</label>
                                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} required className="admin-input" />
                            </div>
                        </div>
                    )}

                    <div className="admin-form-row">
                        {!formData.isBogo && formData.amountType === 'percent' && (
                            <div className="admin-form-group">
                                <label className="admin-label">Max Discount Cap (₹) <span style={{ fontSize: '11px', color: '#888' }}>— limits percent discount</span></label>
                                <input type="number" step="0.01" min="0" placeholder="e.g. 100" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} className="admin-input" />
                            </div>
                        )}
                        <div className="admin-form-group">
                            <label className="admin-label">Min Order Amount (₹)</label>
                            <input type="number" step="0.01" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: parseFloat(e.target.value) || 0})} className="admin-input" />
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-label">Usage Limit <span style={{ fontSize: '11px', color: '#888' }}>— leave empty for unlimited</span></label>
                            <input type="number" min="1" placeholder="Unlimited" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} className="admin-input" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Status *</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="admin-select">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-label">First Orders Limit <span style={{ fontSize: '11px', color: '#888' }}>— e.g. 1 for first order only</span></label>
                            <input type="number" min="1" placeholder="All orders" value={formData.firstOrdersLimit} onChange={e => setFormData({...formData, firstOrdersLimit: e.target.value})} className="admin-input" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">User Usage Limit <span style={{ fontSize: '11px', color: '#888' }}>— max times 1 user can use</span></label>
                            <input type="number" min="1" placeholder="No limit" value={formData.userLimit} onChange={e => setFormData({...formData, userLimit: e.target.value})} className="admin-input" />
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-label">Start On</label>
                            <input type="datetime-local" value={formData.startOn} onChange={e => setFormData({...formData, startOn: e.target.value})} className="admin-input" />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Expire On</label>
                            <input type="datetime-local" value={formData.expireOn} onChange={e => setFormData({...formData, expireOn: e.target.value})} className="admin-input" />
                        </div>
                    </div>

                    <div style={{ margin: '20px 0', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Target Buy Eligibility (Optional)</h4>
                        <div className="admin-form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <MultiSelect 
                                label="Categories" 
                                options={categories} 
                                selectedIds={formData.buyCategoryIds} 
                                onChange={val => setFormData({...formData, buyCategoryIds: val})} 
                            />
                            <MultiSelect 
                                label="Brands" 
                                options={brands} 
                                selectedIds={formData.buyBrandIds} 
                                onChange={val => setFormData({...formData, buyBrandIds: val})} 
                            />
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <MultiSelect 
                                label="Products" 
                                options={products} 
                                selectedIds={formData.buyProductIds} 
                                onChange={val => setFormData({...formData, buyProductIds: val})} 
                            />
                        </div>
                    </div>

                    <div style={{ margin: '20px 0', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <input 
                                type="checkbox" 
                                id="isBogo" 
                                checked={formData.isBogo} 
                                onChange={e => setFormData({...formData, isBogo: e.target.checked})} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="isBogo" style={{ fontWeight: '600', color: '#333', cursor: 'pointer', fontSize: '14px' }}>Is Buy X Get Y (BOGO / BXGY) Promotion?</label>
                        </div>
                        
                        {formData.isBogo && (
                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label className="admin-label">Buy Quantity *</label>
                                        <input type="number" min="1" required={formData.isBogo} value={formData.buyQuantity} onChange={e => setFormData({...formData, buyQuantity: parseInt(e.target.value) || 1})} className="admin-input" />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Get Quantity *</label>
                                        <input type="number" min="1" required={formData.isBogo} value={formData.getQuantity} onChange={e => setFormData({...formData, getQuantity: parseInt(e.target.value) || 1})} className="admin-input" />
                                    </div>
                                </div>
                                
                                <h5 style={{ margin: '15px 0 10px 0', color: '#555', fontSize: '13px', fontWeight: 'bold' }}>"Get" Item Eligibility (Optional — defaults to same as Buy target)</h5>
                                <div className="admin-form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <MultiSelect 
                                        label="Get Categories" 
                                        options={categories} 
                                        selectedIds={formData.getCategoryIds} 
                                        onChange={val => setFormData({...formData, getCategoryIds: val})} 
                                    />
                                    <MultiSelect 
                                        label="Get Brands" 
                                        options={brands} 
                                        selectedIds={formData.getBrandIds} 
                                        onChange={val => setFormData({...formData, getBrandIds: val})} 
                                    />
                                </div>
                                <div style={{ marginTop: '12px' }}>
                                    <MultiSelect 
                                        label="Get Products" 
                                        options={products} 
                                        selectedIds={formData.getProductIds} 
                                        onChange={val => setFormData({...formData, getProductIds: val})} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="admin-form-group">
                        <label className="admin-label">Description</label>
                        <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="admin-textarea"></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-modal-close">Close</button>
                        <button type="submit" className="btn-modal-submit">Submit</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default Coupon;
