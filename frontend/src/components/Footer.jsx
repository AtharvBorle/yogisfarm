import React from 'react';
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

const Footer = () => {
    const { user } = useAuth();
    
    return (
        <footer style={{ 
            backgroundImage: `url(${footerBg})`, 
            backgroundSize: '100% 100%', 
            backgroundPosition: 'top center', 
            backgroundRepeat: 'no-repeat',
            paddingTop: '80px',
            position: 'relative',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div className="row">
                    {/* Column 1: Logo & Mission */}
                    <div className="col-lg-3 col-md-6 mb-4">
                        <div className="logo mb-20">
                            <Link to="/"><img src="/assets/imgs/theme/icons/logo-new.svg" alt="YogisFarms" style={{ width: '150px' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/imgs/theme/logo.png'; }} /></Link>
                        </div>
                        <p style={{ color: '#000', fontSize: '13px', lineHeight: '24px', fontWeight: 500, marginBottom: '20px' }}>
                            Welcome to YogisFarm Solutions, where we're revolutionizing agriculture for a brighter tomorrow. Our mission is simple: to cultivate a sustainable future through innovative farming practices.
                        </p>
                        <div className="social-icons" style={{ display: 'flex', gap: '15px' }}>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={instagramIcon} alt="Instagram" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                            </a>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={facebookIcon} alt="Facebook" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                            </a>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={youtubeIcon} alt="YouTube" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Legal */}
                    <div className="col-lg-2 col-md-3 mb-4">
                        <h4 style={{ color: '#0A6738', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-2"><Link to="/terms" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Terms and Conditions</Link></li>
                            <li className="mb-2"><Link to="/return-policy" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Return, Refund and cancellation Policy</Link></li>
                            <li className="mb-2"><Link to="/privacy" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Privacy Policy</Link></li>
                            <li className="mb-2"><Link to="/shipping" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Account */}
                    <div className="col-lg-2 col-md-3 mb-4">
                        <h4 style={{ color: '#0A6738', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Account</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-2"><Link to={user ? "/dashboard" : "/login"} style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Sign In</Link></li>
                            <li className="mb-2"><Link to="/cart" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>View Cart</Link></li>
                            <li className="mb-2"><Link to="/wishlist" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>My Wishlist</Link></li>
                            <li className="mb-2"><Link to="/track-order" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Track Order</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Popular */}
                    <div className="col-lg-2 col-md-3 mb-4">
                        <h4 style={{ color: '#0A6738', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Popular</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-2"><Link to="/about-us" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>About us</Link></li>
                            <li className="mb-2"><Link to="/shop" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Shop</Link></li>
                            <li className="mb-2"><Link to="/contact-us" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Contact us</Link></li>
                            <li className="mb-2"><Link to="/dashboard" style={{ color: '#000', fontSize: '14px', fontWeight: 500 }}>Profile</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: Contact */}
                    <div className="col-lg-3 col-md-6 mb-4">
                        <h4 style={{ color: '#0A6738', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Contact</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li className="mb-3" style={{ display: 'flex', alignItems: 'flex-start', color: '#000', fontSize: '14px', fontWeight: 500 }}>
                                <img src={locationIcon} alt="Location" style={{ width: '18px', marginRight: '10px', marginTop: '2px', flexShrink: 0 }} />
                                <span><strong>YogisFarms</strong><br />S.No 18, Saikrupa Bunglow,<br />Sudarshan Park society,<br />Ingale Nagar, Warje, Pune 411058</span>
                            </li>
                            <li className="mb-3" style={{ display: 'flex', alignItems: 'center', color: '#000', fontSize: '14px', fontWeight: 500 }}>
                                <img src={callIcon} alt="Phone" style={{ width: '18px', marginRight: '10px', flexShrink: 0 }} />
                                <a href="tel:+919119501177" style={{ color: '#000' }}>+91 9119501177</a>
                            </li>
                            <li className="mb-3" style={{ display: 'flex', alignItems: 'center', color: '#000', fontSize: '14px', fontWeight: 500 }}>
                                <img src={mailIcon} alt="Email" style={{ width: '18px', marginRight: '10px', flexShrink: 0 }} />
                                <a href="mailto:info@yogisfarms.com" style={{ color: '#000' }}>info@yogisfarms.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Copyright Bar */}
            <div style={{ width: '100%', textAlign: 'center', padding: '15px 0', marginTop: 'auto', zIndex: 10 }}>
                <p style={{ color: '#A5D6A7', fontSize: '14px', margin: 0 }}>Copyright © 2026 YogisFarms</p>
            </div>
        </footer>
    );
};

export default Footer;
