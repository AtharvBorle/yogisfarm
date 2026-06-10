import React, { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../api';
import toast from 'react-hot-toast';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [flatInventory, setFlatInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters & Sorting state
    const [searchVal, setSearchVal] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [threshold, setThreshold] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    
    // Local stock edit state (stores variantId -> stock quantity)
    const [editStocks, setEditStocks] = useState({});
    const [savingId, setSavingId] = useState(null);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inventory');
            if (res.data.status) {
                setProducts(res.data.products);
            } else {
                toast.error(res.data.message || 'Failed to load inventory');
            }
        } catch (error) {
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // Flatten products and variants whenever products change
    useEffect(() => {
        const list = [];
        products.forEach(product => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(variant => {
                    list.push({
                        variantId: variant.id,
                        productId: product.id,
                        productName: product.name,
                        variantName: variant.name,
                        stock: variant.stock,
                        price: variant.price,
                        salePrice: variant.salePrice,
                        image: product.image,
                        category: product.category?.name || '—',
                        brand: product.brand?.name || '—'
                    });
                });
            } else {
                // If product has no variants (fallback)
                list.push({
                    variantId: null,
                    productId: product.id,
                    productName: product.name,
                    variantName: 'Default',
                    stock: 0,
                    price: 0,
                    salePrice: null,
                    image: product.image,
                    category: product.category?.name || '—',
                    brand: product.brand?.name || '—'
                });
            }
        });
        setFlatInventory(list);

        // Prepopulate local stock edits
        const stocksMap = {};
        products.forEach(product => {
            if (product.variants) {
                product.variants.forEach(v => {
                    stocksMap[v.id] = v.stock;
                });
            }
        });
        setEditStocks(stocksMap);
    }, [products]);

    // Handle stock update
    const handleUpdateStock = async (variantId) => {
        if (!variantId) {
            toast.error('Cannot update default product stock directly. Please add variants.');
            return;
        }
        const stockVal = editStocks[variantId];
        if (stockVal === undefined || stockVal === '' || isNaN(stockVal)) {
            toast.error('Please enter a valid stock number');
            return;
        }

        setSavingId(variantId);
        try {
            const res = await api.put('/inventory/stock', {
                variantId,
                stock: parseInt(stockVal, 10)
            });
            if (res.data.status) {
                toast.success('Stock updated successfully');
                // Update local flat inventory and product state to avoid full refetch
                setProducts(prevProducts => 
                    prevProducts.map(p => {
                        if (p.variants) {
                            return {
                                ...p,
                                variants: p.variants.map(v => 
                                    v.id === variantId ? { ...v, stock: parseInt(stockVal, 10) } : v
                                )
                            };
                        }
                        return p;
                    })
                );
            } else {
                toast.error(res.data.message || 'Failed to update stock');
            }
        } catch (error) {
            toast.error('Error updating stock');
        } finally {
            setSavingId(null);
        }
    };

    // Filter and sort computation
    const filteredInventory = flatInventory
        .filter(item => {
            // Case-insensitive search on product name or variant name
            const matchesSearch = searchTerm === '' || 
                item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.variantName.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Stock threshold filtering (stock <= threshold)
            const matchesThreshold = threshold === '' || 
                item.stock <= parseInt(threshold, 10);

            return matchesSearch && matchesThreshold;
        })
        .sort((a, b) => {
            // Sort by stock level
            if (sortOrder === 'asc') {
                return a.stock - b.stock;
            } else {
                return b.stock - a.stock;
            }
        });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(searchVal);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Inventory Management</h2>
                <button onClick={fetchInventory} className="btn-add-new" style={{ background: '#3BB77E' }}>Refresh Data</button>
            </div>

            {/* Filter and Search Bar Card */}
            <div className="admin-card" style={{ marginBottom: '20px', padding: '15px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label className="admin-label">Search Product / Variant</label>
                        <input 
                            type="text" 
                            className="admin-input" 
                            placeholder="Enter product or variant name..." 
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                        />
                    </div>

                    <div style={{ width: '150px' }}>
                        <label className="admin-label">Stock Threshold (≤)</label>
                        <input 
                            type="number" 
                            className="admin-input" 
                            placeholder="e.g. 5" 
                            value={threshold}
                            onChange={e => setThreshold(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-modal-submit" style={{ height: '42px', padding: '0 20px' }}>
                            Search
                        </button>
                        <button 
                            type="button" 
                            onClick={toggleSortOrder} 
                            className="btn-modal-close" 
                            style={{ height: '42px', padding: '0 15px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)' }}
                        >
                            Sort Stock: {sortOrder === 'asc' ? 'Ascending ⬆️' : 'Descending ⬇️'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Inventory Table Card */}
            <div className="admin-card" style={{ overflowX: 'auto', border: 'none' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Image</th>
                            <th>Product Name</th>
                            <th>Variant</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th style={{ width: '120px' }}>Price</th>
                            <th style={{ width: '180px' }}>Stock Level</th>
                            <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                    Loading inventory items...
                                </td>
                            </tr>
                        ) : filteredInventory.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                    No inventory items match the current filters.
                                </td>
                            </tr>
                        ) : (
                            filteredInventory.map((item, index) => {
                                const isLowStock = item.stock <= 5;
                                const localVal = item.variantId ? editStocks[item.variantId] : item.stock;

                                return (
                                    <tr key={`${item.productId}-${item.variantId || 'default'}-${index}`}>
                                        <td>
                                            {item.image ? (
                                                <img 
                                                    src={getAssetUrl(item.image)} 
                                                    alt="" 
                                                    style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '4px' }} 
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: '500', color: 'var(--text)' }}>
                                                {item.productName}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-muted, #777)' }}>
                                                {item.variantName}
                                            </span>
                                        </td>
                                        <td>{item.category}</td>
                                        <td>{item.brand}</td>
                                        <td>
                                            <div style={{ fontSize: '14px', color: 'var(--text)' }}>
                                                ₹{Number(item.salePrice || item.price).toFixed(2)}
                                                {item.salePrice && (
                                                    <span style={{ textDecoration: 'line-through', fontSize: '11px', color: '#999', marginLeft: '6px' }}>
                                                        ₹{Number(item.price).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {item.variantId ? (
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={localVal !== undefined ? localVal : ''}
                                                        onChange={e => setEditStocks({
                                                            ...editStocks,
                                                            [item.variantId]: e.target.value
                                                        })}
                                                        style={{
                                                            width: '75px',
                                                            padding: '6px 8px',
                                                            border: isLowStock ? '1px solid #ff8888' : '1px solid var(--border)',
                                                            borderRadius: '4px',
                                                            background: isLowStock ? '#fff5f5' : 'var(--card-bg)',
                                                            color: isLowStock ? '#cc0000' : 'var(--text)',
                                                            fontWeight: isLowStock ? '600' : 'normal',
                                                            textAlign: 'center'
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ fontWeight: 'bold' }}>{item.stock}</span>
                                                )}
                                                
                                                {isLowStock && (
                                                    <span style={{ 
                                                        background: '#fff3cd', 
                                                        color: '#856404', 
                                                        fontSize: '11px', 
                                                        padding: '2px 6px', 
                                                        borderRadius: '4px',
                                                        fontWeight: '500',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        Low Stock ⚠️
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {item.variantId ? (
                                                <button 
                                                    onClick={() => handleUpdateStock(item.variantId)}
                                                    className="btn-modal-submit"
                                                    disabled={savingId === item.variantId}
                                                    style={{ 
                                                        padding: '6px 12px', 
                                                        fontSize: '13px', 
                                                        background: savingId === item.variantId ? '#888' : '#3BB77E',
                                                        cursor: savingId === item.variantId ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {savingId === item.variantId ? 'Saving...' : 'Update'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#999' }}>No Variant</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
