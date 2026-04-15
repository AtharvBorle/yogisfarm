import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Deals = () => {
    const [dealProducts, setDealProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        Promise.all([
            api.get('/products?deal=true'),
            api.get('/categories'),
            api.get('/products?limit=3')
        ]).then(([dealsRes, catRes, newRes]) => {
            if(dealsRes.data.status) setDealProducts(dealsRes.data.products);
            if(catRes.data.status) setCategories(catRes.data.categories);
            if(newRes.data.status) setNewProducts(newRes.data.products);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        const priceToUse = product.salePrice || product.price;
        addToCart(product, null, 1, priceToUse);
    };

    return (
        <main className="main">
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
                    <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                        <Link to="/" style={{ color: '#fff', fontSize: '16px' }}><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span style={{ margin: '0 10px' }}>›</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Deals</span>
                    </div>
                </div>
            </div>

            <div className="container mb-30 mt-50">
                <div className="row">
                    {/* Left Column - Deal Products */}
                    <div className="col-lg-9">
                        <div className="shop-product-fillter">
                            <div className="totall-product">
                                <p>We found <strong className="text-brand">{dealProducts.length}</strong> items for you!</p>
                            </div>
                        </div>
                        
                        <div className="row product-grid">
                            {loading ? <p>Loading deals...</p> : dealProducts.map(product => (
                                <div className="col-12 mb-20" key={product.id}>
                                    <div className="product-cart-wrap" style={{ display: 'flex', borderRadius: '15px', border: '1px solid #eee', overflow: 'hidden' }}>
                                        <div className="product-img-action-wrap" style={{ width: '250px', flexShrink: 0, padding: '20px', background: '#f8f9fa' }}>
                                            <div className="product-img product-img-zoom" style={{ height: '100%' }}>
                                                <Link to={`/product/${product.slug}`} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img className="default-img" src={getAssetUrl(product.image)} alt={product.name} style={{ maxHeight: '200px', objectFit: 'contain' }} />
                                                </Link>
                                            </div>
                                            {/* Top badges if needed could go here */}
                                            {product.salePrice && product.price > product.salePrice && (
                                                <div className="product-badges product-badges-position product-badges-mrg">
                                                    <span className="hot" style={{ background: '#046938' }}>{Math.round(((product.price - product.salePrice) / product.price) * 100)}% Off</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-content-wrap" style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div className="product-category">
                                                <Link to={`/shop?category=${product.category?.slug}`}>{product.category?.name || 'Uncategorized'}</Link>
                                            </div>
                                            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}><Link to={`/product/${product.slug}`}>{product.name}</Link></h2>
                                            <div className="product-rate-cover" style={{ marginTop: '10px' }}>
                                                <div className="product-rate d-inline-block">
                                                    <div className="product-rating" style={{ width: `${(product.rating || 0) * 20}%` }}></div>
                                                </div>
                                                <span className="font-small ml-5 text-muted"> ({product.reviewsCount || 0})</span>
                                            </div>
                                            <p className="mt-15 mb-15 text-muted">{product.shortDescription || 'Delicious and authentically sourced for everyday cooking.'}</p>
                                            
                                            <div className="product-card-bottom" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div className="product-price">
                                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#046938' }}>₹{product.salePrice || product.price}</span>
                                                    {product.salePrice && <span className="old-price" style={{ fontSize: '16px', textDecoration: 'line-through', color: '#7E7E7E', marginLeft: '10px' }}>₹{product.price}</span>}
                                                </div>
                                                <div className="add-cart">
                                                    <a className="add" href="#" onClick={(e) => handleAddToCart(e, product)} style={{ background: '#046938', color: '#fff', padding: '10px 20px', borderRadius: '5px' }}><i className="fi-rs-shopping-cart mr-5"></i>Add </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!loading && dealProducts.length === 0 && (
                                <div className="col-12"><p>No deals found at the moment.</p></div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="col-lg-3 primary-sidebar sticky-sidebar">
                        <div className="sidebar-widget widget-category-2 mb-30" style={{ border: '1px solid #ececec', padding: '30px', borderRadius: '15px' }}>
                            <h5 className="section-title style-1 mb-30" style={{ fontSize: '20px', fontWeight: 'bold' }}>Category</h5>
                            <ul>
                                {categories.slice(0, 7).map(cat => (
                                    <li key={cat.id}>
                                        <Link to={`/shop?category=${cat.slug}`}>
                                            <img src={getAssetUrl(cat.image)} alt="" style={{ width: '30px', height: '30px', objectFit: 'contain', marginRight: '10px' }} />
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="sidebar-widget product-sidebar mb-30 p-30 bg-grey border-radius-10" style={{ border: '1px solid #ececec', padding: '30px', borderRadius: '15px' }}>
                            <h5 className="section-title style-1 mb-30" style={{ fontSize: '20px', fontWeight: 'bold' }}>New products</h5>
                            {newProducts.map(nProduct => (
                                <div className="single-post clearfix" key={nProduct.id} style={{ display: 'flex', marginBottom: '20px', alignItems: 'center' }}>
                                    <div className="image" style={{ width: '80px', flexShrink: 0 }}>
                                        <img src={getAssetUrl(nProduct.image)} alt={nProduct.name} style={{ borderRadius: '5px' }} />
                                    </div>
                                    <div className="content pt-10" style={{ paddingLeft: '15px' }}>
                                        <h6 style={{ fontSize: '14px', fontWeight: 'bold' }}><Link to={`/product/${nProduct.slug}`}>{nProduct.name}</Link></h6>
                                        <p className="price mb-0 mt-5" style={{ color: '#046938', fontWeight: 'bold' }}>₹{nProduct.salePrice || nProduct.price}</p>
                                        <div className="product-rate" style={{ marginTop: '5px' }}>
                                            <div className="product-rating" style={{ width: `${(nProduct.rating || 0) * 20}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Deals;
