import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getAssetUrl } from '../api';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
    const [showQuickView, setShowQuickView] = useState(false);
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const variants = product.variants || [];
    const firstStockedVariant = variants.find(v => v.stock > 0) || variants[0];
    const hasVariants = variants.length > 0;
    const isOutOfStock = !hasVariants || variants.every(v => v.stock <= 0);

    const price = firstStockedVariant ? (firstStockedVariant.salePrice || firstStockedVariant.price) : null;
    const oldPrice = firstStockedVariant?.salePrice ? firstStockedVariant.price : null;

    let badgeText = null;
    if (firstStockedVariant?.salePrice && parseFloat(firstStockedVariant.price) > parseFloat(firstStockedVariant.salePrice)) {
        const numPrice = parseFloat(firstStockedVariant.price);
        const numSalePrice = parseFloat(firstStockedVariant.salePrice);
        const discountAmt = numPrice - numSalePrice;
        const discountPct = Math.round((discountAmt / numPrice) * 100);
        badgeText = `${discountPct}% OFF`;
    }

    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = () => {
        if (!isOutOfStock && firstStockedVariant) {
            addToCart(product.id, 1, firstStockedVariant.id);
        }
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
                    <a aria-label="Add To Wishlist" className={`action-btn ${inWishlist ? 'btn-remove-from-wishlist' : 'btn-add-to-wishlist'}`} onClick={() => toggleWishlist(product.id)} href="#!">
                        <i className="fi-rs-heart" style={{ color: inWishlist ? 'red' : 'inherit' }}></i>
                    </a>
                    <a aria-label="Quick View" className="action-btn btn-quick-view" onClick={() => setShowQuickView(true)} href="#!">
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
                        <Link to={`/shop?category=${product.category.slug}`} style={{ color: '#adadad', fontSize: '12px' }}>{product.category.name}</Link>
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
                        {price !== null ? (
                            <>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#046938', lineHeight: '1' }}>₹{parseFloat(price).toFixed(2)}</div>
                                {oldPrice && (
                                    <div className="old-price" style={{ fontSize: '14px', color: '#adadad', textDecoration: 'line-through', marginTop: '4px', display: 'block' }}>
                                        ₹{parseFloat(oldPrice).toFixed(2)}
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                    <div className="add-cart">
                        {(() => {
                            if (isOutOfStock) {
                                return (
                                    <button className="add" disabled style={{ background: '#e0e0e0', color: '#666', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'not-allowed', width: '100%', fontSize: '13px' }}>
                                        Out of stock
                                    </button>
                                );
                            }

                            const cartItem = cartItems?.find(item => item.product?.id === product.id && item.variantId === firstStockedVariant?.id);
                            if (cartItem) {
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f0f9f4', borderRadius: '4px', border: '1px solid #046938' }}>
                                        <a onClick={() => cartItem.quantity > 1 ? updateQuantity(cartItem.id, cartItem.quantity - 1) : removeFromCart(cartItem.id)} href="#!" style={{ padding: '6px 10px', color: '#046938', fontSize: '16px', fontWeight: 'bold' }}>-</a>
                                        <span style={{ padding: '0 8px', fontSize: '14px', fontWeight: 'bold', color: '#253D4E' }}>{cartItem.quantity}</span>
                                        <a onClick={() => cartItem.quantity < firstStockedVariant.stock && updateQuantity(cartItem.id, cartItem.quantity + 1)} href="#!" style={{ padding: '6px 10px', color: cartItem.quantity >= firstStockedVariant.stock ? '#ccc' : '#046938', fontSize: '16px', fontWeight: 'bold', cursor: cartItem.quantity >= firstStockedVariant.stock ? 'not-allowed' : 'pointer' }}>+</a>
                                    </div>
                                );
                            }

                            return (
                                <a className="add btn-add-to-cart" onClick={handleAddToCart} href="#!" style={{ backgroundColor: '#046938', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
                                    <i className="fi-rs-shopping-cart"></i> Add
                                </a>
                            );
                        })()}
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
