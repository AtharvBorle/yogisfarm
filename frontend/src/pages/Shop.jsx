import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import FloatingSidebar from '../components/FloatingSidebar';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';

const sortLabels = {
    '': 'Relevance',
    'newest': 'Newest',
    'name_asc': 'Name: A-Z'
};

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [mobileSearchVal, setMobileSearchVal] = useState('');
    
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const keyword = searchParams.get('keyword') || '';
    const sort = searchParams.get('sort') || '';
    const page = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        api.get('/categories').then(res => {
            if(res.data.status) setCategories(res.data.categories);
        });
    }, []);

    useEffect(() => {
        setMobileSearchVal(keyword || '');
    }, [keyword]);

    useEffect(() => {
        let url = `/products?page=${page}`;
        if(category) url += `&category=${category}`;
        if(brand) url += `&brand=${brand}`;
        if(keyword) url += `&search=${keyword}`;
        if(sort === 'newest') url += `&sort=oldest`; // API default logic might differ, assuming new is default
        if(sort === 'name_asc') url += `&sort=name_asc`;

        api.get(url).then(res => {
            if(res.data.status) {
                setProducts(res.data.products);
                setTotalProducts(res.data.total);
                setTotalPages(res.data.totalPages);
            }
        });
    }, [category, brand, keyword, sort, page]);

    const handleSortChange = (newSort) => {
        searchParams.set('sort', newSort);
        searchParams.set('page', '1');
        setSearchParams(searchParams);
    };

    const handlePageChange = (newPage) => {
        searchParams.set('page', newPage.toString());
        setSearchParams(searchParams);
    };

    let pageTitle = 'Shop';
    if(category) {
        const catObj = categories.find(c => c.slug === category);
        if(catObj) pageTitle = catObj.name;
    } else if(keyword) {
        pageTitle = `Search: ${keyword}`;
    }

    return (
        <main className="main">
            {/* 1. DESKTOP BREADCRUMB & LAYOUT */}
            <div className="d-none d-lg-block">
                <Breadcrumb items={[{ label: pageTitle }]} />
                <div className="container mb-30 mt-30">
                    <div className="row">
                        {/* Sidebar */}
                        <div className="col-lg-1-5 primary-sidebar sticky-sidebar">
                            <div className="sidebar-widget widget-category-2 mb-30">
                                <h5 className="section-title style-1 mb-30">Category</h5>
                                <ul>
                                    <li>
                                        <Link className={!category ? 'active' : ''} to="/shop">
                                            All Products
                                        </Link>
                                    </li>
                                    {categories.filter(c => !c.parentId).map(cat => (
                                        <li key={cat.id}>
                                            <Link className={category === cat.slug ? 'active' : ''} to={`/shop?category=${cat.slug}`} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <img src={getAssetUrl(cat.image)} alt="" style={{width:'30px', height:'30px', marginRight:'8px'}} />
                                                {cat.name}
                                                <span className="count" style={{ marginLeft: 'auto', backgroundColor: '#046938', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{cat._count?.products || 0}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="col-lg-4-5" style={{ paddingRight: '50px' }}>
                            {(() => {
                                const currentCategoryObj = categories.find(c => c.slug === category);
                                let childCategoriesToDisplay = [];
                                if (currentCategoryObj) {
                                    if (!currentCategoryObj.parentId) {
                                        childCategoriesToDisplay = categories.filter(c => c.parentId === currentCategoryObj.id);
                                    } else {
                                        childCategoriesToDisplay = categories.filter(c => c.parentId === currentCategoryObj.parentId);
                                    }
                                }
                                
                                if (childCategoriesToDisplay.length > 0) {
                                    return (
                                        <div className="mb-40">
                                            <h4 className="mb-20">{!currentCategoryObj?.parentId ? 'Subcategories' : 'Related Categories'}</h4>
                                            <div className="row">
                                                {childCategoriesToDisplay.map(child => (
                                                    <div key={child.id} className="col-lg-3 col-md-4 col-6 col-sm-6 mb-20">
                                                        <Link to={`/shop?category=${child.slug}`} style={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                            padding: '15px', borderRadius: '10px', background: category === child.slug ? '#e8f5e9' : '#fff',
                                                            border: `1px solid ${category === child.slug ? '#046938' : '#e6e6e6'}`,
                                                            transition: 'all 0.3s',
                                                            textAlign: 'center', height: '100%',
                                                            textDecoration: 'none'
                                                        }} className="hover-up category-card-feed">
                                                            <img src={getAssetUrl(child.image)} alt={child.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                                                            <h6 style={{ color: category === child.slug ? '#046938' : '#253D4E', margin: 0, fontSize: '15px' }}>{child.name}</h6>
                                                            <span style={{ fontSize: '12px', color: '#7E7E7E', marginTop: '5px' }}>{child._count?.products || 0} items</span>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                            <div className="shop-product-fillter">
                                <div className="totall-product">
                                    <p>We found <strong className="text-brand">{totalProducts}</strong> items for you!</p>
                                </div>
                                <div className="sort-by-product-area">
                                    <div className="sort-by-cover mr-10">
                                        <div className="sort-by-product-wrap">
                                            <div className="sort-by">
                                                <span><i className="fi-rs-apps"></i>Sort by:</span>
                                            </div>
                                            <div className="sort-by-dropdown-wrap dropdown">
                                                <span data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                                                    {sortLabels[sort] || 'Relevance'} <i className="fi-rs-angle-small-down"></i>
                                                </span>
                                                <ul className="dropdown-menu">
                                                    {Object.entries(sortLabels).map(([key, label]) => (
                                                        <li key={key}>
                                                            <a className={`dropdown-item ${sort === key ? 'active' : ''}`} onClick={() => handleSortChange(key)} href="#!">
                                                                {label}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row product-grid">
                                {products.length === 0 ? (
                                    <div className="col-12 text-center py-5">
                                        <h4>No products found</h4>
                                        <p>Try different search terms or browse categories</p>
                                    </div>
                                ) : (
                                    products.map(product => (
                                        <div key={product.id} className="col-lg-4 col-md-6 col-sm-6 mb-30">
                                            <ProductCard product={product} />
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination-area mt-20 mb-20">
                                    <nav aria-label="Page navigation">
                                        <ul className="pagination justify-content-start">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                                    <a className="page-link" onClick={() => handlePageChange(p)} href="#!">{p}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MOBILE ONLY LAYOUT */}
            <div className="d-block d-lg-none" style={{ backgroundColor: '#F9FCF7', minHeight: '100vh', paddingBottom: '30px' }}>
                <style dangerouslySetInnerHTML={{ __html: `
                    .scroll-container::-webkit-scrollbar {
                        display: none !important;
                    }
                    .scroll-container {
                        scrollbar-width: none !important;
                    }
                `}} />
                
                {/* Categories Title & Search Icon Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 10px 20px', minHeight: '52px' }}>
                    {isMobileSearchOpen ? (
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (mobileSearchVal.trim()) {
                                    searchParams.set('keyword', mobileSearchVal.trim());
                                } else {
                                    searchParams.delete('keyword');
                                }
                                searchParams.set('page', '1');
                                setSearchParams(searchParams);
                                setIsMobileSearchOpen(false);
                            }}
                            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px' }}
                        >
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={mobileSearchVal}
                                    onChange={(e) => setMobileSearchVal(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 40px 8px 12px',
                                        borderRadius: '20px',
                                        border: '1.5px solid #0A6738',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'Poppins, sans-serif',
                                        backgroundColor: '#FFFFFF',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'none',
                                        padding: 0,
                                        color: '#0A6738',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileSearchOpen(false);
                                    setMobileSearchVal(keyword);
                                }}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#FF0000',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0A6738', margin: 0, fontFamily: 'Poppins, sans-serif' }}>Categories</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button 
                                    onClick={() => setIsMobileSearchOpen(true)} 
                                    style={{ 
                                        color: '#0A6738', 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        border: 'none',
                                        background: 'none',
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Horizontal scroll list of all parent categories */}
                <div className="scroll-container" style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '0 20px 15px 20px', WebkitOverflowScrolling: 'touch' }}>
                    {/* All Products Card */}
                    <div
                        onClick={() => {
                            searchParams.delete('category');
                            searchParams.set('page', '1');
                            setSearchParams(searchParams);
                        }}
                        style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer', width: '75px' }}
                    >
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: !category ? '2px solid #0A6738' : '1.5px solid #F0F0F0',
                            backgroundColor: !category ? '#E8F5E9' : '#FFFFFF',
                            padding: '6px',
                            margin: '0 auto 6px auto',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>ALL</span>
                        </div>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: !category ? 700 : 500,
                            color: !category ? '#0A6738' : '#666666',
                            fontFamily: 'Poppins, sans-serif',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            All
                        </span>
                    </div>

                    {categories.filter(c => !c.parentId).map(cat => {
                        const isSelected = category === cat.slug || categories.find(c => c.slug === category)?.parentId === cat.id;
                        return (
                            <div
                                key={cat.id}
                                onClick={() => {
                                    searchParams.set('category', cat.slug);
                                    searchParams.set('page', '1');
                                    setSearchParams(searchParams);
                                }}
                                style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer', width: '75px' }}
                            >
                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: isSelected ? '2px solid #0A6738' : '1.5px solid #F0F0F0',
                                    backgroundColor: '#FFFFFF',
                                    padding: '2px',
                                    margin: '0 auto 6px auto',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.04)',
                                    transition: 'all 0.2s'
                                }}>
                                    <img src={getAssetUrl(cat.image)} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? '#0A6738' : '#666666',
                                    fontFamily: 'Poppins, sans-serif',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {cat.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Subcategories Pill Row */}
                {(() => {
                    const currentCategoryObj = categories.find(c => c.slug === category);
                    let childCategoriesToDisplay = [];
                    if (currentCategoryObj) {
                        if (!currentCategoryObj.parentId) {
                            childCategoriesToDisplay = categories.filter(c => c.parentId === currentCategoryObj.id);
                        } else {
                            childCategoriesToDisplay = categories.filter(c => c.parentId === currentCategoryObj.parentId);
                        }
                    }
                    if (childCategoriesToDisplay.length > 0) {
                        return (
                            <div className="scroll-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 20px 12px 20px', WebkitOverflowScrolling: 'touch' }}>
                                {childCategoriesToDisplay.map(child => {
                                    const isChildSelected = category === child.slug;
                                    return (
                                        <button
                                            key={child.id}
                                            onClick={() => {
                                                searchParams.set('category', child.slug);
                                                searchParams.set('page', '1');
                                                setSearchParams(searchParams);
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                border: `1px solid ${isChildSelected ? '#0A6738' : '#EAEAEA'}`,
                                                backgroundColor: isChildSelected ? '#0A6738' : '#FFFFFF',
                                                color: isChildSelected ? '#FFF' : '#4F4F4F',
                                                fontSize: '11px',
                                                fontWeight: isChildSelected ? 600 : 500,
                                                whiteSpace: 'nowrap',
                                                fontFamily: 'Poppins, sans-serif',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                outline: 'none'
                                            }}
                                        >
                                            {child.name}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Selected Category Header & Sort button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px 15px 20px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                        {pageTitle}
                    </h4>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsMobileSortOpen(!isMobileSortOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                border: '1px solid #DCDCDC',
                                backgroundColor: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#4F4F4F',
                                fontFamily: 'Poppins, sans-serif',
                                outline: 'none'
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '2px' }}>
                                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" fill="currentColor" />
                            </svg>
                            Sort
                        </button>
                        {isMobileSortOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                width: '130px',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                borderRadius: '6px',
                                zIndex: 100,
                                padding: '6px 0',
                                marginTop: '6px',
                                border: '1px solid #ECECEC'
                            }}>
                                {Object.entries(sortLabels).map(([key, label]) => (
                                    <div
                                        key={key}
                                        onClick={() => {
                                            handleSortChange(key);
                                            setIsMobileSortOpen(false);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '12px',
                                            color: sort === key ? '#0A6738' : '#333333',
                                            fontWeight: sort === key ? 700 : 400,
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif'
                                        }}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2-Column Product Grid for Mobile */}
                <div style={{ padding: '0 14px' }}>
                    <div className="row" style={{ marginLeft: '-6px', marginRight: '-6px' }}>
                        {products.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <h4>No products found</h4>
                                <p>Try different search terms or browse categories</p>
                            </div>
                        ) : (
                            products.map(product => (
                                <div key={product.id} className="col-6 mb-15" style={{ paddingLeft: '6px', paddingRight: '6px' }}>
                                    <ProductCard product={product} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-area mt-10 mb-30" style={{ paddingLeft: '20px' }}>
                        <nav aria-label="Page navigation">
                            <ul className="pagination justify-content-start" style={{ gap: '5px' }}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                        <a className="page-link" onClick={() => handlePageChange(p)} href="#!" style={{
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            borderRadius: '5px',
                                            border: '1px solid #EAEAEA',
                                            backgroundColor: p === page ? '#0A6738' : '#FFFFFF',
                                            color: p === page ? '#FFFFFF' : '#666666'
                                        }}>{p}</a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Core Pillars */}
            <CorePillars />

            {/* Partner Logos */}
            <PartnerLogos />

            <FloatingSidebar />
        </main>
    );
};

export default Shop;
