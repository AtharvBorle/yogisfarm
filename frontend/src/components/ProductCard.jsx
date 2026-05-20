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
            <style dangerouslySetInnerHTML={{ __html: `
                .product-cart-wrap .product-hover-actions {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #FFFFFF;
                    border: 1px solid #0A6738;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    padding: 6px 12px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    z-index: 15;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                    gap: 12px;
                }
                .product-cart-wrap:hover .product-hover-actions {
                    opacity: 1;
                    visibility: visible;
                }
                .product-hover-actions a {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }
                .product-hover-actions a::before {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(-8px);
                    background: #0A6738;
                    color: #FFF;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 500;
                    pointer-events: none;
                }
                .product-hover-actions a::after {
                    content: '';
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(0px);
                    border-width: 5px;
                    border-style: solid;
                    border-color: #0A6738 transparent transparent transparent;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                    pointer-events: none;
                }
                .product-hover-actions a:hover::before,
                .product-hover-actions a:hover::after {
                    opacity: 1;
                    visibility: visible;
                }
                .product-hover-actions a:hover {
                    transform: scale(1.1);
                }
                .product-hover-actions .action-divider {
                    width: 1px;
                    height: 18px;
                    background-color: #0A6738;
                    opacity: 0.3;
                }
            `}} />

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
                    
                    <div className="product-hover-actions">
                        <a aria-label="Add To Wishlist" data-tooltip="Add To Wishlist" onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }} href="#!">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? '#0A6738' : 'none'} xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.1 18.55L12 18.65L11.89 18.55C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5C9.04 5 10.54 6 11.07 7.36H12.93C13.46 6 14.96 5 16.5 5C18.5 5 20 6.5 20 8.5C20 11.39 16.86 14.24 12.1 18.55ZM16.5 3C14.76 3 13.09 3.81 12 5.08C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.41 2 8.5C2 12.27 5.4 15.36 10.55 20.03L12 21.35L13.45 20.03C18.6 15.36 22 12.27 22 8.5C22 5.41 19.58 3 16.5 3Z" fill="#0A6738"/>
                            </svg>
                        </a>
                        <div className="action-divider"></div>
                        <a aria-label="Quick View" data-tooltip="Quick View" onClick={(e) => { e.preventDefault(); setShowQuickView(true); }} href="#!">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#0A6738"/>
                            </svg>
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
