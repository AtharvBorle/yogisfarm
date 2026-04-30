import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';

const Product = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get(`/products/${slug}`).then(res => {
            if(res.data.status) {
                setProduct(res.data.product);
                setMainImage(res.data.product.image);
                setRelated(res.data.related || []);
                const variants = res.data.product.variants || [];
                if(variants.length > 0) {
                    const firstStocked = variants.find(v => v.stock > 0) || variants[0];
                    setSelectedVariant(firstStocked);
                } else {
                    setSelectedVariant(null);
                }
            }
        }).finally(() => setLoading(false));
    }, [slug]);

    if(loading) return <div className="container mt-5 text-center">Loading...</div>;
    if(!product) return <div className="container mt-5 text-center">Product not found.</div>;

    const variants = product.variants || [];
    const isOutOfStock = variants.length === 0 || (selectedVariant && selectedVariant.stock <= 0) || variants.every(v => v.stock <= 0);

    const price = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : null;
    const oldPrice = selectedVariant?.salePrice ? selectedVariant.price : null;

    let badge = null;
    if(oldPrice) {
        const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        badge = `Save ${discount}%`;
    }

    const breadcrumbItems = [];
    if(product.category) {
        breadcrumbItems.push({ label: product.category.name, link: `/shop?category=${product.category.slug}` });
    }
    breadcrumbItems.push({ label: product.name });

    const handleAddToCart = () => {
        addToCart(product.id, selectedVariant?.id, quantity);
    };

    const handleBuyNow = () => {
        addToCart(product.id, selectedVariant?.id, quantity);
        navigate('/checkout');
    };

    const handleWishlist = () => {
        toggleWishlist(product.id);
    };

    const inWishlist = isInWishlist(product?.id);

    const avgRating = product.reviews?.length > 0 
        ? Math.round(product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length) 
        : 5;

    const renderStars = (rating = avgRating) => {
        const rounded = Math.round(rating);
        return (
            <div className="d-inline-block" title={`${rating * 20}%`} style={{ verticalAlign: 'middle' }}>
                <span style={{ color: '#FDC040', fontSize: '16px', letterSpacing: '2px' }}>
                    {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
                </span>
            </div>
        );
    };

    return (
        <main className="main">
            <Breadcrumb items={breadcrumbItems} />
            <div className="container mb-30">
                <div className="row">
                    <div className="col-xl-10 col-lg-12 m-auto">
                        <div className="product-detail accordion-detail">
                            <div className="row mb-50 mt-30">
                                {/* Product Images */}
                                <div className="col-md-6 col-sm-12 col-xs-12 mb-md-0 mb-sm-5">
                                    <div className="detail-gallery">
                                        <div className="product-image-slider-details">
                                            <figure className="border-radius-10" style={{ border: '1px solid #eee', overflow: 'hidden' }}>
                                                <img src={getAssetUrl(mainImage)} alt={product.name} style={{ width: '100%', objectFit: 'contain', aspectRatio: '1/1' }} />
                                            </figure>
                                        </div>
                                        {/* Gallery Thumbnails */}
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                                            <div 
                                                onClick={() => setMainImage(product.image)}
                                                style={{ border: mainImage === product.image ? '2px solid #3BB77E' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', minWidth: '80px', height: '80px' }}
                                            >
                                                <img src={getAssetUrl(product.image)} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            {product.images?.map(img => (
                                                <div 
                                                    key={img.id}
                                                    onClick={() => setMainImage(img.image)}
                                                    style={{ border: mainImage === img.image ? '2px solid #3BB77E' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', minWidth: '80px', height: '80px' }}
                                                >
                                                    <img src={getAssetUrl(img.image)} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="col-md-6 col-sm-12 col-xs-12">
                                    <div className="detail-info pr-30 pl-30">
                                        {badge && <span className="stock-status out-stock" style={{backgroundColor: 'var(--primary)', color: '#fff'}}>{badge}</span>}
                                        <h2 className="title-detail">{product.name}</h2>
                                        <div className="mb-15" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
                                            {renderStars()}
                                            <span className="font-small text-muted" style={{ marginTop: '3px' }}>({product.reviews?.length || 0} reviews)</span>
                                        </div>
                                        <div className="clearfix product-price-cover">
                                            <div className="product-price primary-color float-left">
                                                {isOutOfStock ? (
                                                    <span className="current-price text-brand" style={{ color: '#ea4335' }}>Out of Stock</span>
                                                ) : price !== null ? (
                                                    <>
                                                        <span className="current-price text-brand">₹{parseFloat(price).toFixed(2)}</span>
                                                        {oldPrice && (
                                                            <span className="save-price font-md color3 ml-15">
                                                                <span className="old-price font-md ml-15">₹{parseFloat(oldPrice).toFixed(2)}</span>
                                                            </span>
                                                        )}
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="short-desc mb-30">
                                            <p className="font-lg">{product.shortDescription || product.description}</p>
                                        </div>

                                        {product.variants && product.variants.length > 0 && (
                                            <div className="attr-detail attr-size mb-30">
                                                <strong className="mr-10">Variant: </strong>
                                                <ul className="list-filter size-filter font-small">
                                                    {product.variants.map(v => (
                                                        <li key={v.id} className={selectedVariant?.id === v.id ? 'active' : ''}>
                                                            <a href="#!" onClick={(e) => { e.preventDefault(); setSelectedVariant(v); setQuantity(1); }}>{v.name}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {(() => {
                                            const currentStock = selectedVariant ? selectedVariant.stock : 0;
                                            const cartItem = cartItems?.find(item => item.product?.id === product.id && item.variantId === selectedVariant?.id);
                                            
                                            return (
                                                <div className="detail-extralink mb-50">
                                                    <div className="detail-qty border radius">
                                                        <a href="#!" className="qty-down" onClick={(e) => { e.preventDefault(); !isOutOfStock && setQuantity(q => Math.max(1, q - 1)); }}><i className="fi-rs-angle-small-down"></i></a>
                                                        <input type="text" className="qty-val" value={isOutOfStock ? 0 : quantity} readOnly />
                                                        <a href="#!" className="qty-up" onClick={(e) => { e.preventDefault(); !isOutOfStock && setQuantity(q => Math.min(currentStock, q + 1)); }}><i className="fi-rs-angle-small-up"></i></a>
                                                    </div>
                                                    <div className="product-extra-link2" style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
                                                        {isOutOfStock ? (
                                                            <button type="button" className="button" style={{ background: '#e0e0e0', color: '#666', border: '1px solid #ccc', cursor: 'not-allowed' }} disabled>Out of Stock</button>
                                                        ) : cartItem ? (
                                                            <button type="button" className="button button-add-to-cart" style={{ padding: 0, display: 'inline-flex', alignItems: 'stretch', height: '46px' }}>
                                                                <span onClick={(e) => { e.preventDefault(); cartItem.quantity > 1 ? updateQuantity(cartItem.id, cartItem.quantity - 1) : removeFromCart(cartItem.id); }} style={{ padding: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '18px' }}>-</span>
                                                                <span style={{ padding: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>{cartItem.quantity}</span>
                                                                <span onClick={(e) => { e.preventDefault(); cartItem.quantity < currentStock && updateQuantity(cartItem.id, cartItem.quantity + 1); }} style={{ padding: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '18px' }}>+</span>
                                                            </button>
                                                        ) : (
                                                            <button type="button" className="button button-add-to-cart" onClick={handleAddToCart}><i className="fi-rs-shopping-cart"></i> Add to cart</button>
                                                        )}
                                                        {!isOutOfStock && (
                                                            <button type="button" className="button button-buy-now" onClick={handleBuyNow} style={{ background: '#fdc040', border: '1px solid #fdc040', color: '#fff' }}><i className="fi-rs-shopping-bag mr-5"></i>Buy Now</button>
                                                        )}
                                                        <button 
                                                            aria-label="Add To Wishlist" 
                                                            className="action-btn hover-up" 
                                                            onClick={handleWishlist} 
                                                            style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '5px', padding: '10px 15px' }}
                                                        >
                                                            <i className="fi-rs-heart" style={{ color: inWishlist ? 'red' : 'inherit' }}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="font-xs">
                                            <ul className="mr-50 float-start">
                                                {product.category && <li className="mb-5">Category: <Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link></li>}
                                                <li className="mb-5">Availability: <span className={!isOutOfStock ? "in-stock text-success" : "text-danger"}>{!isOutOfStock ? "In Stock" : "Out of Stock"}</span></li>
                                                {product.tags && <li className="mb-5">Tags: {product.tags.split(',').map(t => <span key={t} style={{ background: '#eee', padding: '2px 8px', borderRadius: '10px', marginRight: '5px' }}>{t.trim()}</span>)}</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Description Tab */}
                            <div className="product-info">
                                <div className="tab-style3">
                                    <ul className="nav nav-tabs text-uppercase">
                                        <li className="nav-item"><a className="nav-link active" data-bs-toggle="tab" href="#desc-tab">Description</a></li>
                                        {product.features && product.features.length > 0 && <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" href="#features-tab">Features</a></li>}
                                        {product.benefits && product.benefits.length > 0 && <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" href="#benefits-tab">Benefits</a></li>}
                                        <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" href="#reviews-tab">Reviews ({product.reviews?.length || 0})</a></li>
                                    </ul>
                                    <div className="tab-content shop_info_tab entry-main-content">
                                        <div className="tab-pane fade show active" id="desc-tab">
                                            <div className="p-30">{product.description || 'No description available.'}</div>
                                        </div>
                                        {product.features && product.features.length > 0 && (
                                            <div className="tab-pane fade" id="features-tab">
                                                <div className="p-30">
                                                    <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                                        {product.features.map((f, i) => (
                                                            <li key={i} className="mb-10"><strong>{f.feature}:</strong> {f.description}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                        {product.benefits && product.benefits.length > 0 && (
                                            <div className="tab-pane fade" id="benefits-tab">
                                                <div className="p-30">
                                                    <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                                        {product.benefits.map((b, i) => (
                                                            <li key={i} className="mb-10"><strong>{b.title}:</strong> {b.description}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                        <div className="tab-pane fade" id="reviews-tab">
                                            <div className="p-30">
                                                {product.reviews && product.reviews.length > 0 ? (
                                                    <div className="comments-area">
                                                        <div className="row">
                                                            <div className="col-lg-8">
                                                                <h4 className="mb-30">Customer Questions & Answers</h4>
                                                                <div className="comment-list">
                                                                    {product.reviews.map(r => (
                                                                        <div key={r.id} className="single-comment justify-content-between d-flex mb-30" style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                                                                            <div className="user justify-content-between d-flex">
                                                                                <div className="thumb text-center" style={{ marginRight: '20px' }}>
                                                                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#3BB77E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                                                                                        {r.user.name ? r.user.name.charAt(0).toUpperCase() : 'U'}
                                                                                    </div>
                                                                                    <a href="#!" className="font-heading text-brand" style={{ display: 'block', marginTop: '10px' }}>{r.user.name || 'Anonymous'}</a>
                                                                                </div>
                                                                                <div className="desc">
                                                                                    <div className="d-flex justify-content-between mb-10">
                                                                                        <div className="d-flex align-items-center">
                                                                                            <span className="font-xs text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                                        </div>
                                                                                        {renderStars(r.rating)}
                                                                                    </div>
                                                                                    <p className="mb-10 text-muted">{r.comment}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : <p>No reviews yet. Be the first to review!</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Products */}
                            {related.length > 0 && (
                                <div className="row mt-60">
                                    <div className="col-12">
                                        <h2 className="section-title style-1 mb-30">Related Products</h2>
                                    </div>
                                    {related.slice(0, 4).map(product => (
                                        <div key={product.id} className="col-lg-3 col-md-4 col-6 col-sm-6">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Product;
