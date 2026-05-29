import React from 'react';
import SliderComponent from 'react-slick';
import { getAssetUrl } from '../api';

const Slider = SliderComponent.default ? SliderComponent.default : SliderComponent;

const HeroSection = ({ sliders, getSliderLink }) => {
    // Fallback logic for empty database
    const displaySliders = sliders && sliders.length > 0 ? sliders : [
        { id: 'fallback_1', name: 'Placeholder Banner', image: '/src/assets/figma/img_3.png', linkType: 'none' }
    ];

    const heroSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        fade: true,
        arrows: false,
        customPaging: i => (
            <div
                style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--yf-primary-light)',
                    opacity: 0.5,
                    transition: 'all 0.3s ease',
                    marginTop: '20px'
                }}
                className="custom-dot"
            />
        )
    };

    return (
        <section 
            className="hero-section" 
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '30px 0',
                backgroundColor: 'var(--yf-bg-white)'
            }}
        >
            <div 
                className="hero-container"
                style={{
                    width: '1440px', // Desktop focus
                    maxWidth: '100%',
                    padding: '0 20px',
                    position: 'relative'
                }}
            >
                <div 
                    style={{
                        borderRadius: '9px',
                        overflow: 'hidden',
                        backgroundColor: 'var(--yf-bg-white)'
                    }}
                >
                    <Slider {...heroSettings}>
                        {displaySliders.map(slider => (
                            <div key={slider.id} style={{ display: 'flex', outline: 'none' }}>
                                <a href={String(slider.id).startsWith('fallback') ? '#' : getSliderLink(slider)} style={{ display: 'block', width: '100%' }}>
                                    <img 
                                        src={String(slider.id).startsWith('fallback') ? slider.image : getAssetUrl(slider.image)} 
                                        alt={slider.name || 'Hero Banner'} 
                                        style={{ 
                                            width: '100%', 
                                            height: '361px', // Desktop height matching Figma
                                            objectFit: 'cover',
                                            display: 'block'
                                        }} 
                                    />
                                </a>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
