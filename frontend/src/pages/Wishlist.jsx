import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist } = useWishlist();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = () => {
        if(user) {
            api.get('/wishlist')
                .then(res => {
                    if(res.data.status) setItems(res.data.items);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    if (!user) {
        return <Navigate to="/login?redirect=/wishlist" />;
    }

    const handleRemove = async (productId) => {
        await toggleWishlist(productId);
        fetchWishlist();
    };

    const handleAddToCart = (product) => {
        const price = product.salePrice || product.price;
        addToCart(product, null, 1, price);
        toast.success("Added to cart");
    };

    return (
        <main className="main">
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Wishlist
                    </div>
                </div>
            </div>

            <div className="container mt-50 mb-50">
                <div className="row">
                    <div className="col-12 text-center text-md-left mb-40">
                        <h2 style={{ color: '#253D4E', fontWeight: '800', fontSize: '40px' }}>Your Wishlist</h2>
                        <h6 className="text-muted mt-10">There Are <span style={{ color: '#046938', fontWeight: 'bold' }}>{items.length}</span> Products In This List</h6>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        {loading ? (
                            <p>Loading your wishlist...</p>
                        ) : items.length === 0 ? (
                            <div className="text-center mt-50 mb-50">
                                <h4>Your wishlist is empty</h4>
                                <Link to="/shop" className="btn mt-20" style={{ background: '#046938', color: '#fff', border: 'none' }}>Go to Shop</Link>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ background: '#F8F9FA', borderRadius: '15px', padding: '20px' }}>
                                <table className="table shopping-summery text-center mb-0">
                                    <thead>
                                        <tr className="main-heading" style={{ color: '#253D4E', fontWeight: 'bold' }}>
                                            <th scope="col" colSpan="2" className="text-start" style={{ borderBottom: '1px solid #ececec', borderTop: 'none' }}>Product</th>
                                            <th scope="col" style={{ borderBottom: '1px solid #ececec', borderTop: 'none' }}>Price</th>
                                            <th scope="col" style={{ borderBottom: '1px solid #ececec', borderTop: 'none' }}>Stock Status</th>
                                            <th scope="col" style={{ borderBottom: '1px solid #ececec', borderTop: 'none' }}>Action</th>
                                            <th scope="col" style={{ borderBottom: '1px solid #ececec', borderTop: 'none' }}>Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id}>
                                                <td className="image product-thumbnail text-start" style={{ verticalAlign: 'middle', borderBottom: '1px solid #ececec', paddingTop: '15px' }}>
                                                    <img src={getAssetUrl(item.product.image)} alt={item.product.name} style={{ width: '80px', borderRadius: '8px', border: '1px solid #ececec' }} />
                                                </td>
                                                <td className="product-des product-name text-start" style={{ verticalAlign: 'middle', borderBottom: '1px solid #ececec' }}>
                                                    <h6 className="product-name mb-10"><Link to={`/product/${item.product.slug}`} style={{ color: '#046938', fontWeight: 'bold' }}>{item.product.name}</Link></h6>
                                                </td>
                                                <td className="price" data-title="Price" style={{ verticalAlign: 'middle', borderBottom: '1px solid #ececec' }}>
                                                    <h5 style={{ color: '#7E7E7E', fontSize: '18px' }}>₹{item.product.salePrice || item.product.price}</h5>
                                                </td>
                                                <td className="text-center" data-title="Stock" style={{ verticalAlign: 'middle', borderBottom: '1px solid #ececec' }}>
                                                    <span style={{ background: '#FDE0E9', color: '#F74B81', padding: '5px 15px', borderRadius: '5px', fontSize: '14px', fontWeight: 'bold' }}>In Stock</span>
                                                </td>
                                                <td className="text-right" data-title="Cart" style={{ verticalAlign: 'middle', borderBottom: '1px solid #ececec' }}>
                                                    <button onClick={() => handleAddToCart(item.product)} className="btn btn-sm" style={{ background: '#046938', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}><i className="fi-rs-shopping-cart mr-5"></i>Add</button>
                                                </td>
                                                <td className="action" data-title="Remove" style={{ verticalAlign: 'middle', borderBottom: '1px solid #ececec' }}>
                                                    <a href="javascript:void(0)" onClick={() => handleRemove(item.productId)} style={{ color: '#7E7E7E' }}><i className="fi-rs-trash"></i></a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <FeatureBanners />
        </main>
    );
};

export default Wishlist;
