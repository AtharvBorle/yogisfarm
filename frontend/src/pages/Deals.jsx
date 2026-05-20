import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import ProductCard from '../components/ProductCard';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';
import SliderComponent from 'react-slick';
import { ChevronRight } from 'lucide-react';

const Slider = SliderComponent.default ? SliderComponent.default : SliderComponent;
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Import Figma assets
import bestDealsR1C1 from '../assets/figma/image_find/Best_deals_R1_C1.png';
import bestDealsR1C2 from '../assets/figma/image_find/Best_deals_R1_C2.png';
import bestDealsR2Left from '../assets/figma/image_find/Best_deals_R2_Left_Side.png';
import bestDealsR2Mid from '../assets/figma/image_find/Best_deals_R2_Mid.png';
import bestDealsR2Right from '../assets/figma/image_find/Best_deals_R2_Right_Side.png';

const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <>
            <style>{`
                .slick-next::before, .slick-prev::before {
                    display: none !important;
                }
            `}</style>
            <div
                className={className}
                style={{ 
                    ...style, 
                    display: "flex", 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: "#F5F5F5", 
                    borderRadius: "50%", 
                    width: "50px", 
                    height: "50px",
                    zIndex: 2,
                    right: "-25px",
                    cursor: 'pointer',
                    transition: '0.3s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
                onClick={onClick}
            >
                <ChevronRight color="#000" size={24} />
            </div>
        </>
    );
};

const Deals = () => {
    const [popularProducts, setPopularProducts] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products?popular=true&limit=12').then(res => {
            if(res.data.status) setPopularProducts(res.data.products);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });

        api.get('/sections').then(res => {
            if (res.data.status) setSections(res.data.sections);
        }).catch(err => console.error(err));
    }, []);

    const getSliderLink = (slider) => {
        if (!slider.linkType || slider.linkType === 'none') return '#';
        if (slider.linkType === 'url') return slider.link || '#';
        if (slider.linkType === 'category') return `/shop?category=${slider.link}`;
        if (slider.linkType === 'brand') return `/shop?brand=${slider.link}`;
        if (slider.linkType === 'product') return `/product/${slider.link}`;
        return slider.link || '#';
    };

    const dealSections = sections.filter(s => s.isDeal && s.page === 'deals');
    const dr1c1 = dealSections.find(s => s.position === 'DR1C1');
    const dr1c2 = dealSections.find(s => s.position === 'DR1C2');
    const dr2c1 = dealSections.find(s => s.position === 'DR2C1');
    const dr2mid = dealSections.find(s => s.position === 'DR2Mid');
    const dr2c2 = dealSections.find(s => s.position === 'DR2C2');

    const BestDealsSection = () => (
        <section className="section-padding pb-5">
            <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                {/* Row 1: Two Wide Banners */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ width: '606px' }}>
                        {dr1c1 ? (
                            <a href={getSliderLink(dr1c1)}>
                                <img src={getAssetUrl(dr1c1.image)} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R1 C1" />
                            </a>
                        ) : (
                            <img src={bestDealsR1C1} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R1 C1" />
                        )}
                    </div>
                    <div style={{ width: '606px' }}>
                        {dr1c2 ? (
                            <a href={getSliderLink(dr1c2)}>
                                <img src={getAssetUrl(dr1c2.image)} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R1 C2" />
                            </a>
                        ) : (
                            <img src={bestDealsR1C2} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R1 C2" />
                        )}
                    </div>
                </div>

                {/* Row 2: Ad | Video | Ad */}
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ width: '280px' }}>
                        {dr2c1 ? (
                            <a href={getSliderLink(dr2c1)}>
                                <img src={getAssetUrl(dr2c1.image)} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R2 Left" />
                            </a>
                        ) : (
                            <img src={bestDealsR2Left} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R2 Left" />
                        )}
                    </div>
                    <div style={{ width: '628px', position: 'relative' }}>
                        {dr2mid ? (
                            <a href={getSliderLink(dr2mid)}>
                                <img src={getAssetUrl(dr2mid.image)} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R2 Mid" />
                            </a>
                        ) : (
                            <img src={bestDealsR2Mid} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R2 Mid" />
                        )}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', border: '2px solid #fff', backdropFilter: 'blur(4px)' }}>
                            <svg width="32" height="32" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    <div style={{ width: '280px' }}>
                        {dr2c2 ? (
                            <a href={getSliderLink(dr2c2)}>
                                <img src={getAssetUrl(dr2c2.image)} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R2 Right" />
                            </a>
                        ) : (
                            <img src={bestDealsR2Right} style={{ width: '100%', borderRadius: '15px', height: 'auto' }} alt="Best Deal R2 Right" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <main className="main">
            {/* Standard Breadcrumb */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Pages
                        <span></span> Deals
                    </div>
                </div>
            </div>

            <div className="page-content pt-50">
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                    <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 700, marginBottom: '30px' }}>Best Deals</h3>
                </div>

                {/* Best Deals Repeated Twice */}
                <BestDealsSection />
                <BestDealsSection />

                {/* Popular Products Scrollable Slider */}
                <section className="section-padding pb-5">
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '25px', fontWeight: 600, marginBottom: '30px', borderBottom: '2px solid #F2FFD6', paddingBottom: '10px', display: 'inline-block' }}>Popular Products</h3>
                        
                        <div className="popular-products-slider" style={{ padding: '0 20px' }}>
                            {loading ? (
                                <p>Loading products...</p>
                            ) : (
                                <Slider
                                    dots={false}
                                    infinite={popularProducts.length > 4}
                                    speed={1000}
                                    autoplay={true}
                                    autoplaySpeed={3000}
                                    slidesToShow={4}
                                    slidesToScroll={1}
                                    arrows={true}
                                    nextArrow={<NextArrow />}
                                    prevArrow={<div style={{ display: 'none' }}></div>}
                                    responsive={[
                                        {
                                            breakpoint: 1200,
                                            settings: { slidesToShow: 3 }
                                        },
                                        {
                                            breakpoint: 992,
                                            settings: { slidesToShow: 2 }
                                        },
                                        {
                                            breakpoint: 576,
                                            settings: { slidesToShow: 1 }
                                        }
                                    ]}
                                >
                                    {popularProducts.map(product => (
                                        <div key={product.id} style={{ padding: '0 12px' }}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </Slider>
                            )}
                        </div>
                    </div>
                </section>

                {/* Core Pillars */}
                <CorePillars />

                {/* Partner Logos */}
                <PartnerLogos />
            </div>

            <FloatingSidebar />
        </main>
    );
};

export default Deals;
