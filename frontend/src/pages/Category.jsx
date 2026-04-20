import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import FeatureBanners from '../components/FeatureBanners';
import ProductCard from '../components/ProductCard';

import { X } from 'react-feather';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedParent, setSelectedParent] = useState(null);
    const [activeChild, setActiveChild] = useState(null);
    const [dynamicProducts, setDynamicProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const dynamicSectionRef = useRef(null);

    useEffect(() => {
        api.get('/categories')
            .then(res => {
                if(res.data.status) {
                    setCategories(res.data.categories);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const fetchProducts = async (catSlug) => {
        setLoadingProducts(true);
        try {
            const res = await api.get(`/products?category=${catSlug}`);
            if (res.data.status) {
                setDynamicProducts(res.data.products);
            }
        } catch (e) {
            console.error('Failed to load products', e);
        }
        setLoadingProducts(false);
    };

    const handleParentClick = (cat) => {
        setSelectedParent(cat);
        setActiveChild(null);
        fetchProducts(cat.slug);
        setTimeout(() => {
            if (dynamicSectionRef.current) {
                dynamicSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleChildClick = (child) => {
        setActiveChild(child);
        fetchProducts(child.slug);
    };

    // Filter parent categories (no parentId)
    const parentCategories = categories.filter(c => !c.parentId);

    return (
        <main className="main">
            {/* Custom Green Breadcrumb Banner */}
            <div className="page-header breadcrumb-wrap" style={{ 
                margin: '20px 0', 
                padding: '40px 0', 
                backgroundColor: '#046938', 
                borderRadius: '10px',
                position: 'relative',
                overflow: 'hidden',
                marginLeft: '15px',
                marginRight: '15px'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    opacity: 0.1, backgroundImage: 'url(/assets/imgs/theme/breadcrumb-bg.jpg)', 
                    backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none'
                }}></div>

                <div className="container position-relative">
                    <div className="breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                        <div>
                            <Link to="/" style={{ color: '#fff', fontSize: '16px' }}><i className="fi-rs-home mr-5"></i>Home</Link>
                            <span style={{ margin: '0 10px' }}>›</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Category</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-50 mb-50">
                <div style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    <h2 style={{ color: '#253D4E', fontSize: '32px', fontWeight: '700' }}>Browse Categories</h2>
                </div>
                
                <div className="row">
                    {loading ? (
                        <div className="col-12 text-center"><p>Loading categories...</p></div>
                    ) : parentCategories.length > 0 ? (
                        parentCategories.map((cat) => (
                            <div 
                                key={cat.id} 
                                className="col-lg-2 col-md-3 col-sm-4 col-6 text-center mb-30 px-2"
                                onClick={() => handleParentClick(cat)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ 
                                    border: selectedParent?.id === cat.id ? '2px solid #046938' : '1px solid #7ebf97', 
                                    borderRadius: '15px', 
                                    padding: '20px',
                                    marginBottom: '15px',
                                    height: '140px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: selectedParent?.id === cat.id ? '#f0fdf4' : '#fff',
                                    boxShadow: selectedParent?.id === cat.id ? '0 4px 10px rgba(4,105,56,0.1)' : '0 2px 5px rgba(0,0,0,0.02)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <img src={getAssetUrl(cat.image)} alt={cat.name} style={{ maxWidth: '100%', maxHeight: '90px', objectFit: 'contain' }} />
                                </div>
                                <h6 style={{ fontWeight: '700', fontSize: '16px', color: selectedParent?.id === cat.id ? '#046938' : '#253D4E', transition: 'all 0.3s ease' }}>
                                    {cat.name}
                                </h6>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            <p>No categories found.</p>
                        </div>
                    )}
                </div>

                {/* DYNAMIC SECTION */}
                <div ref={dynamicSectionRef}>
                    {selectedParent && (
                        <div style={{ marginTop: '50px', background: '#fcfcfc', padding: '30px', borderRadius: '15px', border: '1px solid #eaeaea' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '24px', color: '#253D4E', fontWeight: '700' }}>{selectedParent.name}</h3>
                                <button onClick={() => setSelectedParent(null)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}><X size={18} /></button>
                            </div>
                            
                            {/* Children Pills */}
                            {categories.filter(c => c.parentId === selectedParent.id).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                                    <button 
                                        onClick={() => handleParentClick(selectedParent)} 
                                        style={{ 
                                            padding: '8px 20px', 
                                            borderRadius: '30px', 
                                            border: activeChild === null ? 'none' : '1px solid #ddd', 
                                            background: activeChild === null ? '#046938' : '#fff',
                                            color: activeChild === null ? '#fff' : '#333',
                                            fontWeight: '600', cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        All
                                    </button>
                                    {categories.filter(c => c.parentId === selectedParent.id).map(child => (
                                        <button 
                                            key={child.id}
                                            onClick={() => handleChildClick(child)}
                                            style={{ 
                                                padding: '8px 20px', 
                                                borderRadius: '30px', 
                                                border: activeChild?.id === child.id ? 'none' : '1px solid #ddd', 
                                                background: activeChild?.id === child.id ? '#046938' : '#fff',
                                                color: activeChild?.id === child.id ? '#fff' : '#333',
                                                fontWeight: '600', cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {child.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Products Grid */}
                            <div>
                                {loadingProducts ? (
                                    <div className="text-center py-5"><p>Loading products...</p></div>
                                ) : dynamicProducts.length > 0 ? (
                                    <div className="row">
                                        {dynamicProducts.map(product => (
                                            <div className="col-lg-3 col-md-4 col-12 col-sm-6" key={product.id}>
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <p style={{ color: '#888' }}>No products found in this category.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Category;
