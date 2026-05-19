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

    // Auto-Scroll Logic for Mobile Categories on Category Page
    useEffect(() => {
        const containers = document.querySelectorAll('.auto-scroll-container');
        let animationFrameId;
        let lastTime = 0;
        const speedPerSecond = 35; // Pixels per second

        const animate = (time) => {
            if (!lastTime) lastTime = time;
            const deltaTime = time - lastTime;
            lastTime = time;

            if (window.innerWidth <= 768) {
                const moveAmount = (speedPerSecond * deltaTime) / 1000;

                containers.forEach(container => {
                    if (container.dataset.paused === 'true') {
                        container._wasPaused = true;
                        return;
                    }
                    
                    if (container._wasPaused) {
                        container._exactScrollLeft = container.scrollLeft;
                        container._wasPaused = false;
                    }
                    
                    if (typeof container._exactScrollLeft === 'undefined') {
                        container._exactScrollLeft = container.scrollLeft;
                    }

                    container._exactScrollLeft += moveAmount;
                    
                    const { scrollWidth, clientWidth } = container;
                    if (container._exactScrollLeft + clientWidth >= scrollWidth - 1) {
                        container._exactScrollLeft = 0;
                        container.scrollLeft = 0;
                    } else {
                        container.scrollLeft = container._exactScrollLeft;
                    }
                });
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        const pause = (e) => {
            const container = e.currentTarget;
            container.dataset.paused = 'true';
            clearTimeout(container._resumeTimeout);
        };
        const resume = (e) => {
            const container = e.currentTarget;
            clearTimeout(container._resumeTimeout);
            container._resumeTimeout = setTimeout(() => {
                container.dataset.paused = 'false';
            }, 500);
        };

        containers.forEach(container => {
            container.addEventListener('touchstart', pause, { passive: true });
            container.addEventListener('touchend', resume, { passive: true });
            container.addEventListener('mouseenter', pause);
            container.addEventListener('mouseleave', resume);
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            containers.forEach(container => {
                clearTimeout(container._resumeTimeout);
                container.removeEventListener('touchstart', pause);
                container.removeEventListener('touchend', resume);
                container.removeEventListener('mouseenter', pause);
                container.removeEventListener('mouseleave', resume);
            });
        };
    }, [categories]);

    return (
        <main className="main">
            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 767px) {
                    .auto-scroll-container {
                        flex-wrap: nowrap !important;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }
                    .auto-scroll-container::-webkit-scrollbar {
                        display: none !important;
                    }
                }
            `}} />

            {/* Clean Standard Breadcrumb */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Category
                    </div>
                </div>
            </div>

            <div className="container mt-50 mb-50">
                <div style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    <h2 style={{ color: '#253D4E', fontSize: '32px', fontWeight: '700' }}>Browse Categories</h2>
                </div>
                
                {/* Desktop/Laptop Layout Grid */}
                <div className="d-none d-md-flex row">
                    {loading ? (
                        <div className="col-12 text-center"><p>Loading categories...</p></div>
                    ) : parentCategories.length > 0 ? (
                        parentCategories.map((cat) => (
                            <div 
                                key={cat.id} 
                                className="col-lg-2 col-md-3 col-sm-4 text-center mb-30 px-2"
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

                {/* Mobile Responsive Premium Horizontal Layout */}
                <div className="d-flex d-md-none overflow-auto auto-scroll-container mb-30" style={{ gap: '15px', paddingBottom: '15px' }}>
                    {loading ? (
                        <div className="text-center w-100"><p>Loading categories...</p></div>
                    ) : parentCategories.length > 0 ? (
                        parentCategories.map((cat) => (
                            <div 
                                key={cat.id} 
                                className="text-center px-1"
                                onClick={() => handleParentClick(cat)}
                                style={{ cursor: 'pointer', minWidth: '100px', maxWidth: '100px', flexShrink: 0 }}
                            >
                                <div style={{ 
                                    border: selectedParent?.id === cat.id ? '2px solid #046938' : '1px solid #7ebf97', 
                                    borderRadius: '15px', 
                                    padding: '10px',
                                    marginBottom: '8px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: selectedParent?.id === cat.id ? '#f0fdf4' : '#fff',
                                    boxShadow: selectedParent?.id === cat.id ? '0 4px 10px rgba(4,105,56,0.1)' : '0 2px 5px rgba(0,0,0,0.02)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <img src={getAssetUrl(cat.image)} alt={cat.name} style={{ maxWidth: '100%', maxHeight: '55px', objectFit: 'contain' }} />
                                </div>
                                <h6 style={{ fontWeight: '700', fontSize: '12px', color: selectedParent?.id === cat.id ? '#046938' : '#253D4E', transition: 'all 0.3s ease', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {cat.name}
                                </h6>
                            </div>
                        ))
                    ) : (
                        <div className="text-center w-100">
                            <p>No categories found.</p>
                        </div>
                    )}
                </div>

                {/* DYNAMIC SECTION */}
                <div ref={dynamicSectionRef}>
                    {selectedParent && (
                        <div style={{ marginTop: '30px', background: '#fcfcfc', padding: '20px', borderRadius: '15px', border: '1px solid #eaeaea' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '22px', color: '#253D4E', fontWeight: '700' }}>{selectedParent.name}</h3>
                                <button onClick={() => setSelectedParent(null)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}><X size={18} /></button>
                            </div>
                            
                            {/* Children Pills */}
                            {categories.filter(c => c.parentId === selectedParent.id).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                                    <button 
                                        onClick={() => handleParentClick(selectedParent)} 
                                        style={{ 
                                            padding: '6px 16px', 
                                            borderRadius: '30px', 
                                            border: activeChild === null ? 'none' : '1px solid #ddd', 
                                            background: activeChild === null ? '#046938' : '#fff',
                                            color: activeChild === null ? '#fff' : '#333',
                                            fontWeight: '600', cursor: 'pointer',
                                            fontSize: '13px',
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
                                                padding: '6px 16px', 
                                                borderRadius: '30px', 
                                                border: activeChild?.id === child.id ? 'none' : '1px solid #ddd', 
                                                background: activeChild?.id === child.id ? '#046938' : '#fff',
                                                color: activeChild?.id === child.id ? '#fff' : '#333',
                                                fontWeight: '600', cursor: 'pointer',
                                                fontSize: '13px',
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
                                    <div className="row px-2">
                                        {dynamicProducts.map(product => (
                                            <div className="col-lg-3 col-md-4 col-sm-6 col-6 mb-3 px-2" key={product.id}>
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

            <FeatureBanners showTestimonialsOnMobile={false} />
        </main>
    );
};

export default Category;
