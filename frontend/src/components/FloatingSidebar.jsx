import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import whatsappIcon from '../assets/figma/image_find/whatsapp.svg';
import arrowIcon from '../assets/figma/image_find/arrow.svg';

const FloatingSidebar = () => {
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#FFF',
            border: '1px solid #EFEFEF',
            borderRight: 'none',
            borderRadius: '15px 0 0 15px',
            padding: '15px 10px',
            boxShadow: '-5px 0 15px rgba(0,0,0,0.05)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        }}>
            {/* Wishlist */}
            <Link to="/wishlist" style={{ position: 'relative', display: 'block' }}>
                <svg style={{ width: '28px', height: '28px', fill: '#B2D33D' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    backgroundColor: '#0A6738',
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                }}>
                    {wishlist?.length || 0}
                </span>
            </Link>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', display: 'block' }}>
                <svg style={{ width: '28px', height: '28px', fill: '#B2D33D' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#0A6738',
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                }}>
                    {cartCount || 0}
                </span>
            </Link>

            {/* WhatsApp */}
            <a href="https://wa.me/919119501177" target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                <img src={whatsappIcon} alt="WhatsApp" style={{ width: '28px', height: '28px' }} />
            </a>

            {/* Scroll to Top Arrow */}
            <button 
                onClick={scrollToTop} 
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: 0, 
                    cursor: 'pointer',
                    display: 'block',
                    marginTop: '5px'
                }}
            >
                <img src={arrowIcon} alt="Scroll to Top" style={{ width: '20px', height: '20px' }} />
            </button>
        </div>
    );
};

export default FloatingSidebar;
