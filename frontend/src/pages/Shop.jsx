import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';

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
                                            <span className="count" style={{ marginLeft: 'auto' }}>{cat._count?.products || 0}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="col-lg-4-5">
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
                                    <div key={product.id} className="col-lg-1-5 col-md-4 col-6 col-sm-6">
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
        </main>
    );
};

export default Shop;
