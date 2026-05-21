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

    const BestDealsSection = ({ section = null }) => {
        const scrollRef = React.useRef(null);
        let dealBanners = [];
        if (section && section.image) {
            try {
                dealBanners = JSON.parse(section.image);
            } catch (e) {
                console.error("Failed to parse deal banners JSON on Deals", e);
            }
        }
        const dr1c1 = dealBanners.find(b => b.position === 'DR1C1');
        const dr1c2 = dealBanners.find(b => b.position === 'DR1C2');
        const dr2c1 = dealBanners.find(b => b.position === 'DR2C1');
        const dr2mid = dealBanners.find(b => b.position === 'DR2Mid');
        const dr2c2 = dealBanners.find(b => b.position === 'DR2C2');

        const mobileBanners = [
            { id: 'dr1c1', banner: dr1c1, fallback: bestDealsR1C1, alt: 'Best Deal R1 C1' },
            { id: 'dr1c2', banner: dr1c2, fallback: bestDealsR1C2, alt: 'Best Deal R1 C2' },
            { id: 'dr2c1', banner: dr2c1, fallback: bestDealsR2Left, alt: 'Best Deal R2 Left' },
            { id: 'dr2mid', banner: dr2mid, fallback: bestDealsR2Mid, alt: 'Best Deal R2 Mid', isVideo: true },
            { id: 'dr2c2', banner: dr2c2, fallback: bestDealsR2Right, alt: 'Best Deal R2 Right' },
        ];

        React.useEffect(() => {
            const el = scrollRef.current;
            if (!el) return;

            let isDown = false;
            let startX;
            let scrollLeftVal;

            const onMouseDown = (e) => {
                isDown = true;
                startX = e.pageX - el.offsetLeft;
                scrollLeftVal = el.scrollLeft;
            };
            const onMouseLeave = () => { isDown = false; };
            const onMouseUp = () => { isDown = false; };
            const onMouseMove = (e) => {
                if(!isDown) return;
                e.preventDefault();
                const x = e.pageX - el.offsetLeft;
                const walk = (x - startX) * 2;
                el.scrollLeft = scrollLeftVal - walk;
            };

            const onTouchStart = () => { isDown = true; };
            const onTouchEnd = () => { isDown = false; };

            el.addEventListener('mousedown', onMouseDown);
            el.addEventListener('mouseleave', onMouseLeave);
            el.addEventListener('mouseup', onMouseUp);
            el.addEventListener('mousemove', onMouseMove);
            el.addEventListener('touchstart', onTouchStart, { passive: true });
            el.addEventListener('touchend', onTouchEnd, { passive: true });

            const interval = setInterval(() => {
                if (isDown) return;
                const cardWidth = 280 + 15; // 295px
                const maxScroll = el.scrollWidth - el.clientWidth;
                if (el.scrollLeft >= maxScroll - 10) {
                    el.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const nextPos = Math.floor((el.scrollLeft + cardWidth) / cardWidth) * cardWidth;
                    el.scrollTo({ left: nextPos, behavior: 'smooth' });
                }
            }, 3000);

            return () => {
                el.removeEventListener('mousedown', onMouseDown);
                el.removeEventListener('mouseleave', onMouseLeave);
                el.removeEventListener('mouseup', onMouseUp);
                el.removeEventListener('mousemove', onMouseMove);
                el.removeEventListener('touchstart', onTouchStart);
                el.removeEventListener('touchend', onTouchEnd);
                clearInterval(interval);
            };
        }, [dealBanners]);

        return (
            <section className="section-padding pb-5">
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                    {/* DESKTOP BANNERS GRID — hidden on mobile */}
                    <div className="d-none d-lg-block">
                        {/* Row 1: Two Wide Banners */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '26px', marginBottom: '24px', justifyContent: 'center' }}>
                            <div style={{ flex: '1 1 500px', maxWidth: '605px' }}>
                                {dr1c1 ? (
                                    <a href={getSliderLink(dr1c1)}>
                                        <img src={getAssetUrl(dr1c1.image)} style={{ width: '100%', height: '303px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R1 C1" />
                                    </a>
                                ) : (
                                    <img src={bestDealsR1C1} style={{ width: '100%', height: '303px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R1 C1" />
                                )}
                            </div>
                            <div style={{ flex: '1 1 500px', maxWidth: '605px' }}>
                                {dr1c2 ? (
                                    <a href={getSliderLink(dr1c2)}>
                                        <img src={getAssetUrl(dr1c2.image)} style={{ width: '100%', height: '303px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R1 C2" />
                                    </a>
                                ) : (
                                    <img src={bestDealsR1C2} style={{ width: '100%', height: '303px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R1 C2" />
                                )}
                            </div>
                        </div>

                        {/* Row 2: Ad | Video | Ad */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                            <div style={{ flex: '1 1 240px', maxWidth: '291px' }}>
                                {dr2c1 ? (
                                    <a href={getSliderLink(dr2c1)}>
                                        <img src={getAssetUrl(dr2c1.image)} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Left" />
                                    </a>
                                ) : (
                                    <img src={bestDealsR2Left} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Left" />
                                )}
                            </div>
                            <div style={{ flex: '2 1 480px', maxWidth: '606px', position: 'relative' }}>
                                {dr2mid ? (
                                    <a href={getSliderLink(dr2mid)}>
                                        <img src={getAssetUrl(dr2mid.image)} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Mid" />
                                    </a>
                                ) : (
                                    <img src={bestDealsR2Mid} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Mid" />
                                )}
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', border: '2px solid #fff', backdropFilter: 'blur(4px)' }}>
                                    <svg width="32" height="32" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="currentColor"/>
                                    </svg>
                                </div>
                            </div>
                            <div style={{ flex: '1 1 240px', maxWidth: '291px' }}>
                                {dr2c2 ? (
                                    <a href={getSliderLink(dr2c2)}>
                                        <img src={getAssetUrl(dr2c2.image)} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Right" />
                                    </a>
                                ) : (
                                    <img src={bestDealsR2Right} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Right" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MOBILE BANNERS HORIZONTAL TOUCH-SCROLLBAR — hidden on desktop */}
                    <div className="d-block d-lg-none">
                        <style dangerouslySetInnerHTML={{ __html: `
                            .deals-scroll-container::-webkit-scrollbar {
                                display: none !important;
                            }
                            .deals-scroll-container {
                                scrollbar-width: none !important;
                            }
                        `}} />
                        <div ref={scrollRef} className="deals-scroll-container" style={{ display: 'flex', gap: '15px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 5px 10px 5px' }}>
                            {mobileBanners.map((item) => {
                                const bannerSrc = item.banner ? getAssetUrl(item.banner.image) : item.fallback;
                                const linkHref = item.banner ? getSliderLink(item.banner) : '#';
                                return (
                                    <div key={item.id} style={{ flexShrink: 0, width: '280px', position: 'relative' }}>
                                        {item.banner ? (
                                            <a href={linkHref} style={{ display: 'block', width: '100%' }}>
                                                <img src={bannerSrc} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} alt={item.alt} />
                                            </a>
                                        ) : (
                                            <img src={bannerSrc} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} alt={item.alt} />
                                        )}
                                        {item.isVideo && (
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '44px', height: '44px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', border: '1.5px solid #fff', backdropFilter: 'blur(3px)' }}>
                                                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="currentColor"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        );
    };

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

                {/* Dynamic Best Deals sets from Admin, falling back to static imports */}
                {dealSections.length > 0 ? (
                    dealSections.map((sec, idx) => (
                        <BestDealsSection key={sec.id || idx} section={sec} />
                    ))
                ) : (
                    <>
                        <BestDealsSection />
                        <BestDealsSection />
                    </>
                )}

                {/* Popular Products Slider/Grid */}
                <section className="section-padding pb-5">
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        
                        {/* DESKTOP VIEW: Slick Slider Component */}
                        <div className="d-none d-lg-block">
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

                        {/* MOBILE VIEW: Side-by-Side 2-Column Grid (Same as Home page) */}
                        <div className="d-block d-lg-none">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' }}>
                                <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 700, margin: 0 }}>Popular Products</h3>
                            </div>
                            <div className="row flex-wrap" style={{ padding: '0 5px 20px 5px' }}>
                                {loading ? (
                                    <p style={{ padding: '0 15px' }}>Loading products...</p>
                                ) : (
                                    popularProducts.map(product => (
                                        <div key={product.id} className="col-6 mb-3 d-flex justify-content-center" style={{ padding: '0 6px' }}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))
                                )}
                            </div>
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
