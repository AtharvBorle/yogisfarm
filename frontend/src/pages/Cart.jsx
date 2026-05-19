import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import api, { getAssetUrl } from '../api';
import { useOrderPricing } from '../hooks/useOrderPricing';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FloatingSidebar from '../components/FloatingSidebar';

const CartBanner = () => (
    <section className="cart-banner-section" style={{ position: 'relative', background: '#0A6738', paddingTop: '60px', paddingBottom: '80px', overflow: 'hidden', marginBottom: '40px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className="d-flex align-items-center justify-content-center gap-20">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.32072 0.0757599C1.55328 0.00699589 1.79711 -0.0152684 2.03828 0.010239C2.27945 0.0357464 2.51323 0.108525 2.72626 0.224418C2.93929 0.340311 3.1274 0.497045 3.27984 0.685666C3.43228 0.874287 3.54606 1.0911 3.61468 1.32371L4.96841 5.90937H41.0392C45.568 5.90937 49.0262 10.1357 47.7217 14.549L43.6482 28.3331C42.7818 31.2696 40.0276 33.2314 36.9657 33.2314H14.4298C11.3679 33.2314 8.6161 31.2696 7.74725 28.3331L0.0752893 2.36982C-0.0629267 1.90078 -0.00941583 1.39606 0.224078 0.96643C0.457572 0.5368 0.851972 0.2149 1.32072 0.0757599ZM9.8443 42.4618C9.8443 40.9929 10.4278 39.5843 11.4663 38.5456C12.5049 37.507 13.9135 36.9235 15.3823 36.9235C16.8511 36.9235 18.2597 37.507 19.2982 38.5456C20.3368 39.5843 20.9203 40.9929 20.9203 42.4618C20.9203 43.9306 20.3368 45.3393 19.2982 46.3779C18.2597 47.4165 16.8511 48 15.3823 48C13.9135 48 12.5049 47.4165 11.4663 46.3779C10.4278 45.3393 9.8443 43.9306 9.8443 42.4618ZM29.5349 42.4618C29.5349 41.7345 29.6782 41.0143 29.9565 40.3424C30.2348 39.6704 30.6427 39.0599 31.157 38.5456C31.6712 38.0314 32.2817 37.6234 32.9536 37.3451C33.6255 37.0668 34.3457 36.9235 35.0729 36.9235C35.8002 36.9235 36.5203 37.0668 37.1922 37.3451C37.8641 37.6234 38.4746 38.0314 38.9889 38.5456C39.5031 39.0599 39.9111 39.6704 40.1894 40.3424C40.4677 41.0143 40.6109 41.7345 40.6109 42.4618C40.6109 43.9306 40.0274 45.3393 38.9889 46.3779C37.9503 47.4165 36.5417 48 35.0729 48C33.6042 48 32.1955 47.4165 31.157 46.3779C30.1184 45.3393 29.5349 43.9306 29.5349 42.4618Z" fill="#ACD140"/>
                </svg>
                <h1 className="cart-banner-title" style={{ fontSize: '36px', fontWeight: '700', margin: 0, fontFamily: 'Poppins, sans-serif' }}>Your Shopping Cart</h1>
            </div>
        </div>
        <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', lineHeight: 0, zIndex: 1 }}>
            <svg width="100%" height="36" viewBox="0 0 1440 36" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0C36 36 72 36 108 0C144 36 180 36 216 0C252 36 288 36 324 0C360 36 396 36 432 0C468 36 504 36 540 0C576 36 612 36 648 0C684 36 720 36 756 0C792 36 828 36 864 0C900 36 936 36 972 0C1008 36 1044 36 1080 0C1116 36 1152 36 1188 0C1224 36 1260 36 1296 0C1332 36 1368 36 1404 0C1440 36 1476 36 1512 0V36H0V0Z" fill="#fff"/>
            </svg>
        </div>
    </section>
);

const Cart = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
    const [popularProducts, setPopularProducts] = React.useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    // === USE CENTRALIZED PRICING HOOK ===
    const { subtotalBase, totalTax, shipping, loading, grandTotal } = useOrderPricing(cartItems);

    React.useEffect(() => {
        api.get('/products?popular=true&limit=4').then(res => {
            if(res.data.status) setPopularProducts(res.data.products);
        });
    }, []);

    const handleCheckout = () => {
        if (user) {
            navigate('/checkout');
        } else {
            navigate('/login?redirect=/checkout');
        }
    };

    return (
        <main className="main" style={{ background: '#fff' }}>
            <Breadcrumb items={[{ label: 'Cart' }]} />
            
            <CartBanner />

            <div className="container mb-80">
                <div className="row">
                    <div className="col-lg-8">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-5">
                                <h4 style={{ color: '#0A6738' }}>Your cart is empty</h4>
                                <p className="mb-30">Browse our products and add items to your cart</p>
                                <Link to="/shop" className="btn" style={{ backgroundColor: '#0A6738', color: '#fff', padding: '12px 30px', borderRadius: '8px' }}>Continue Shopping</Link>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 15px' }}>
                                        <thead style={{ background: '#F8F8F8' }}>
                                            <tr style={{ border: 'none' }}>
                                                <th style={{ padding: '15px', color: '#666', fontSize: '14px', fontWeight: '600', border: 'none', width: '60px' }}></th>
                                                <th style={{ padding: '15px', color: '#666', fontSize: '14px', fontWeight: '600', border: 'none' }}>PRODUCT</th>
                                                <th style={{ padding: '15px', color: '#666', fontSize: '14px', fontWeight: '600', border: 'none', width: '120px' }}>PRICE</th>
                                                <th style={{ padding: '15px', color: '#666', fontSize: '14px', fontWeight: '600', border: 'none', textAlign: 'center', width: '150px' }}>QTY</th>
                                                <th style={{ padding: '15px', color: '#666', fontSize: '14px', fontWeight: '600', border: 'none', width: '120px' }}>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => {
                                                const price = item.variant 
                                                    ? (item.variant.salePrice || item.variant.price) 
                                                    : 0;
                                                const subtotal = price * item.quantity;
                                                return (
                                                    <tr key={item.id} className="cart-table-row" style={{ verticalAlign: 'middle', background: '#fff', border: '1px solid #eee', transition: '0.3s' }}>
                                                        <td style={{ padding: '15px', width: '60px' }}>
                                                            <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'transparent', color: '#000', cursor: 'pointer', padding: '5px' }}>
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                        <td style={{ padding: '15px' }}>
                                                            <div className="d-flex align-items-center" style={{ gap: '30px' }}>
                                                                <img src={getAssetUrl(item.product.image)} alt="" style={{ width: '90px', height: '90px', borderRadius: '10px', objectFit: 'cover' }} />
                                                                <div>
                                                                    <Link to={`/product/${item.product.slug}`} style={{ color: '#0A6738', fontWeight: '600', fontSize: '16px' }}>{item.product.name}</Link>
                                                                    {item.variant && <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{item.variant.name}</p>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px', color: '#333', fontWeight: '600' }}>₹{parseFloat(price).toFixed(2)}</td>
                                                        <td style={{ padding: '15px' }}>
                                                            <div className="d-flex align-items-center justify-content-center" style={{ gap: '5px' }}>
                                                                <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="qty-btn" style={{ width: '28px', height: '28px', border: 'none', background: '#0A6738', color: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }}>
                                                                    <Minus size={14} />
                                                                </button>
                                                                <div style={{ width: '35px', height: '28px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', background: '#fff' }}>
                                                                    {item.quantity}
                                                                </div>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn" style={{ width: '28px', height: '28px', border: 'none', background: '#0A6738', color: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }}>
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px', color: '#0A6738', fontWeight: '700' }}>₹{parseFloat(subtotal).toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-30">
                                    <Link to="/shop" style={{ color: '#0A6738', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fi-rs-arrow-left"></i> Continue Shopping
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <div className="col-lg-4">
                            <div className="cart-summary-box" style={{ border: '1px solid #eee', borderRadius: '15px', padding: '30px', background: '#fff', transition: '0.3s' }}>
                                <h4 className="mb-30" style={{ color: '#0A6738', fontSize: '20px', fontWeight: '700' }}>Order Summary</h4>
                                <div className="d-flex justify-content-between mb-15">
                                    <span style={{ color: '#666' }}>Subtotal</span>
                                    <span style={{ color: '#333', fontWeight: '600' }}>₹{loading ? '...' : subtotalBase.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-15">
                                    <span style={{ color: '#666' }}>Total Applicable GST</span>
                                    <span style={{ color: '#333', fontWeight: '600' }}>₹{loading ? '...' : totalTax.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-15">
                                    <span style={{ color: '#666' }}>Shipping</span>
                                    <span style={{ color: '#0A6738', fontWeight: '600' }}>{loading ? '...' : (shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`)}</span>
                                </div>
                                <div style={{ height: '1px', background: '#eee', margin: '20px 0' }}></div>
                                <div className="d-flex justify-content-between mb-30">
                                    <span style={{ color: '#333', fontWeight: '700', fontSize: '18px' }}>Total</span>
                                    <span style={{ color: '#0A6738', fontWeight: '700', fontSize: '18px' }}>₹{loading ? '...' : grandTotal.toFixed(0)}</span>
                                </div>
                                <button onClick={handleCheckout} className="btn btn-checkout w-100">
                                    Proceed To Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Popular Products Section */}
                {popularProducts.length > 0 && (
                    <div className="mt-80">
                        <h3 className="mb-30" style={{ color: '#0A6738', fontSize: '24px', fontWeight: '700' }}>You May Also Like</h3>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                            gap: '24px' 
                        }}>
                            {popularProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <FloatingSidebar />
        </main>
    );
};

export default Cart;

