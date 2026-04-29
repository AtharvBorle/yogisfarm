import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import { getAssetUrl } from '../api';

const Cart = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (user) {
            navigate('/checkout');
        } else {
            navigate('/login?redirect=/checkout');
        }
    };

    return (
        <main className="main">
            <Breadcrumb items={[{ label: 'Cart' }]} />
            <div className="container mb-80 mt-30">
                <div className="row">
                    <div className="col-lg-8 mb-40">
                        <h1 className="heading-2 mb-10">Your Cart</h1>
                        <div className="d-flex justify-content-between">
                            <h6 className="text-body">{cartItems.length} item(s) in your cart</h6>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-8">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-5">
                                <h4>Your cart is empty</h4>
                                <p>Browse our products and add items to your cart</p>
                                <Link to="/shop" className="btn btn-primary mt-3" style={{ backgroundColor: 'var(--primary)' }}>Continue Shopping</Link>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive shopping-summery">
                                    <table className="table table-wishlist">
                                        <thead>
                                            <tr className="main-heading">
                                                <th className="custome-checkbox start"></th>
                                                <th scope="col" colSpan="2">Product</th>
                                                <th scope="col">Unit Price</th>
                                                <th scope="col">Quantity</th>
                                                <th scope="col">Subtotal</th>
                                                <th scope="col" className="end">Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => {
                                                const price = item.variant 
                                                    ? (item.variant.salePrice || item.variant.price) 
                                                    : (item.product.salePrice || item.product.price);
                                                const subtotal = price * item.quantity;
                                                return (
                                                    <tr key={item.id} className="pt-30">
                                                        <td className="custome-checkbox"></td>
                                                        <td className="image product-thumbnail pt-40">
                                                            <img src={getAssetUrl(item.product.image)} alt="" style={{ maxWidth: '80px' }} />
                                                        </td>
                                                        <td className="product-des product-name">
                                                            <h6><Link className="product-name mb-10" to={`/product/${item.product.slug}`}>{item.product.name}</Link></h6>
                                                            {item.variant && <div className="product-rate-cover"><span className="font-small text-muted">{item.variant.name}</span></div>}
                                                        </td>
                                                        <td className="price" data-title="Price"><h4 className="text-body">₹{parseFloat(price).toFixed(2)}</h4></td>
                                                        <td className="text-center detail-info" data-title="Stock">
                                                            <div className="detail-extralink mr-15">
                                                                <div className="detail-qty border radius">
                                                                    <a href="#!" className="qty-down" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><i className="fi-rs-angle-small-down"></i></a>
                                                                    <span className="qty-val">{item.quantity}</span>
                                                                    <a href="#!" className="qty-up" onClick={() => updateQuantity(item.id, item.quantity + 1)}><i className="fi-rs-angle-small-up"></i></a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="price" data-title="Subtotal"><h4 className="text-brand">₹{parseFloat(subtotal).toFixed(2)}</h4></td>
                                                        <td className="action text-center" data-title="Remove">
                                                            <a href="#!" onClick={() => removeFromCart(item.id)}><i className="fi-rs-trash"></i></a>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="divider-2 mb-30"></div>
                                <div className="cart-action d-flex justify-content-between">
                                    <Link className="btn" to="/shop"><i className="fi-rs-arrow-left mr-10"></i>Continue Shopping</Link>
                                </div>
                            </>
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <div className="col-lg-4">
                            <div className="border p-md-4 cart-totals ml-30">
                                <div className="table-responsive">
                                    <table className="table no-border">
                                        <tbody>
                                            <tr>
                                                <td className="cart_total_label"><h6 className="text-muted">Subtotal</h6></td>
                                                <td className="cart_total_amount"><h4 className="text-brand text-end">₹{cartTotal.toFixed(2)}</h4></td>
                                            </tr>
                                            <tr>
                                                <td className="cart_total_label"><h6 className="text-muted">Shipping</h6></td>
                                                <td className="cart_total_amount"><h5 className="text-heading text-end">{cartTotal >= 500 ? 'Free' : '₹50'}</h5></td>
                                            </tr>
                                            <tr>
                                                <td className="cart_total_label"><h6 className="text-muted">Total</h6></td>
                                                <td className="cart_total_amount"><h4 className="text-brand text-end">₹{(cartTotal >= 500 ? cartTotal : cartTotal + 50).toFixed(2)}</h4></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <button onClick={handleCheckout} className="btn mb-20 w-100" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>Proceed To Checkout<i className="fi-rs-sign-out ml-15"></i></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Cart;
