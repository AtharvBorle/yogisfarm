import React from 'react';
import ReactDOM from 'react-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getAssetUrl } from '../api';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    if (!product) return null;

    const variants = product.variants || [];
    const firstStockedVariant = variants.find(v => v.stock > 0) || variants[0];
    const hasVariants = variants.length > 0;
    const isOutOfStock = !hasVariants || variants.every(v => v.stock <= 0);

    const price = firstStockedVariant ? (firstStockedVariant.salePrice || firstStockedVariant.price) : null;
    const oldPrice = firstStockedVariant?.salePrice ? firstStockedVariant.price : null;
    const inWishlist = isInWishlist(product.id);

    return ReactDOM.createPortal(
        <div className="modal fade custom-modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto' }} tabIndex="-1" role="dialog" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <button type="button" className="btn-close" onClick={onClose} style={{ position: 'absolute', right: '15px', top: '15px', zIndex: 9 }}></button>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6 col-sm-12 col-xs-12 mb-md-0 mb-sm-5">
                                <div className="detail-gallery">
                                    <div className="product-image-slider">
                                        <figure className="border-radius-10">
                                            <img src={getAssetUrl(product.image)} alt="product" style={{ width: '100%', borderRadius: '10px' }} />
                                        </figure>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-sm-12 col-xs-12">
                                <div className="detail-info pr-30 pl-30">
                                    {oldPrice && parseFloat(oldPrice) > parseFloat(price) && <span className="stock-status out-stock" style={{ background: '#046938' }}> {Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100)}% Off </span>}
                                    <h3 className="title-detail"><a href={`/product/${product.slug}`} className="text-heading">{product.name}</a></h3>
                                    
                                    <div className="clearfix product-price-cover">
                                        <div className="product-price primary-color float-left">
                                            {isOutOfStock ? (
                                                <span className="current-price text-brand" style={{ color: '#ea4335' }}>Out of Stock</span>
                                            ) : price !== null ? (
                                                <>
                                                    <span className="current-price text-brand">₹{parseFloat(price).toFixed(2)}</span>
                                                    {oldPrice && (
                                                        <span>
                                                            <span className="old-price font-md ml-15">₹{parseFloat(oldPrice).toFixed(2)}</span>
                                                        </span>
                                                    )}
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="detail-extralink mb-30" style={{marginTop:'20px'}}>
                                        <div className="product-extra-link2">
                                            {isOutOfStock ? (
                                                <button type="button" className="button" style={{ background: '#e0e0e0', color: '#666', border: '1px solid #ccc', cursor: 'not-allowed' }} disabled>Out of Stock</button>
                                            ) : firstStockedVariant ? (
                                                <button type="button" className="button button-add-to-cart" onClick={() => { addToCart(product.id, 1, firstStockedVariant.id); onClose(); }}><i className="fi-rs-shopping-cart"></i>Add to cart</button>
                                            ) : null}
                                            <a aria-label="Add To Wishlist" className="action-btn hover-up" onClick={() => toggleWishlist(product.id)} href="#!" style={{ color: inWishlist ? 'red' : 'inherit' }}><i className="fi-rs-heart"></i></a>
                                        </div>
                                    </div>
                                    <div className="font-xs">
                                        <ul className="mr-50 float-start">
                                            <li className="mb-5">Type: <span className="text-brand">{product.category?.name || 'Organic'}</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default QuickViewModal;
