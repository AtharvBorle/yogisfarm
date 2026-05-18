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
            addToCart(product.id, firstStockedVariant.id, 1, product, firstStockedVariant);
        }
    };

    return (
        <div className="product-cart-wrap" style={{ 
            width: '100%',
            maxWidth: '291px', 
            height: 'auto', 
            borderRadius: '11px', 
            border: '1px solid #D5D5D5', 
            backgroundColor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Poppins', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            margin: '0 auto'
        }}>
            {/* Image Section */}
            <div style={{
                width: '100%',
                padding: '5px 5px 0 5px'
            }}>
                <div style={{
                    width: '100%',
                    aspectRatio: '281 / 187',
                    position: 'relative',
                    borderRadius: '9px',
                    overflow: 'hidden',
                    backgroundColor: '#F2F2F2'
                }}>
                    <Link to={`/product/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                        <img 
                            className="default-img"
                            src={getAssetUrl(product.image)} 
                            alt={product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </Link>
                    
                    <div className="product-action-1" style={{ zIndex: 10 }}>
                        <a aria-label="Add To Wishlist" className={`action-btn ${inWishlist ? 'btn-remove-from-wishlist' : 'btn-add-to-wishlist'}`} onClick={() => toggleWishlist(product.id)} href="#!">
                            <i className="fi-rs-heart" style={{ color: inWishlist ? 'red' : 'inherit' }}></i>
                        </a>
                        <a aria-label="Quick View" className="action-btn btn-quick-view" onClick={() => setShowQuickView(true)} href="#!">
                            <i className="fi-rs-eye"></i>
                        </a>
                    </div>

                    {badgeText && (
                        <div style={{ position: 'absolute', top: '0', left: '0', zIndex: 9 }}>
                            <span style={{ 
                                backgroundColor: '#046938', 
                                color: 'white', 
                                padding: '4px 10px', 
                                borderRadius: '12px 0 12px 0', 
                                fontSize: '11px', 
                                fontWeight: 'bold',
                                fontFamily: 'Poppins',
                                display: 'inline-block'
                            }}>
                                {badgeText}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Title */}
                <h2 style={{ 
                    fontSize: 'clamp(14px, 4vw, 18px)', 
                    fontWeight: 600, 
                    lineHeight: '1.2', 
                    color: '#253D4E', 
                    margin: '0 0 10px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: 'Poppins',
                    textTransform: 'capitalize'
                }}>
                    <Link to={`/product/${product.slug}`} style={{ color: '#253D4E' }}>{product.name}</Link>
                </h2>

                {/* Stars and Reviews */}
                <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px'
                }}>
                    <span style={{ color: '#FFB800', fontSize: '13px', letterSpacing: '1px' }}>★★★★★</span>
                    <span style={{ 
                        fontSize: '11px', 
                        color: '#B6B6B6', 
                        fontFamily: 'Poppins'
                    }}>
                        ({product.reviews?.length || 113} Reviews)
                    </span>
                </div>

                {/* Price and Button Row */}
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    flexWrap: 'wrap',
                    gap: '5px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                            fontSize: 'clamp(14px, 4vw, 18px)', 
                            fontWeight: 'bold', 
                            color: '#0A6738', 
                            lineHeight: '1',
                            fontFamily: 'Poppins'
                        }}>
                            ₹{!isNaN(parseFloat(price)) ? parseFloat(price).toFixed(2) : '0.00'}
                        </span>
                        
                        {oldPrice && (
                            <span style={{ 
                                fontSize: 'clamp(10px, 2.5vw, 11px)', 
                                color: '#FF0000', 
                                fontFamily: 'Poppins'
                            }}>
                                {Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100)}% Off
                            </span>
                        )}
                    </div>

                    <div className="add-cart">
                        {(() => {
                            if (isOutOfStock) {
                                return (
                                    <button disabled style={{ 
                                        background: '#E0E0E0', 
                                        color: '#666', 
                                        border: 'none', 
                                        width: '66px',
                                        height: '30px',
                                        borderRadius: '6px', 
                                        fontSize: '10px',
                                        fontFamily: 'Poppins',
                                        fontWeight: 'bold',
                                        cursor: 'not-allowed'
                                    }}>
                                        Sold Out
                                    </button>
                                );
                            }

                            const cartItem = cartItems?.find(item => item.product?.id === product.id && item.variantId === firstStockedVariant?.id);
                            if (cartItem) {
                                return (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        backgroundColor: '#f0f9f4', 
                                        borderRadius: '6px', 
                                        border: '1px solid #0A6738',
                                        height: '30px',
                                        width: '66px',
                                        justifyContent: 'space-between',
                                        padding: '0 5px'
                                    }}>
                                        <a onClick={() => cartItem.quantity > 1 ? updateQuantity(cartItem.id, cartItem.quantity - 1) : removeFromCart(cartItem.id)} href="#!" style={{ color: '#0A6738', fontSize: '14px', fontWeight: 'bold' }}>-</a>
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#253D4E' }}>{cartItem.quantity}</span>
                                        <a onClick={() => cartItem.quantity < firstStockedVariant.stock && updateQuantity(cartItem.id, cartItem.quantity + 1)} href="#!" style={{ color: cartItem.quantity >= firstStockedVariant.stock ? '#ccc' : '#0A6738', fontSize: '14px', fontWeight: 'bold' }}>+</a>
                                    </div>
                                );
                            }

                            return (
                                <a 
                                    onClick={handleAddToCart} 
                                    href="#!" 
                                    style={{ 
                                        backgroundColor: '#FF0000', 
                                        color: '#FFFFFF', 
                                        width: '66px',
                                        height: '30px',
                                        borderRadius: '6px', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold', 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none',
                                        fontFamily: 'Poppins',
                                        textTransform: 'uppercase',
                                        transition: 'background 0.3s'
                                    }}
                                >
                                    BUY +
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
