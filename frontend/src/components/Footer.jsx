import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import assets
import footerBg from '../assets/footer.png';
import instagramIcon from '../assets/figma/image_find/instagram.svg';
import facebookIcon from '../assets/figma/image_find/facebook.svg';
import youtubeIcon from '../assets/figma/image_find/youtube.svg';
import locationIcon from '../assets/figma/image_find/location.svg';
import callIcon from '../assets/figma/image_find/call.svg';
import mailIcon from '../assets/figma/image_find/mail.svg';
import footerLogo from '../assets/figma/image_find/Yogis-Farms-Logo-footer.svg';

const Footer = () => {
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return (
        <>
        <style dangerouslySetInnerHTML={{ __html: `
            .footer-wrapper {
                background-image: url(${footerBg});
                background-size: cover;
                background-position: bottom center;
                background-repeat: no-repeat;
                padding-top: 60px;
                padding-bottom: 0px;
                position: relative;
                min-height: auto;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .footer-wrapper .container {
                padding-bottom: 140px;
            }
            @media (max-width: 767px) {
                .footer-wrapper {
                    background-color: #EBF9C5 !important;
                    background-image: none !important;
                    padding-top: 30px !important;
                    padding-bottom: 0px !important;
                }
                .footer-wrapper .container {
                    padding-bottom: 0px !important;
                }
                .footer-col-title {
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    margin-bottom: 12px !important;
                    border-bottom: none !important;
                    padding-bottom: 0 !important;
                }
                .footer-col-content {
                    margin-bottom: 25px;
                }
                .footer-col-content ul li {
                    margin-bottom: 8px !important;
                }
                .footer-col-content ul li a {
                    font-size: 10px !important;
                    font-weight: 400 !important;
                    color: #000000 !important;
                }
                .footer-logo {
                    text-align: left !important;
                }
                .footer-logo img {
                    height: 78px !important;
                    width: auto !important;
                }
                .footer-socials {
                    justify-content: flex-start !important;
                    gap: 10px !important;
                }
                .footer-socials img {
                    width: 30px !important;
                    height: 30px !important;
                }
                .footer-mission {
                    font-size: 10px !important;
                    line-height: 13px !important;
                    font-weight: 500 !important;
                    color: #000000 !important;
                    margin-bottom: 15px !important;
                }
                .footer-contact-item {
                    font-size: 12px !important;
                    font-weight: 400 !important;
                    color: #000000 !important;
                    line-height: 1.3 !important;
                }
                .footer-address-item {
                    font-size: 10px !important;
                    line-height: 1.35 !important;
                }
                .footer-policy-link-tight {
                    display: inline-block !important;
                    line-height: 1.15 !important;
                }
                .footer-contact-item strong {
                    font-weight: 600 !important;
                }
                .footer-copyright {
                    color: #0A6738 !important;
                    font-size: 11px !important;
                }
            }
        `}} />
        <footer className="footer-wrapper">
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div className="row">
                    {/* Column 1: Logo & Mission - Mobile order 5 (bottom) */}
                    <div className="col-lg-3 col-md-6 col-12 mb-4 footer-col-content order-5 order-lg-1">
                        <div className="logo mb-20 footer-logo">
                            <Link to="/"><img src={footerLogo} alt="YogisFarms" style={{ height: '80px', width: 'auto' }} /></Link>
                        </div>
                        <p className="footer-mission" style={{ color: '#000', fontSize: '13px', lineHeight: '24px', fontWeight: 500, marginBottom: '20px' }}>
                            Welcome to YogisFarms, where we're revolutionizing agriculture for a brighter tomorrow. Our mission is simple: to cultivate a sustainable future through innovative farming practices.
                        </p>
                        <div className="social-icons footer-socials" style={{ display: 'flex', gap: '15px' }}>
                            <a href="https://www.instagram.com/yogisfarms/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={instagramIcon} alt="Instagram" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61589239487950" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={facebookIcon} alt="Facebook" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                            </a>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={youtubeIcon} alt="YouTube" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Legal - Mobile order 1 (top left) */}
                    <div className="col-lg-2 col-md-3 col-6 mb-4 footer-col-content order-1 order-lg-2">
                        <h4 className="footer-col-title global-heading-style" style={{ color: '#0A6738', fontWeight: 700, marginBottom: '20px' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-2"><Link to="/terms" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Terms and Conditions</Link></li>
                            <li className="mb-2"><Link to="/return-policy" className="footer-policy-link-tight" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Return, Refund and cancellation Policy</Link></li>
                            <li className="mb-2"><Link to="/privacy" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Privacy Policy</Link></li>
                            <li className="mb-2"><Link to="/shipping" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Account - Mobile order 2 (top right) */}
                    <div className="col-lg-2 col-md-3 col-6 mb-4 footer-col-content order-2 order-lg-3">
                        <h4 className="footer-col-title global-heading-style" style={{ color: '#0A6738', fontWeight: 700, marginBottom: '20px' }}>Account</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-2"><Link to={user ? "/dashboard" : "/login"} style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Sign In</Link></li>
                            <li className="mb-2"><Link to="/cart" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>View Cart</Link></li>
                            <li className="mb-2"><Link to="/wishlist" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>My Wishlist</Link></li>
                            <li className="mb-2"><Link to="/track-order" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Track Order</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Popular - Mobile order 4 (second row right) */}
                    <div className="col-lg-2 col-md-3 col-6 mb-4 footer-col-content order-4 order-lg-4">
                        <h4 className="footer-col-title global-heading-style" style={{ color: '#0A6738', fontWeight: 700, marginBottom: '20px' }}>Popular</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-2"><Link to="/about-us" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>About us</Link></li>
                            <li className="mb-2"><Link to="/shop" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Shop</Link></li>
                            <li className="mb-2"><Link to="/contact-us" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Contact us</Link></li>
                            <li className="mb-2"><Link to="/dashboard" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Profile</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: Contact - Mobile order 3 (second row left) */}
                    <div className="col-lg-3 col-md-6 col-6 mb-4 footer-col-content order-3 order-lg-5">
                        <h4 className="footer-col-title global-heading-style" style={{ color: '#0A6738', fontWeight: 700, marginBottom: '20px' }}>Contact</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-3 footer-contact-item footer-address-item" style={{ display: 'flex', alignItems: 'flex-start', color: '#000', fontSize: '14px', fontWeight: 500 }}>
                                <img src={locationIcon} alt="Location" style={{ width: '18px', marginRight: '10px', marginTop: '2px', flexShrink: 0 }} />
                                <span><strong>YogisFarms</strong><br />S.No 18, Saikrupa Bunglow,<br />Sudarshan Park society,<br />Ingale Nagar, Warje, Pune 411058</span>
                            </li>
                            <li className="mb-3 footer-contact-item" style={{ display: 'flex', alignItems: 'center', color: '#000', fontSize: '14px', fontWeight: 500 }}>
                                <img src={callIcon} alt="Phone" style={{ width: '18px', marginRight: '10px', flexShrink: 0 }} />
                                <a href="tel:+919119501177" style={{ color: '#000' }}>+91 9119501177</a>
                            </li>
                            <li className="mb-3 footer-contact-item" style={{ display: 'flex', alignItems: 'center', color: '#000', fontSize: '14px', fontWeight: 500 }}>
                                <img src={mailIcon} alt="Email" style={{ width: '18px', marginRight: '10px', flexShrink: 0 }} />
                                <a href="mailto:info@yogisfarms.com" style={{ color: '#000' }}>info@yogisfarms.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Mobile-only landscape background image block at bottom of footer */}
            {isMobile && (
                <div style={{ width: '100%', overflow: 'hidden', marginTop: '20px' }}>
                    <img src={footerBg} alt="Footer Landscape" style={{ width: '100%', height: '180px', aspectRatio: '359/179', objectFit: 'cover', display: 'block' }} />
                </div>
            )}

            {/* Copyright Bar */}
            <div style={{ width: '100%', textAlign: 'center', padding: '15px 0', marginTop: 'auto', zIndex: 10 }}>
                <p className="footer-copyright" style={{ color: isMobile ? '#0A6738' : '#ffffff', fontSize: isMobile ? '11px' : '14px', margin: 0 }}>Copyright © 2026 YogisFarms</p>
            </div>
        </footer>
        </>
    );
};

export default Footer;
