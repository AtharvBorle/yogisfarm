import React from 'react';
import SliderComponent from 'react-slick';
import ProductCard from './ProductCard';

const Slider = SliderComponent.default ? SliderComponent.default : SliderComponent;

const ProductCarousel = ({ products, title }) => {
    // Fallback logic for empty database
    const displayProducts = products && products.length > 0 ? products : [
        { id: 'fallback_1', name: 'Organic Moong Dal', slug: '#', image: '/src/assets/figma/img_16.png', price: 349, salePrice: 299, variants: [{stock: 10, price: 349, salePrice: 299}] },
        { id: 'fallback_2', name: 'Freshly Ground Atta', slug: '#', image: '/src/assets/figma/img_20.png', price: 400, salePrice: 350, variants: [{stock: 10, price: 400, salePrice: 350}] },
        { id: 'fallback_3', name: 'Lakdi Ghana Sunflower Oil', slug: '#', image: '/src/assets/figma/img_11.png', price: 200, salePrice: 180, variants: [{stock: 10, price: 200, salePrice: 180}] },
        { id: 'fallback_4', name: 'Sakthi Ghani Groundnut Oil', slug: '#', image: '/src/assets/figma/img_1.png', price: 250, salePrice: 220, variants: [{stock: 10, price: 250, salePrice: 220}] },
        { id: 'fallback_5', name: 'Organic Toor Dal', slug: '#', image: '/src/assets/figma/img_23.png', price: 150, salePrice: 130, variants: [{stock: 10, price: 150, salePrice: 130}] }
    ];

    const productSliderSettings = {
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 5,
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
                padding: '40px 0',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ 
                        color: 'var(--yf-primary-dark)', 
                        fontSize: '25px', 
                        fontFamily: 'var(--font-poppins)', 
                        fontWeight: '600',
                        margin: 0,
                        textTransform: 'capitalize'
                    }}>
                        {title}
                    </h3>
                </div>

                <div style={{ margin: '0 -15px' }}>
                    <Slider {...productSliderSettings}>
                        {displayProducts.map(product => (
                            <div key={product.id} style={{ padding: '0 15px', outline: 'none' }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default ProductCarousel;
