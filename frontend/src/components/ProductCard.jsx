import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { getAssetUrl } from '../api';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
    const [showQuickView, setShowQuickView] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const price = product.salePrice || product.price;
    const oldPrice = product.salePrice ? product.price : null;

    let badgeText = null;
    if (product.salePrice && product.price > product.salePrice) {
        const discountAmt = product.price - product.salePrice;
        if (discountAmt >= 100 || discountAmt % 10 === 0) {
            badgeText = `₹${discountAmt} OFF`;
        } else {
            const discountPct = Math.round((discountAmt / product.price) * 100);
            badgeText = `${discountPct}% OFF`;
        }
    } else if (product.deal) {
        badgeText = "Deal";
    }

    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = () => {
        addToCart(product.id);
        toast.success("Added to cart");
    };

    const renderStars = (rating = 5) => {
        return (
            <span style={{ color: '#adadad', fontSize: '14px', letterSpacing: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
                ★★★★★
            </span>
        );
    };

    return (
        <div className="product-cart-wrap mb-30 wow animate__animated animate__fadeIn" data-wow-delay=".1s" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <div className="product-img-action-wrap">
                <div className="product-img product-img-zoom">
                    <Link to={`/product/${product.slug}`}>
                        <img className="default-img" src={getAssetUrl(product.image)} alt={product.name} />
                        {product.hoverImage && (
                            <img className="hover-img" src={getAssetUrl(product.hoverImage)} alt="" />
                        )}
                    </Link>
                </div>
                <div className="product-action-1">
                    <a aria-label="Add To Wishlist" className={`action-btn ${inWishlist ? 'btn-remove-from-wishlist' : 'btn-add-to-wishlist'}`} onClick={() => toggleWishlist(product.id)} href="javascript:void(0);">
                        <i className="fi-rs-heart" style={{ color: inWishlist ? 'red' : 'inherit' }}></i>
                    </a>
                    <a aria-label="Quick View" className="action-btn btn-quick-view" onClick={() => setShowQuickView(true)} href="javascript:void(0);">
                        <i className="fi-rs-eye"></i>
                    </a>
                </div>
                {badgeText && (
                    <div className="product-badges product-badges-position product-badges-mrg" style={{ position: 'absolute', top: 0, left: 0, margin: 0, zIndex: 9 }}>
                        <span className="best" style={{ backgroundColor: '#046938', color: 'white', padding: '4px 12px', borderRadius: '15px 0 15px 0', fontSize: '12px', display: 'inline-block' }}>
                            {badgeText}
                        </span>
                    </div>
                )}
            </div>
            <div className="product-content-wrap" style={{ padding: '15px' }}>
                {product.category && (
                    <div className="product-category" style={{ marginBottom: '5px' }}>
                        <Link to={`/category/${product.category.slug}`} style={{ color: '#adadad', fontSize: '12px' }}>{product.category.name}</Link>
                    </div>
                )}
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '8px' }}>
                    <Link to={`/product/${product.slug}`} style={{ color: '#253D4E' }}>{product.name}</Link>
                </h2>
                <div className="product-rate-cover" style={{ marginBottom: '10px' }}>
                    {renderStars(5)}
                    <span className="font-small text-muted" style={{ fontSize: '13px', color: '#B6B6B6', marginLeft: '5px', display: 'inline-block', verticalAlign: 'middle' }}>({product.reviews?.length || 0})</span>
                </div>
                <div className="product-card-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="product-price">
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#046938', lineHeight: '1' }}>₹{parseFloat(price).toFixed(2)}</div>
                        {oldPrice && (
                            <div className="old-price" style={{ fontSize: '14px', color: '#adadad', textDecoration: 'line-through', marginTop: '4px', display: 'block' }}>
                                ₹{parseFloat(oldPrice).toFixed(2)}
                            </div>
                        )}
                    </div>
                    <div className="add-cart">
                        <a className="add btn-add-to-cart" onClick={handleAddToCart} href="javascript:void(0);" style={{ backgroundColor: '#046938', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
                            <i className="fi-rs-shopping-cart"></i> Add
                        </a>
                    </div>
                </div>
            </div>
            {showQuickView && (
                <QuickViewModal 
                    product={product} 
                    onClose={() => setShowQuickView(false)} 
                />
            )}
        </div>
    );
};

export default ProductCard;
