import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api, { getAssetUrl } from '../api';

// New Assets
import loginIcon from '../assets/figma/image_find/Login_SVG.svg';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartItems, cartCount, cartTotal, removeFromCart } = useCart();
    const { wishlist } = useWishlist();

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [catOpen, setCatOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

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
            if (res.data.status) setCategories(res.data.categories);
        });
    }, []);

    useEffect(() => {
        const handleLayoutScroll = () => {
            setIsSticky(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleLayoutScroll);
        return () => window.removeEventListener('scroll', handleLayoutScroll);
    }, []);

    useEffect(() => {
        if (keyword.length > 1) {
            const delayDebounceFn = setTimeout(() => {
                api.get(`/products?search=${encodeURIComponent(keyword)}&limit=7`).then(res => {
                    if (res.data.status) {
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
        const params = new URLSearchParams();
        if (keyword.trim()) params.set('keyword', keyword.trim());
        if (selectedCategory) params.set('category', selectedCategory);
        navigate(`/shop?${params.toString()}`);
        setIsSuggestionsOpen(false);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/');
    };

    return (
        <header className={`header-area header-style-1 header-height-2 ${isSticky ? 'sticky-bar' : ''}`} style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            height: '103px',
            backgroundColor: '#FFFFFF',
            zIndex: 1000,
            boxShadow: isSticky ? '0 8px 20px rgba(0, 0, 0, 0.05)' : 'none',
            borderBottom: '1px solid #f1f1f1',
            transition: 'box-shadow 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center'
        }}>
            {/* Header Middle */}
            <div className="header-middle d-none d-lg-block" style={{ width: '100%' }}>
                <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
                    <div className="header-wrap" style={{ display: 'flex', alignItems: 'center', height: '103px', width: '100%', gap: '25px' }}>
                        {/* Logo */}
                        <div className="logo logo-width-1" style={{ flexShrink: 0, padding: 0, margin: 0 }}>
                            <Link to="/"><img src="/assets/imgs/theme/icons/logo.png" alt="YogisFarms" style={{ width: '90px', display: 'block' }} /></Link>
                        </div>

                        {/* Navigation Menu */}
                        <div className="header-nav d-none d-lg-flex" style={{ flexShrink: 1, marginRight: 'auto', padding: 0, margin: 0 }}>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                .logo.logo-width-1 { padding: 0 !important; margin: 0 !important; }
                                .main-menu-padding-1 { padding: 0 !important; margin: 0 !important; }
                                .header-nav li {
                                    margin: 0 !important;
                                    padding: 0 !important;
                                }
                                .header-nav .nav-link { 
                                    color: #0A6738 !important; 
                                    transition: all 0.3s ease !important;
                                    padding: 0 8px !important;
                                }
                                .header-nav .nav-link:hover { 
                                    color: #B2D33D !important; 
                                }
                                .header-nav .nav-link.active { 
                                    color: #B2D33D !important; 
                                    font-weight: 700 !important;
                                }
                                .search-btn-no-radius {
                                    border-radius: 0 !important;
                                }
                            `}} />
                            <div className="main-menu main-menu-padding-1 main-menu-lh-2 d-none d-lg-block font-heading">
                                <nav>
                                    <ul style={{ display: 'flex', gap: '6px', margin: 0, padding: 0, listStyle: 'none', whiteSpace: 'nowrap' }}>
                                        <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', fontWeight: 600 }}>Home</Link></li>
                                        <li><Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', fontWeight: 600 }}>About Us</Link></li>
                                        <li><Link to="/deals" className={`nav-link ${isActive('/deals') ? 'active' : ''}`} style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', fontWeight: 600 }}>Deals</Link></li>
                                        <li><Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`} style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', fontWeight: 600 }}>Category</Link></li>
                                        <li><Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', fontWeight: 600 }}>Contact Us</Link></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>

                        {/* Search Bar - Flexibly sized */}
                        <div ref={searchRef} style={{ flex: 1, maxWidth: '450px', minWidth: '200px', flexShrink: 1, position: 'relative' }}>
                            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: '5px', height: '45px', border: '1px solid #E2E2E2', width: '100%' }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCatOpen(!catOpen); }}
                                        style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '45px', cursor: 'pointer', borderRight: '1px solid #D9D9D9', gap: '6px', minWidth: '80px' }}
                                    >
                                        <span style={{ fontSize: '12px', color: '#555', fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' }}>{selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'All' : 'All'}</span>
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#0A6738" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                    {catOpen && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, width: '200px', backgroundColor: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', borderRadius: '0 0 8px 8px', zIndex: 9999, padding: '8px 0', maxHeight: '300px', overflowY: 'auto' }}>
                                            <div
                                                onClick={() => { setSelectedCategory(''); setCatOpen(false); }}
                                                style={{ display: 'block', padding: '8px 20px', color: !selectedCategory ? '#0A6738' : '#333', fontSize: '13px', cursor: 'pointer', fontWeight: !selectedCategory ? 700 : 400, backgroundColor: !selectedCategory ? '#f0f8f0' : 'transparent', fontFamily: 'Poppins, sans-serif' }}
                                            >
                                                All Categories
                                            </div>
                                            {categories.map(cat => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => { setSelectedCategory(cat.slug); setCatOpen(false); }}
                                                    style={{ display: 'block', padding: '8px 20px', color: selectedCategory === cat.slug ? '#0A6738' : '#333', fontSize: '13px', cursor: 'pointer', fontWeight: selectedCategory === cat.slug ? 700 : 400, backgroundColor: selectedCategory === cat.slug ? '#f0f8f0' : 'transparent', fontFamily: 'Poppins, sans-serif', transition: 'background-color 0.2s' }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = selectedCategory === cat.slug ? '#f0f8f0' : 'transparent'}
                                                >
                                                    {cat.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search for Product" style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none', background: 'transparent', padding: '0 10px', fontSize: '13px', fontFamily: 'Poppins, sans-serif', color: '#333', height: '100%' }} />
                                <button type="submit" className="search-btn-no-radius" style={{ flexShrink: 0, width: '90px', height: '45px', background: '#0A6738', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderRadius: '0 5px 5px 0' }}>
                                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 14.5L10.5 10.5M12 6.5C12 9.53757 9.53757 12 6.5 12C3.46243 12 1 9.53757 1 6.5C1 3.46243 3.46243 1 6.5 1C9.53757 1 12 3.46243 12 6.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    SEARCH
                                </button>
                            </form>
                            {/* Search Suggestions Dropdown */}
                            {isSuggestionsOpen && suggestions.length > 0 && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', borderRadius: '0 0 8px 8px', zIndex: 9999, padding: '8px 0', maxHeight: '350px', overflowY: 'auto', marginTop: '2px' }}>
                                    {suggestions.map(product => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.slug}`}
                                            onClick={() => { setIsSuggestionsOpen(false); setKeyword(''); }}
                                            style={{ display: 'flex', alignItems: 'center', padding: '8px 15px', color: '#333', fontSize: '13px', textDecoration: 'none', gap: '10px', fontFamily: 'Poppins, sans-serif', transition: 'background-color 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {product.images?.[0] && <img src={getAssetUrl(product.images[0])} alt="" style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />}
                                            <span>{product.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Icons */}
                        <div className="header-action-right" style={{ flexShrink: 0 }}>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                .header-action-right .action-icon-wrapper {
                                    display: flex !important;
                                    flex-direction: column !important;
                                    align-items: center !important;
                                    min-width: 55px !important;
                                    max-width: 65px !important;
                                    cursor: pointer !important;
                                    transition: transform 0.2s ease !important;
                                    padding: 0 !important;
                                    margin: 0 !important;
                                }
                                .header-action-right .action-icon-wrapper:hover {
                                    transform: translateY(-2px) !important;
                                }
                                .header-action-right .action-icon-svg {
                                    width: 24px !important;
                                    height: 24px !important;
                                    fill: #B2D33D !important;
                                }
                                .header-action-right .header-action-icon-2 {
                                    padding: 0 !important;
                                    margin: 0 !important;
                                }
                                .header-action-right .pro-count {
                                    background-color: #0A6738 !important;
                                    color: #fff !important;
                                    width: 14px !important;
                                    height: 14px !important;
                                    font-size: 8px !important;
                                    display: flex !important;
                                    align-items: center !important;
                                    justify-content: center !important;
                                    border-radius: 50% !important;
                                    position: absolute !important;
                                    top: -3px !important;
                                    right: -3px !important;
                                    font-weight: 700 !important;
                                    border: 1px solid #fff !important;
                                    z-index: 2 !important;
                                }
                                .header-action-right .action-label {
                                    color: #B2D33D !important;
                                    font-size: 12px !important;
                                    font-weight: 600 !important;
                                    margin-top: 3px !important;
                                    text-transform: capitalize !important;
                                    white-space: nowrap !important;
                                }
                                .header-action-right .header-action-2 {
                                    gap: 15px !important;
                                    align-items: center !important;
                                }
                                .header-action-right .profile-dropdown-container {
                                    position: relative !important;
                                }
                                .header-action-right .profile-dropdown {
                                    position: absolute !important;
                                    top: 100% !important;
                                    right: 0 !important;
                                    padding-top: 15px !important;
                                    opacity: 0 !important;
                                    visibility: hidden !important;
                                    transition: all 0.3s ease !important;
                                    z-index: 1000 !important;
                                }
                                .header-action-right .profile-dropdown-container:hover .profile-dropdown {
                                    opacity: 1 !important;
                                    visibility: visible !important;
                                }
                                .header-action-right .sign-in-btn {
                                    flex-direction: row !important;
                                    background: #fff !important;
                                    border: 1px solid #eee !important;
                                    padding: 12px 20px !important;
                                    border-radius: 10px !important;
                                    box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important;
                                    gap: 10px !important;
                                    min-width: 140px !important;
                                    display: flex !important;
                                    align-items: center !important;
                                    text-decoration: none !important;
                                }
                                .header-action-right .sign-in-btn .action-label {
                                    margin-top: 0 !important;
                                    color: #253D4E !important;
                                    font-size: 14px !important;
                                    font-weight: 600 !important;
                                }
                                .header-action-right .sign-in-btn:hover {
                                    background: #f9f9f9 !important;
                                    border-color: #0A6738 !important;
                                }
                                .header-action-right .logged-in-menu {
                                    background: #fff !important;
                                    border: 1px solid #eee !important;
                                    border-radius: 10px !important;
                                    box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important;
                                    min-width: 200px !important;
                                    padding: 10px 0 !important;
                                }
                                .header-action-right .logged-in-menu ul {
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    list-style: none !important;
                                }
                                .header-action-right .logged-in-menu li {
                                    padding: 0 !important;
                                    margin: 0 !important;
                                }
                                .header-action-right .logged-in-menu a {
                                    display: flex !important;
                                    align-items: center !important;
                                    padding: 10px 20px !important;
                                    color: #253D4E !important;
                                    font-size: 14px !important;
                                    font-weight: 500 !important;
                                    text-decoration: none !important;
                                    transition: background-color 0.2s !important;
                                }
                                .header-action-right .logged-in-menu a:hover {
                                    background-color: #f0f8f0 !important;
                                    color: #0A6738 !important;
                                }
                                .header-action-right .logged-in-menu svg {
                                    width: 18px !important;
                                    height: 18px !important;
                                    margin-right: 12px !important;
                                    fill: currentColor !important;
                                }
                            `}} />
                            <div className="header-action-2" style={{ display: 'flex', gap: '15px' }}>
                                <div className="header-action-icon-2">
                                    <Link to="/wishlist" className="action-icon-wrapper">
                                        <div className="position-relative">
                                            <svg className="action-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                            {wishlist?.length > 0 && <span className="pro-count">{wishlist.length}</span>}
                                        </div>
                                        <span className="action-label">Wishlist</span>
                                    </Link>
                                </div>
                                <div className="header-action-icon-2">
                                    <Link to="/cart" className="action-icon-wrapper">
                                        <div className="position-relative">
                                            <svg className="action-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                                            </svg>
                                            {cartCount > 0 && <span className="pro-count">{cartCount}</span>}
                                        </div>
                                        <span className="action-label">Add Cart</span>
                                    </Link>
                                </div>
                                <div className="header-action-icon-2 profile-dropdown-container">
                                    <Link to={user ? '/dashboard' : '/login'} className="action-icon-wrapper">
                                        <div className="position-relative">
                                            <svg className="action-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                        <span className="action-label">Profile</span>
                                    </Link>
                                    {user ? (
                                        <div className="profile-dropdown">
                                            <div className="logged-in-menu">
                                                <ul>
                                                    <li>
                                                        <Link to="/dashboard">
                                                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                                            My Account
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/dashboard?tab=orders">
                                                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                                                            Orders
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/track-order">
                                                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                                                            Track Order
                                                        </Link>
                                                    </li>
                                                    <li style={{ borderTop: '1px solid #eee' }}>
                                                        <a href="#!" onClick={handleLogout}>
                                                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                                                            Logout
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="profile-dropdown">
                                            <Link to="/login" className="sign-in-btn">
                                                <img src={loginIcon} alt="Login" style={{ width: '18px', height: '18px' }} />
                                                <span className="action-label">Login</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav (Mobile Only) */}
            <div className={`header-bottom header-bottom-bg-color sticky-bar d-lg-none ${isSticky ? 'stick' : ''}`}>
                <div className="container">
                    <div className="header-wrap header-space-between position-relative">
                        <div className="logo logo-width-1 d-block d-lg-none pt-1">
                            <Link to="/"><img src="/assets/imgs/theme/logo.png" alt="YogisFarms" /></Link>
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
                                <Link to={user ? '/dashboard' : '/login'} onClick={() => setIsMobileMenuOpen(false)}><i className="fi-rs-user"></i> {user ? 'My Account' : 'Login'} </Link>
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
