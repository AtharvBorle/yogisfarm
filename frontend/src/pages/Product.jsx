import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';

const Product = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        setLoading(true);
        api.get(`/products/${slug}`).then(res => {
            if(res.data.status) {
                setProduct(res.data.product);
                setRelated(res.data.related || []);
                if(res.data.product.variants && res.data.product.variants.length > 0) {
                    setSelectedVariant(res.data.product.variants[0]);
                } else {
                    setSelectedVariant(null);
                }
            }
        }).finally(() => setLoading(false));
    }, [slug]);

    if(loading) return <div className="container mt-5 text-center">Loading...</div>;
    if(!product) return <div className="container mt-5 text-center">Product not found.</div>;

    const price = selectedVariant 
        ? (selectedVariant.salePrice || selectedVariant.price) 
        : (product.salePrice || product.price);
    const oldPrice = selectedVariant 
        ? (selectedVariant.salePrice ? selectedVariant.price : null) 
        : (product.salePrice ? product.price : null);

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

    const renderStars = (rating = 5) => {
        let stars = [];
        for(let i=1; i<=5; i++) {
            stars.push(<img key={i} src="/assets/imgs/theme/rating-stars/star-on.png" alt="" style={{width:'15px', height:'15px'}} />);
        }
        return <div className="rating-result" title={`${rating * 20}%`}>{stars}</div>;
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
                                            <figure className="border-radius-10">
                                                <img src={getAssetUrl(product.image)} alt={product.name} />
                                            </figure>
                                        </div>
                                        {/* Gallery thumbnails would go here, simplified for React for now */}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="col-md-6 col-sm-12 col-xs-12">
                                    <div className="detail-info pr-30 pl-30">
                                        {badge && <span className="stock-status out-stock" style={{backgroundColor: 'var(--primary)', color: '#fff'}}>{badge}</span>}
                                        <h2 className="title-detail">{product.name}</h2>
                                        <div className="product-detail-rating mb-15">
                                            {renderStars(5)}
                                            <span className="font-small ml-5 text-muted">({product.reviews?.length || 0} reviews)</span>
                                        </div>
                                        <div className="clearfix product-price-cover">
                                            <div className="product-price primary-color float-left">
                                                <span className="current-price text-brand">₹{parseFloat(price).toFixed(2)}</span>
                                                {oldPrice && (
                                                    <span className="save-price font-md color3 ml-15">
                                                        <span className="old-price font-md ml-15">₹{parseFloat(oldPrice).toFixed(2)}</span>
                                                    </span>
                                                )}
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
                                                            <a href="javascript:void(0);" onClick={() => setSelectedVariant(v)}>{v.name}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {product.unit && (
                                            <div className="font-xs mb-20">
                                                <span className="text-muted">Unit: </span><strong>{product.unit}</strong>
                                            </div>
                                        )}

                                        <div className="detail-extralink mb-50">
                                            <div className="detail-qty border radius">
                                                <a href="javascript:void(0);" className="qty-down" onClick={() => setQuantity(q => Math.max(1, q - 1))}><i className="fi-rs-angle-small-down"></i></a>
                                                <input type="text" className="qty-val" value={quantity} readOnly />
                                                <a href="javascript:void(0);" className="qty-up" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><i className="fi-rs-angle-small-up"></i></a>
                                            </div>
                                            <div className="product-extra-link2">
                                                <button type="button" className="button button-add-to-cart" onClick={handleAddToCart}><i className="fi-rs-shopping-cart"></i>Add to cart</button>
                                                <a aria-label="Add To Wishlist" className="action-btn hover-up" href="javascript:void(0);"><i className="fi-rs-heart"></i></a>
                                            </div>
                                        </div>

                                        <div className="font-xs">
                                            <ul className="mr-50 float-start">
                                                {product.category && <li className="mb-5">Category: <Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link></li>}
                                                <li className="mb-5">Availability: <span className={product.stock > 0 ? "in-stock text-success" : "text-danger"}>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span></li>
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
                                        <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" href="#reviews-tab">Reviews ({product.reviews?.length || 0})</a></li>
                                    </ul>
                                    <div className="tab-content shop_info_tab entry-main-content">
                                        <div className="tab-pane fade show active" id="desc-tab">
                                            <div className="p-30">{product.description || 'No description available.'}</div>
                                        </div>
                                        <div className="tab-pane fade" id="reviews-tab">
                                            <div className="p-30">
                                                {product.reviews && product.reviews.length > 0 ? (
                                                    // Render actual reviews if present
                                                    product.reviews.map(r => <div key={r.id}><strong>{r.user.name}</strong> - {r.rating} stars<br/>{r.comment}</div>)
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
