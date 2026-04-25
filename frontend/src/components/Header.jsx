import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api, { getAssetUrl } from '../api';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartItems, cartCount, cartTotal, removeFromCart } = useCart();
    const { wishlist } = useWishlist();
    
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [catOpen, setCatOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setCatOpen(false);
                setIsSuggestionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        api.get('/categories?featured=true').then(res => {
            if(res.data.status) setCategories(res.data.categories);
        });
    }, []);

    useEffect(() => {
        const handleLayoutScroll = () => {
            setIsSticky(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleLayoutScroll);
        return () => window.removeEventListener('scroll', handleLayoutScroll);
    }, []);

    useEffect(() => {
        if (keyword.length > 1) {
            const delayDebounceFn = setTimeout(() => {
                api.get(`/products?search=${encodeURIComponent(keyword)}&limit=7`).then(res => {
                    if(res.data.status) {
                        setSuggestions(res.data.products);
                        setIsSuggestionsOpen(true);
                    }
                });
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
        }
    }, [keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        window.location.href = `/shop?keyword=${encodeURIComponent(keyword)}`;
    };

    return (
        <header className="header-area header-style-1 header-height-2">
            {/* Top Bar */}
            <div className="header-top header-top-ptb-1 d-none d-lg-block" style={{ backgroundColor: '#046938' }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-3 col-lg-4">
                            <div className="header-info">
                                <ul>
                                    <li><Link to={user ? '/dashboard' : '/login'} className="text-white">My Account</Link></li>
                                    <li><Link to="/wishlist" className="text-white">Wishlist</Link></li>
                                    <li><Link to="/track-order" className="text-white">Order Tracking</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-9 col-lg-8">
                            <div className="text-center text-white">
                                <div id="news-flash" className="d-block" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Middle */}
            <div className="header-middle header-middle-ptb-1 d-none d-lg-block">
                <div className="container">
                    <div className="header-wrap">
                        <div className="logo logo-width-1">
                            <Link to="/"><img src="/assets/imgs/theme/logo.png" alt="Yogis Farm" /></Link>
                        </div>
                        <div className="header-right">
                            <div className="search-style-2" ref={searchRef}>
                                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                                    <div className="main-categori-wrap d-none d-lg-block m-0" style={{ position: 'relative' }}>
                                        <div 
                                            className="cat-btn-custom" 
                                            style={{ borderRadius: '0px', backgroundColor: '#046938', cursor: 'pointer', padding: '0 20px', height: '50px', display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                                setCatOpen(!catOpen); 
                                            }}
                                        >
                                            <span className="fi-rs-apps" style={{ marginRight: '8px' }}></span> All
                                            <i className="fi-rs-angle-down" style={{ marginLeft: '12px' }}></i>
                                        </div>
                                        {catOpen && (
                                            <div className="categori-dropdown-wrap categori-dropdown-active-large open" style={{ display: 'block', position: 'absolute', top: '100%', left: 0, zIndex: 9999, width: '250px', background: '#fff', border: '1px solid #ececec', borderRadius: '5px', padding: '20px' }}>
                                                <ul>
                                                    {categories.map(cat => (
                                                        <li key={cat.id}>
                                                            <Link to={`/shop?category=${cat.slug}`} onClick={() => setCatOpen(false)}>
                                                                <img src={getAssetUrl(cat.image)} alt={cat.name} style={{ width: 30, height: 30, objectFit: 'cover' }} />
                                                                {cat.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="more_categories">
                                                    <span className="icon"></span> <Link to="/category" onClick={() => setCatOpen(false)}> <span className="heading-sm-1">+ Show More...</span> </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input type="text" className="form-control pt-3 home-search" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="I Am Searching For..." />
                                    <button className="btn btn-primary square" type="submit" style={{ backgroundColor: '#046938', borderRadius: '0px', borderColor: '#046938' }}>
                                        <i className="fi-rs-search"></i>
                                    </button>

                                    {isSuggestionsOpen && suggestions.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '100px',
                                            right: '60px',
                                            background: '#fff',
                                            border: '1px solid #ececec',
                                            borderTop: 'none',
                                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                            zIndex: 9999,
                                            padding: '10px 0'
                                        }}>
                                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                {suggestions.map(s => {
                                                    const regex = new RegExp(`(${keyword})`, 'gi');
                                                    const parts = s.name.split(regex);
                                                    return (
                                                        <li key={s.id}>
                                                            <Link to={`/product/${s.slug}`} onClick={() => { setKeyword(''); setIsSuggestionsOpen(false); }} style={{
                                                                display: 'block', padding: '8px 20px', color: '#7E7E7E', cursor: 'pointer', fontSize: '15px'
                                                            }}>
                                                                {parts.map((part, i) => (
                                                                    part.toLowerCase() === keyword.toLowerCase() ? <strong key={i} style={{ color: '#253D4E', fontWeight: '900' }}>{part}</strong> : part
                                                                ))}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="header-action-right">
                                <div className="header-action-2">
                                    <div className="header-action-icon-2">
                                        <Link to="/wishlist">
                                            <img className="svgInject" alt="Wishlist" src="/assets/imgs/theme/icons/icon-heart.svg" />
                                            <span className="pro-count blue btn-wishlist-count">{wishlist?.length || 0}</span>
                                        </Link>
                                    </div>
                                    <div className="header-action-icon-2">
                                        <Link className="mini-cart-icon" to="/cart">
                                            <img alt="Cart" src="/assets/imgs/theme/icons/icon-cart.svg" />
                                            <span className="pro-count blue btn-cart-count">{cartCount}</span>
                                        </Link>
                                        <div className="cart-dropdown-wrap cart-dropdown-hm2 cart-main">
                                            <ul>
                                                {cartItems.map(item => (
                                                    <li key={item.id}>
                                                        <div className="shopping-cart-img">
                                                            <Link to={`/product/${item.product.slug}`}><img alt={item.product.name} src={getAssetUrl(item.product.image)} /></Link>
                                                        </div>
                                                        <div className="shopping-cart-title">
                                                            <h4><Link to={`/product/${item.product.slug}`}>{item.product.name}</Link></h4>
                                                            <h4><span>{item.quantity} × </span>₹{(item.variant?.salePrice || item.product.salePrice || item.variant?.price || item.product.price)}</h4>
                                                        </div>
                                                        <div className="shopping-cart-delete">
                                                            <button style={{border:'none',background:'none'}} onClick={() => removeFromCart(item.id)}><i className="fi-rs-cross-small"></i></button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="shopping-cart-footer">
                                                <div className="shopping-cart-total">
                                                    <h4>Total <span>₹{cartTotal}</span></h4>
                                                </div>
                                                <div className="shopping-cart-button">
                                                    <Link to="/cart">View cart</Link>
                                                    <Link to="/checkout">Checkout</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="header-action-icon-2">
                                        <Link to={user ? '/dashboard' : '/login'}>
                                            <img className="svgInject" alt="My Account" src="/assets/imgs/theme/icons/icon-user.svg" />
                                        </Link>
                                        <div className="cart-dropdown-wrap cart-dropdown-hm2 account-dropdown">
                                            <ul>
                                                {user ? (
                                                    <>
                                                        <li><Link to="/dashboard"><i className="fi fi-rs-user mr-10"></i>Dashboard</Link></li>
                                                        <li><Link to="/dashboard?tab=orders"><i className="fi fi-rs-shopping-bag mr-10"></i>Orders</Link></li>
                                                        <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}><i className="fi fi-rs-sign-out mr-10"></i>Logout</a></li>
                                                    </>
                                                ) : (
                                                    <li><Link to="/login"><i className="fi fi-rs-sign-in mr-10"></i>Sign In</Link></li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className={`header-bottom header-bottom-bg-color sticky-bar ${isSticky ? 'stick' : ''}`}>
                <div className="container">
                    <div className="header-wrap header-space-between position-relative">
                        <div className="logo logo-width-1 d-block d-lg-none pt-1">
                            <Link to="/"><img src="/assets/imgs/theme/logo.png" alt="Yogis Farm" /></Link>
                        </div>
                        <div className="header-nav d-none d-lg-flex">
                            <div className="main-menu main-menu-padding-1 main-menu-lh-2 d-none d-lg-block font-heading">
                                <nav>
                                    <ul>
                                        <li className="hot-deals"><img src="/assets/imgs/theme/icons/icon-hot.svg" alt="hot deals" /><Link to="/deals">Deals</Link></li>
                                        <li><Link to="/">Home</Link></li>
                                        <li><Link to="/about-us">About Us</Link></li>
                                        <li><Link to="/category">Category</Link></li>
                                        <li><Link to="/brands">Brands</Link></li>
                                        <li><Link to="/shop">Shop</Link></li>
                                        <li><Link to="/contact-us">Contact Us</Link></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        <div className="hotline d-none d-lg-flex">
                            <img src="/assets/imgs/theme/icons/icon-headphone.svg" alt="hotline" />
                            <p>
                                <a href="tel:9119501177">9119501177</a>
                                <span className="text-center">24/7 Support Center</span>
                            </p>
                        </div>
                        <div className="header-action-right d-block d-lg-none">
                            <div className="header-action-2">
                                <div className="header-action-icon-2">
                                    <Link to="/wishlist">
                                        <img className="svgInject" alt="Wishlist" src="/assets/imgs/theme/icons/icon-heart.svg" />
                                        <span className="pro-count white">{wishlist?.length || 0}</span>
                                    </Link>
                                </div>
                                <div className="header-action-icon-2">
                                    <Link className="mini-cart-icon" to="/cart">
                                        <img alt="Cart" src="/assets/imgs/theme/icons/icon-cart.svg" />
                                        <span className="pro-count white">{cartCount}</span>
                                    </Link>
                                </div>
                                <div className="header-action-icon-2">
                                    <div className="burger-icon burger-icon-white" onClick={() => setIsMobileMenuOpen(true)}>
                                        <span className="burger-icon-top"></span>
                                        <span className="burger-icon-mid"></span>
                                        <span className="burger-icon-bottom"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-header-active mobile-header-wrapper-style ${isMobileMenuOpen ? 'sidebar-visible' : ''}`}>
                <div className="mobile-header-wrapper-inner">
                    <div className="mobile-header-top">
                        <div className="mobile-header-logo">
                            <Link to="/"><img src="/assets/imgs/theme/logo.png" alt="logo" /></Link>
                        </div>
                        <div className="mobile-menu-close close-style-wrap close-style-position-inherit" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="close-style search-close">
                                <i className="icon-top"></i>
                                <i className="icon-bottom"></i>
                            </button>
                        </div>
                    </div>
                    <div className="mobile-header-content-area">
                        <div className="mobile-search search-style-3 mobile-header-border">
                            <form action="/shop">
                                <input type="text" placeholder="Search for items…" name="keyword" />
                                <button type="submit"><i className="fi-rs-search"></i></button>
                            </form>
                        </div>
                        <div className="mobile-menu-wrap mobile-header-border">
                            <nav>
                                <ul className="mobile-menu font-heading">
                                    <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
                                    <li><Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link></li>
                                    <li><Link to="/category" onClick={() => setIsMobileMenuOpen(false)}>Category</Link></li>
                                    <li><Link to="/brands" onClick={() => setIsMobileMenuOpen(false)}>Brands</Link></li>
                                    <li><Link to="/deals" onClick={() => setIsMobileMenuOpen(false)}>Deals</Link></li>
                                    <li><Link to="/contact-us" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link></li>
                                </ul>
                            </nav>
                        </div>
                        <div className="mobile-header-info-wrap">
                            <div className="single-mobile-header-info">
                                <Link to={user ? '/dashboard' : '/login'} onClick={() => setIsMobileMenuOpen(false)}><i className="fi-rs-user"></i> {user ? 'My Account' : 'Log In / Sign Up'} </Link>
                            </div>
                            <div className="single-mobile-header-info">
                                <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)}><i className="fi-rs-truck"></i> Track Order</Link>
                            </div>
                            <div className="single-mobile-header-info">
                                <a href="tel:9119501177"><i className="fi-rs-headphones"></i> 9119501177 </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
