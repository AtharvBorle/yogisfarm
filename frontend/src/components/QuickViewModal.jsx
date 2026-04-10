import React from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getAssetUrl } from '../api';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    if (!product) return null;

    const price = product.salePrice || product.price;
    const oldPrice = product.salePrice ? product.price : null;
    const inWishlist = isInWishlist(product.id);

    return (
        <div className="modal fade custom-modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
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
                                    {product.salePrice && <span className="stock-status out-stock"> Sale </span>}
                                    <h3 className="title-detail"><a href={`/product/${product.slug}`} className="text-heading">{product.name}</a></h3>
                                    
                                    <div className="clearfix product-price-cover">
                                        <div className="product-price primary-color float-left">
                                            <span className="current-price text-brand">₹{parseFloat(price).toFixed(2)}</span>
                                            {oldPrice && (
                                                <span>
                                                    <span className="save-price font-md color3 ml-15">{Math.round(((product.price - product.salePrice) / product.price) * 100)}% Off</span>
                                                    <span className="old-price font-md ml-15">₹{parseFloat(oldPrice).toFixed(2)}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="detail-extralink mb-30" style={{marginTop:'20px'}}>
                                        <div className="product-extra-link2">
                                            <button type="button" className="button button-add-to-cart" onClick={() => { addToCart(product.id); toast.success('Added to cart'); onClose(); }}><i className="fi-rs-shopping-cart"></i>Add to cart</button>
                                            <a aria-label="Add To Wishlist" className="action-btn hover-up" onClick={() => toggleWishlist(product.id)} href="javascript:void(0)" style={{ color: inWishlist ? 'red' : 'inherit' }}><i className="fi-rs-heart"></i></a>
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
        </div>
    );
};

export default QuickViewModal;
