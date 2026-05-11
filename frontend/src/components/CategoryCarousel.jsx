import React from 'react';
import SliderComponent from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl } from '../api';

const Slider = SliderComponent.default ? SliderComponent.default : SliderComponent;

const CategoryCarousel = ({ categories }) => {
    const navigate = useNavigate();

    // Fallback logic for empty database
    const displayCategories = categories && categories.length > 0 ? categories : [
        { id: 'fallback_1', name: 'Dal\'s', slug: '#', image: '/src/assets/figma/img_6.png' },
        { id: 'fallback_2', name: 'Oil', slug: '#', image: '/src/assets/figma/img_1.png' },
        { id: 'fallback_3', name: 'Tofu', slug: '#', image: '/src/assets/figma/img_10.png' },
        { id: 'fallback_4', name: 'Millet', slug: '#', image: '/src/assets/figma/img_19.png' },
        { id: 'fallback_5', name: 'Multigrain Atta', slug: '#', image: '/src/assets/figma/img_20.png' },
        { id: 'fallback_6', name: 'Lokwan Wheat', slug: '#', image: '/src/assets/figma/img_20.png' },
        { id: 'fallback_7', name: 'Moong Dal', slug: '#', image: '/src/assets/figma/img_16.png' },
        { id: 'fallback_8', name: 'Sunflower Oil', slug: '#', image: '/src/assets/figma/img_11.png' }
    ];

    const categorySettings = {
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 8,
        slidesToScroll: 1,
        autoplay: true,
        arrows: true
    };

    return (
        <section 
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '60px 0',
                backgroundColor: 'var(--yf-bg-white)'
            }}
        >
            <div 
                style={{
                    width: '1440px', // Desktop focus
                    maxWidth: '100%',
                    padding: '0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <h3 style={{ 
                        color: 'var(--yf-primary-dark)', 
                        fontSize: '25px', 
                        fontFamily: 'var(--font-poppins)', 
                        fontWeight: '600',
                        margin: 0,
                        textTransform: 'capitalize'
                    }}>
                        Featured Categories
                    </h3>
                </div>

                <div style={{ margin: '0 -10px' }}>
                    <Slider {...categorySettings}>
                        {displayCategories.map(cat => (
                            <div key={cat.id} style={{ padding: '0 10px', outline: 'none' }}>
                                <figure 
                                    onClick={() => navigate(String(cat.id).startsWith('fallback') ? '#' : `/shop?category=${cat.slug}`)}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '15px',
                                        padding: '0',
                                        margin: '5px',
                                        transition: 'transform 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        width: '112px',
                                        height: '112px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '9px',
                                        border: '1px solid #F9F9F9',
                                        backgroundColor: 'var(--yf-bg-white)',
                                        overflow: 'hidden'
                                    }}>
                                        <img 
                                            src={String(cat.id).startsWith('fallback') ? cat.image : getAssetUrl(cat.image)} 
                                            alt={cat.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                    <h6 style={{ 
                                        color: 'var(--yf-primary-dark)', 
                                        fontSize: '13px', 
                                        fontFamily: 'var(--font-poppins)', 
                                        fontWeight: '600',
                                        margin: 0,
                                        textAlign: 'center'
                                    }}>
                                        {cat.name}
                                    </h6>
                                </figure>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default CategoryCarousel;
