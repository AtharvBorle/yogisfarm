import React from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../api';

const ProductSmallCard = ({ product }) => {
    const variants = product.variants || [];
    const firstStockedVariant = variants.find(v => v.stock > 0) || variants[0];
    const hasVariants = variants.length > 0;
    const isOutOfStock = !hasVariants || variants.every(v => v.stock <= 0);

    const price = firstStockedVariant ? (firstStockedVariant.salePrice || firstStockedVariant.price) : null;
    const oldPrice = firstStockedVariant?.salePrice ? firstStockedVariant.price : null;

    return (
        <article 
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px',
                padding: '10px',
                borderRadius: '12px',
                transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--yf-bg-light)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            <figure style={{ width: '80px', flexShrink: 0, margin: 0 }}>
                <Link to={`/product/${product.slug}`}>
                    <img 
                        src={getAssetUrl(product.image)} 
                        alt={product.name} 
                        style={{ 
                            borderRadius: '9px', 
                            width: '100%', 
                            height: '80px',
                            objectFit: 'cover',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }} 
                    />
                </Link>
            </figure>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h6 style={{ margin: '0 0 5px 0', lineHeight: '1.4' }}>
                    <Link 
                        to={`/product/${product.slug}`} 
                        style={{ 
                            color: 'var(--yf-text-dark)', 
                            fontSize: '14px', 
                            fontFamily: 'var(--font-poppins)',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {product.name}
                    </Link>
                </h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--yf-text-light-grey)', fontSize: '12px', letterSpacing: '1px' }}>★★★★★</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isOutOfStock ? (
                        <span style={{ color: 'var(--yf-accent-red)', fontWeight: '600', fontSize: '14px' }}>Out of Stock</span>
                    ) : price !== null ? (
                        <>
                            <span style={{ color: 'var(--yf-primary-dark)', fontWeight: '700', fontSize: '16px' }}>₹{parseFloat(price).toFixed(2)}</span>
                            {oldPrice && (
                                <span style={{ color: 'var(--yf-text-light-grey)', textDecoration: 'line-through', fontSize: '12px' }}>₹{parseFloat(oldPrice).toFixed(2)}</span>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </article>
    );
};

export default ProductSmallCard;
