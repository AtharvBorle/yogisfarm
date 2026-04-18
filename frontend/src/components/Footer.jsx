import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { user } = useAuth();
    
    return (
        <footer className="main">
            <section className="section-padding footer-mid bg-img-footer">
                <div className="container pt-15 pb-20">
                    <div className="row">
                        <div className="col">
                            <div className="widget-about font-md mb-md-3 mb-lg-3 mb-xl-0 wow animate__animated animate__fadeInUp">
                                <div className="logo mb-30">
                                    <Link to="/" className="mb-15"><img src="/assets/imgs/theme/logo.png" alt="Yogis Farm" /></Link>
                                    <p className="font-lg">Yogis Farm - Pure & Natural Farm Products</p>
                                    <div className="mobile-social-icon" style={{ justifyContent: 'start' }}>
                                        <h6>Follow Us</h6>
                                        <a href="#"><img src="/assets/imgs/theme/icons/icon-facebook-white.svg" alt="" /></a>
                                        <a href="#"><img src="/assets/imgs/theme/icons/icon-instagram-white.svg" alt="" /></a>
                                        <a href="#"><img src="/assets/imgs/theme/icons/icon-youtube-white.svg" alt="" /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer-link-widget col wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                            <h4 className="widget-title" style={{ fontSize: '24px', color: '#253D4E', marginBottom: '25px' }}>Legal Pages</h4>
                            <ul className="footer-list mb-sm-5 mb-md-0">
                                <li><Link to="/terms">Terms & Conditions</Link></li>
                                <li><Link to="/return-policy">Return & Refund</Link></li>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/shipping">Shipping Policy</Link></li>
                            </ul>
                        </div>
                        <div className="footer-link-widget col wow animate__animated animate__fadeInUp m-0" data-wow-delay=".2s">
                            <h4 className="widget-title">Account</h4>
                            <ul className="footer-list mb-sm-5 mb-md-0">
                                <li><Link to={user ? "/dashboard" : "/login"}>{user ? "Dashboard" : "Sign In"}</Link></li>
                                <li><Link to="/cart">View Cart</Link></li>
                                <li><Link to="/wishlist">My Wishlist</Link></li>
                                <li><Link to="/track-order">Track Order</Link></li>
                            </ul>
                        </div>
                        <div className="footer-link-widget col wow animate__animated animate__fadeInUp m-0" data-wow-delay=".4s">
                            <h4 className="widget-title">Popular</h4>
                            <ul className="footer-list mb-sm-5 mb-md-0">
                                <li><Link to="/about-us">About Us</Link></li>
                                <li><Link to="/shop">Shop</Link></li>
                                <li><Link to="/contact-us">Contact Us</Link></li>
                                <li><Link to="/deals">Deals</Link></li>
                            </ul>
                        </div>
                        <div className="footer-link-widget col wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                            <h4 className="widget-title">Contact</h4>
                            <ul className="contact-infor footer-list-contact">
                                <li><img src="/assets/imgs/theme/icons/icon-location.svg" alt="Address" /><span>Pune, Maharashtra</span></li>
                                <li><img src="/assets/imgs/theme/icons/icon-contact.svg" alt="Call Us" /><span><a href="tel:9119501177">9119501177</a></span></li>
                                <li><img src="/assets/imgs/theme/icons/icon-email-2.svg" alt="Email" /><span><a href="mailto:info@yogisfarm.in">info@yogisfarm.in</a></span></li>
                            </ul>
                        </div>
                    </div>
                    <p className="font-sm mb-0 text-center">Copyright © 2026 Yogis Farm<br/>Crafted by NeoPace Infotech LLP</p>
                </div>
            </section>
            {/* Bottom landscape visual */}
            <img 
                src="/assets/imgs/theme/btm-bg.jpg" 
                alt="Landscape Foreground" 
                style={{ width: '100%', display: 'block', pointerEvents: 'none', objectFit: 'cover' }} 
            />
        </footer>
    );
};

export default Footer;
