import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api, { getAssetUrl } from '../api';

const QuickViewModal = ({ product, onClose }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    const [fetchedProduct, setFetchedProduct] = useState(product);

    // State for variant selection and quantity
    const variants = fetchedProduct?.variants || [];
    const firstStockedVariant = variants.find(v => v.stock > 0) || variants[0];
    const [selectedVariant, setSelectedVariant] = useState(firstStockedVariant);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(fetchedProduct?.image);

    // Fetch full product details for quick view (in case images/variants are missing from list view)
    useEffect(() => {
        api.get(`/products/${product.id}/quick-view`)
            .then(res => {
                if (res.data.status && res.data.product) {
                    setFetchedProduct(res.data.product);
                }
            })
            .catch(err => console.error(err));
    }, [product.id]);

    // Update selected variant when fetched product changes
    useEffect(() => {
        const v = fetchedProduct?.variants || [];
        setSelectedVariant(v.find(varItem => varItem.stock > 0) || v[0]);
        setQuantity(1);
        setMainImage(fetchedProduct?.image);
    }, [fetchedProduct]);

    if (!fetchedProduct) return null;

    const hasVariants = variants.length > 0;
    const isOutOfStock = !hasVariants || variants.every(v => v.stock <= 0);
    const inWishlist = isInWishlist(fetchedProduct.id);

    const price = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : null;
    const oldPrice = selectedVariant?.salePrice ? selectedVariant.price : null;

    let discountPct = 0;
    if (oldPrice && parseFloat(oldPrice) > parseFloat(price)) {
        discountPct = Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100);
    }

    const avgRating = fetchedProduct?.reviews?.length > 0 
        ? Math.round(fetchedProduct.reviews.reduce((acc, r) => acc + r.rating, 0) / (fetchedProduct.reviews.length || 1)) 
        : 5;

    const handleAddToCart = () => {
        if (!isOutOfStock && selectedVariant) {
            addToCart(fetchedProduct.id, selectedVariant.id, quantity);
        }
    };

    const handleBuyNow = () => {
        if (!isOutOfStock && selectedVariant) {
            addToCart(fetchedProduct.id, selectedVariant.id, quantity);
            onClose();
            navigate('/checkout');
        }
    };

    const increaseQuantity = () => {
        if (selectedVariant && quantity < selectedVariant.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return ReactDOM.createPortal(
        <div 
            className="quickview-modal-backdrop"
            style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040, 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '20px', overflowY: 'auto', fontFamily: "'Poppins', sans-serif"
            }} 
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                .qv-modal-content {
                    width: 100%;
                    max-width: 950px;
                    background: #FFF;
                    border-radius: 11px;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06);
                    position: relative;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    padding: 24px;
                    overflow: hidden;
                    max-height: 98vh;
                    overflow-y: auto;
                }
                .qv-close-btn {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    z-index: 10;
                    padding: 5px;
                }
                .qv-discount-badge {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 160px;
                    height: 42px;
                    background: #0A6738;
                    border-radius: 11px 0 20px 0;
                    color: #FFF;
                    font-size: 20px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                .qv-gallery {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    position: relative;
                }
                .qv-main-img-wrap {
                    width: 100%;
                    aspect-ratio: 501 / 458;
                    border-radius: 11px;
                    overflow: hidden;
                    background: #f2f2f2;
                }
                .qv-main-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .qv-thumbnails {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 15px;
                }
                .qv-thumb {
                    aspect-ratio: 1;
                    border-radius: 10px;
                    object-fit: cover;
                    background: #f2f2f2;
                    cursor: pointer;
                    border: 2px solid transparent;
                }
                .qv-thumb:hover { border-color: #0A6738; }
                
                .qv-details {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    padding-top: 10px;
                }
                .qv-countdown {
                    background: #E9FFF4;
                    border-radius: 6px;
                    padding: 8px 16px;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    color: #0A6738;
                    font-size: 14px;
                    font-weight: 600;
                    width: fit-content;
                }
                .qv-title {
                    color: #0A6738;
                    font-size: 32px;
                    font-weight: 600;
                    line-height: 1.2;
                    margin: 0;
                    text-transform: capitalize;
                }
                .qv-rating {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #000;
                    font-weight: 600;
                }
                .qv-price-wrap {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .qv-price {
                    color: #0A6738;
                    font-size: 36px;
                    font-weight: 700;
                }
                .qv-old-price {
                    color: #9B9B9B;
                    font-size: 16px;
                    font-weight: 600;
                    text-decoration: line-through;
                }
                .qv-variants {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-top: 10px;
                }
                .qv-variant-btn {
                    border: 1px solid #9B9B9B;
                    border-radius: 7px;
                    padding: 8px 20px;
                    background: #FFF;
                    color: #000;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .qv-variant-btn.active {
                    border-color: #0A6738;
                    background: #E9FFF4;
                    color: #0A6738;
                }
                .qv-quantity-wrap {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-top: 10px;
                }
                .qv-quantity-label {
                    color: #000;
                    font-size: 20px;
                    font-weight: 600;
                }
                .qv-qty-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .qv-qty-btn {
                    width: 30px;
                    height: 28px;
                    border-radius: 5px;
                    background: #0A6738;
                    color: #FFF;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .qv-qty-val {
                    width: 30px;
                    height: 28px;
                    border-radius: 5px;
                    border: 0.5px solid #BABABA;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    font-weight: 600;
                }
                .qv-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 20px;
                }
                .qv-btn-cart {
                    background: #E9FFF4;
                    border: 1px solid #0A6738;
                    border-radius: 12px;
                    color: #0A6738;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .qv-btn-cart:hover { background: #d2f5e2; }
                .qv-btn-buy {
                    background: #F00;
                    border-radius: 12px;
                    color: #FFF;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 15px;
                    border: none;
                    cursor: pointer;
                    text-transform: capitalize;
                    transition: all 0.2s;
                }
                .qv-btn-buy:hover { background: #d00000; }
                .qv-wishlist-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #0A6738;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    margin-top: 10px;
                }
                
                @media (max-width: 991px) {
                    .qv-modal-content {
                        grid-template-columns: 1fr;
                        padding: 20px;
                    }
                    .qv-title { font-size: 24px; }
                    .qv-price { font-size: 28px; }
                    .qv-actions { grid-template-columns: 1fr; }
                    .qv-discount-badge { width: 120px; height: 35px; font-size: 16px; }
                }
            `}} />

            <div className="qv-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="qv-close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.1372 25.8647L18.0017 18.0002L25.8662 25.8647M25.8662 10.1357L18.0002 18.0002L10.1372 10.1357" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Left Column: Gallery */}
                <div className="qv-gallery">
                    {discountPct > 0 && (
                        <div className="qv-discount-badge">{discountPct}% off</div>
                    )}
                    <div className="qv-main-img-wrap">
                        <img src={getAssetUrl(mainImage)} alt={fetchedProduct.name} className="qv-main-img" />
                    </div>
                    {fetchedProduct.images && fetchedProduct.images.length > 0 && (
                        <div className="qv-thumbnails">
                            <img 
                                src={getAssetUrl(fetchedProduct.image)} 
                                alt="Main Thumbnail" 
                                className="qv-thumb" 
                                onClick={() => setMainImage(fetchedProduct.image)}
                                style={{ border: mainImage === fetchedProduct.image ? '2px solid #0A6738' : '2px solid transparent' }}
                            />
                            {fetchedProduct.images.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={getAssetUrl(img.image || img)} 
                                    alt={`thumbnail ${idx}`} 
                                    className="qv-thumb" 
                                    onClick={() => setMainImage(img.image || img)}
                                    style={{ border: mainImage === (img.image || img) ? '2px solid #0A6738' : '2px solid transparent' }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="qv-details">
                    <div className="qv-countdown">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.99984 1.66699C14.6023 1.66699 18.3332 5.39783 18.3332 10.0003C18.3332 14.6028 14.6023 18.3337 9.99984 18.3337C5.39734 18.3337 1.6665 14.6028 1.6665 10.0003C1.6665 5.39783 5.39734 1.66699 9.99984 1.66699ZM9.99984 3.33366C8.23173 3.33366 6.53603 4.03604 5.28579 5.28628C4.03555 6.53652 3.33317 8.23222 3.33317 10.0003C3.33317 11.7684 4.03555 13.4641 5.28579 14.7144C6.53603 15.9646 8.23173 16.667 9.99984 16.667C11.7679 16.667 13.4636 15.9646 14.7139 14.7144C15.9641 13.4641 16.6665 11.7684 16.6665 10.0003C16.6665 8.23222 15.9641 6.53652 14.7139 5.28628C13.4636 4.03604 11.7679 3.33366 9.99984 3.33366ZM9.99984 5.00033C10.2039 5.00035 10.401 5.07529 10.5535 5.21092C10.706 5.34655 10.8035 5.53345 10.8273 5.73616L10.8332 5.83366V9.65533L13.089 11.9112C13.2385 12.0611 13.3252 12.2624 13.3317 12.474C13.3382 12.6856 13.2638 12.8918 13.1238 13.0506C12.9838 13.2094 12.7885 13.3089 12.5778 13.329C12.367 13.3491 12.1565 13.2882 11.989 13.1587L11.9107 13.0895L9.41067 10.5895C9.28115 10.4599 9.19797 10.2912 9.174 10.1095L9.1665 10.0003V5.83366C9.1665 5.61264 9.2543 5.40068 9.41058 5.2444C9.56686 5.08812 9.77882 5.00033 9.99984 5.00033Z" fill="#0A6738"/>
                        </svg>
                        Limited Time Offer
                    </div>

                    <h2 className="qv-title">{fetchedProduct.name}</h2>
                    
                    <div className="qv-rating">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.7909 3.15274C10.9024 2.9269 11.0749 2.73675 11.2888 2.6038C11.5027 2.47085 11.7496 2.40039 12.0014 2.40039C12.2533 2.40039 12.5001 2.47085 12.7141 2.6038C12.928 2.73675 13.1004 2.9269 13.2119 3.15274L15.4934 7.77574L20.5949 8.51674C20.8443 8.55271 21.0787 8.65776 21.2715 8.82C21.4643 8.98225 21.6078 9.19521 21.6858 9.43479C21.7639 9.67438 21.7733 9.93102 21.7131 10.1757C21.6528 10.4204 21.5253 10.6433 21.3449 10.8192L17.6519 14.4192L18.5234 19.4997C18.5658 19.748 18.5379 20.0031 18.4429 20.2363C18.3478 20.4695 18.1895 20.6714 17.9857 20.8193C17.7819 20.9673 17.5408 21.0552 17.2897 21.0733C17.0385 21.0914 16.7873 21.0389 16.5644 20.9217L12.0014 18.5247L7.43843 20.9247C7.21531 21.0422 6.96375 21.0948 6.71226 21.0766C6.46077 21.0584 6.2194 20.9702 6.0155 20.8218C5.81159 20.6735 5.6533 20.4711 5.55855 20.2374C5.46381 20.0037 5.4364 19.7482 5.47943 19.4997L6.34943 14.4192L2.65943 10.8207C2.4791 10.6449 2.35156 10.4221 2.29124 10.1775C2.23091 9.93296 2.24022 9.67641 2.31809 9.43686C2.39596 9.19731 2.5393 8.98433 2.73189 8.82199C2.92449 8.65966 3.15866 8.55444 3.40793 8.51824L8.50793 7.77724L10.7909 3.15274Z" fill="#FFCD0F"/>
                        </svg>
                        {avgRating.toFixed(1)} rating <span style={{ fontWeight: 400 }}>({fetchedProduct.reviews?.length || 0} reviews)</span>
                    </div>

                    <div className="qv-price-wrap">
                        <div className="qv-price">₹ {parseFloat(price || 0).toFixed(0)}</div>
                        {oldPrice && (
                            <div className="qv-old-price">₹ {parseFloat(oldPrice).toFixed(0)}</div>
                        )}
                    </div>

                    <hr style={{ borderTop: '1px solid #DCDCDC', margin: '0' }} />

                    {hasVariants && (
                        <div className="qv-variants">
                            {variants.map(variant => (
                                <button 
                                    key={variant.id}
                                    className={`qv-variant-btn ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                                    onClick={() => setSelectedVariant(variant)}
                                    disabled={variant.stock <= 0}
                                    style={{ opacity: variant.stock <= 0 ? 0.5 : 1 }}
                                >
                                    {variant.name || variant.volume || variant.weight || variant.sku || "Standard"}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="qv-quantity-wrap">
                        <div className="qv-quantity-label">Quantity</div>
                        <div style={{ flex: 1, borderTop: '1px solid #9B9B9B', margin: '0 15px' }}></div>
                        <div className="qv-qty-controls">
                            <button className="qv-qty-btn" onClick={decreaseQuantity}>
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.8332 10.8317H4.1665V9.16504H15.8332V10.8317Z" fill="white"/>
                                </svg>
                            </button>
                            <div className="qv-qty-val">{quantity}</div>
                            <button className="qv-qty-btn" onClick={increaseQuantity}>
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.1665 10.8337H4.1665V9.16699H9.1665V4.16699H10.8332V9.16699H15.8332V10.8337H10.8332V15.8337H9.1665V10.8337Z" fill="white"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="qv-actions">
                        {(() => {
                            const cartItem = cartItems?.find(item => item.product?.id === fetchedProduct.id && item.variantId === selectedVariant?.id);
                            if (cartItem) {
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#0A6738', borderRadius: '12px', overflow: 'hidden', color: '#FFF' }}>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); cartItem.quantity > 1 ? updateQuantity(cartItem.id, cartItem.quantity - 1) : removeFromCart(cartItem.id); }}
                                            style={{ padding: '15px 20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15.8332 10.8317H4.1665V9.16504H15.8332V10.8317Z" fill="white"/>
                                            </svg>
                                        </button>
                                        <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px', padding: '0 10px', whiteSpace: 'nowrap' }}>{cartItem.quantity} in Cart</span>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); cartItem.quantity < (selectedVariant?.stock || 0) && updateQuantity(cartItem.id, cartItem.quantity + 1); }}
                                            style={{ padding: '15px 20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.1665 10.8337H4.1665V9.16699H9.1665V4.16699H10.8332V9.16699H15.8332V10.8337H10.8332V15.8337H9.1665V10.8337Z" fill="white"/>
                                            </svg>
                                        </button>
                                    </div>
                                );
                            }
                            return (
                                <button 
                                    className="qv-btn-cart" 
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    style={{ opacity: isOutOfStock ? 0.5 : 1 }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18ZM16 11L18.78 6H6.14L8.5 11H16Z" fill="#0A6738"/>
                                    </svg>
                                    Add to Cart
                                </button>
                            );
                        })()}
                        <button 
                            className="qv-btn-buy" 
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            style={{ opacity: isOutOfStock ? 0.5 : 1 }}
                        >
                            Buy Now
                        </button>
                    </div>

                    <a href="#!" className="qv-wishlist-link" onClick={(e) => { e.preventDefault(); toggleWishlist(fetchedProduct.id); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={inWishlist ? '#0A6738' : 'none'} xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.1 18.55L12 18.65L11.89 18.55C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5C9.04 5 10.54 6 11.07 7.36H12.93C13.46 6 14.96 5 16.5 5C18.5 5 20 6.5 20 8.5C20 11.39 16.86 14.24 12.1 18.55ZM16.5 3C14.76 3 13.09 3.81 12 5.08C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.41 2 8.5C2 12.27 5.4 15.36 10.55 20.03L12 21.35L13.45 20.03C18.6 15.36 22 12.27 22 8.5C22 5.41 19.58 3 16.5 3Z" fill="#0A6738"/>
                        </svg>
                        add to wishlist
                    </a>

                </div>
            </div>
        </div>,
        document.body
    );
};

export default QuickViewModal;
