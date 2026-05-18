import React from 'react';
import { getAssetUrl } from '../api';

const BannerGrid = ({ sliders, getSliderLink, columns = 4 }) => {
    // Fallback logic for empty database
    const displaySliders = sliders && sliders.length > 0 ? sliders : [
        { id: 'fallback_1', name: 'Promo 1', image: '/src/assets/figma/img_2.png', linkType: 'none' },
        { id: 'fallback_2', name: 'Promo 2', image: '/src/assets/figma/img_2.png', linkType: 'none' },
        { id: 'fallback_3', name: 'Promo 3', image: '/src/assets/figma/img_2.png', linkType: 'none' }
    ].slice(0, columns);

    return (
        <section 
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '30px 0',
                backgroundColor: 'var(--yf-bg-white)'
            }}
        >
            <div 
                className="row flex-nowrap flex-md-wrap overflow-auto"
                style={{
                    width: '1440px', // Desktop focus
                    maxWidth: '100%',
                    padding: '0 20px',
                    marginBottom: '0',
                    
                }}
            >
                {displaySliders.map(slider => (
                    <div 
                        key={slider.id} 
                        className="col-10 col-sm-6 col-md-4 col-lg-3 mb-3"
                        style={{
                            borderRadius: '9px',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            flexShrink: 0,
                            
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <a href={String(slider.id).startsWith('fallback') ? '#' : getSliderLink(slider)} style={{ display: 'block', width: '100%', height: '100%' }}>
                            <img 
                                src={String(slider.id).startsWith('fallback') ? slider.image : getAssetUrl(slider.image)} 
                                alt={slider.name || 'Banner'} 
                                style={{ 
                                    width: '100%', 
                                    height: 'auto',
                                    objectFit: 'cover',
                                    display: 'block'
                                }} 
                            />
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BannerGrid;
