import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getAssetUrl } from '../api';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    // Assuming product object comes with wishlisted status or we handle it via context
    // This is a base implementation matching the PHP one

    const price = product.salePrice || product.price;
    const oldPrice = product.salePrice ? product.price : null;

    let badge = null;
    if (product.salePrice) {
        const discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
        badge = `Save ${discount}%`;
    } else if (product.deal) {
        badge = "Deal";
    }

    const inWishlist = false; // TODO: Implement wishlist context check

    const handleAddToCart = () => {
        addToCart(product.id);
    };

    const renderStars = (rating = 5) => {
        let stars = [];
        for(let i=1; i<=5; i++) {
            stars.push(<img key={i} src="/assets/imgs/theme/rating-stars/star-on.png" alt="" style={{width:'15px', height:'15px'}} />);
        }
        return <div className="rating-result" title={`${rating * 20}%`}>{stars}</div>;
    };

    return (
        <div className="product-cart-wrap mb-30 wow animate__animated animate__fadeIn" data-wow-delay=".1s">
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
                    <a aria-label="Add To Wishlist" className={`action-btn ${inWishlist ? 'btn-remove-from-wishlist' : 'btn-add-to-wishlist'}`} onClick={() => {}} href="javascript:void(0);">
                        <i className="fi-rs-heart" style={{ color: inWishlist ? 'red' : 'inherit' }}></i>
                    </a>
                    <a aria-label="Quick View" className="action-btn btn-quick-view" href="javascript:void(0);">
                        <i className="fi-rs-eye"></i>
                    </a>
                </div>
                {badge && (
                    <div className="product-badges product-badges-position product-badges-mrg">
                        <span className="hot">{badge}</span>
                    </div>
                )}
            </div>
            <div className="product-content-wrap">
                {product.category && (
                    <div className="product-category">
                        <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
                    </div>
                )}
                <h2><Link to={`/product/${product.slug}`}>{product.name}</Link></h2>
                <div className="product-rate-cover">
                    {renderStars(5)}
                    <span className="font-small ml-5 text-muted">({product.reviews?.length || 0})</span>
                </div>
                <div className="product-card-bottom">
                    <div className="product-price">
                        <span>₹{parseFloat(price).toFixed(2)}</span>
                        {oldPrice && (
                            <span className="old-price">₹{parseFloat(oldPrice).toFixed(2)}</span>
                        )}
                    </div>
                    <div className="add-cart">
                        <a className="add btn-add-to-cart" onClick={handleAddToCart} href="javascript:void(0);">
                            <i className="fi-rs-shopping-cart mr-5"></i>Add
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
