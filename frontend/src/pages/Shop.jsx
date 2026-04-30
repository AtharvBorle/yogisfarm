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
    }, [category, keyword, sort, page]);

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
                                {categories.filter(c => !c.parentId).map(parent => {
                                    const childCategories = categories.filter(c => c.parentId === parent.id);
                                    const isExpanded = category === parent.slug || childCategories.some(c => c.slug === category);

                                    return (
                                        <React.Fragment key={parent.id}>
                                            <li>
                                                <Link className={category === parent.slug ? 'active' : ''} to={`/shop?category=${parent.slug}`} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                    <img src={getAssetUrl(parent.image)} alt="" style={{width:'30px', height:'30px', marginRight:'8px'}} />
                                                    {parent.name}
                                                    <span className="count" style={{ marginLeft: 'auto' }}>{parent._count?.products || 0}</span>
                                                </Link>
                                            </li>
                                            
                                            {isExpanded && childCategories.length > 0 && childCategories.map(child => (
                                                <li key={child.id} style={{ paddingLeft: '30px', marginTop: '-5px' }}>
                                                    <Link className={category === child.slug ? 'active' : ''} to={`/shop?category=${child.slug}`} style={{ display: 'flex', alignItems: 'center', width: '100%', fontSize: '14px', color: category === child.slug ? 'var(--primary)' : '#666' }}>
                                                        <img src={getAssetUrl(child.image)} alt="" style={{width:'22px', height:'22px', marginRight:'8px', borderRadius: '4px'}} />
                                                        {child.name}
                                                        <span className="count" style={{ marginLeft: 'auto', fontSize: '12px' }}>{child._count?.products || 0}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="col-lg-4-5">
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
