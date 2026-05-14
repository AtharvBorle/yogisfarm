import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SliderComponent from 'react-slick';
import api, { getAssetUrl } from '../api';
import ProductCard from '../components/ProductCard';
import FeatureBanners from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';

import { ArrowRight } from 'react-feather';

// Import Figma assets from the new image_find folder
import mainR1Left from '../assets/figma/image_find/Main_R1_Left.png';
import mainR2Left from '../assets/figma/image_find/Main_R2_Left.png';
import mainR1Right from '../assets/figma/image_find/Main_R1_Right.png';
import mainR2Right from '../assets/figma/image_find/Main_R2_Right.png';

import bestDealsR1C1 from '../assets/figma/image_find/Best_deals_R1_C1.png';
import bestDealsR1C2 from '../assets/figma/image_find/Best_deals_R1_C2.png';
import bestDealsR2Left from '../assets/figma/image_find/Best_deals_R2_Left_Side.png';
import bestDealsR2Mid from '../assets/figma/image_find/Best_deals_R2_Mid.png';
import bestDealsR2Right from '../assets/figma/image_find/Best_deals_R2_Right_Side.png';

import cooking1 from '../assets/figma/image_find/Cooking_challange_1.png';
import cooking2 from '../assets/figma/image_find/Cooking_challange_2.png';
import cooking3 from '../assets/figma/image_find/Cooking_challange_3.png';
import cooking4 from '../assets/figma/image_find/Cooking_challange_4.png';

import whyChooseBg from '../assets/figma/image_find/Why_choose_bg.png';
import yogisLogoWhite from '../assets/figma/image_find/Yogis-Farms-Logo-white 1.png';

import iconApproval from '../assets/figma/icon_approval.svg';
import iconGears from '../assets/figma/icon_gears.svg';
import iconVision from '../assets/figma/icon_vision.svg';

const ProductSmallCard = ({ product }) => {

    const variants = product.variants || [];
    const firstStockedVariant = variants.find(v => v.stock > 0) || variants[0];
    const price = firstStockedVariant ? (firstStockedVariant.salePrice || firstStockedVariant.price) : null;
    const oldPrice = firstStockedVariant?.salePrice ? firstStockedVariant.price : null;

    return (
        <article style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
            <figure style={{ margin: 0, width: '80px', height: '80px', flexShrink: 0 }}>
                <Link to={`/product/${product.slug}`}>
                    <img src={getAssetUrl(product.image)} alt={product.name} style={{ borderRadius: '10px', width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #F0F0F0' }} />
                </Link>
            </figure>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <h6 style={{ margin: 0, lineHeight: '1' }}>
                    <Link to={`/product/${product.slug}`} style={{ color: '#000', fontSize: '15px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>{product.name}</Link>
                </h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#FFB800', fontSize: '12px' }}>★★★★★</span>
                    <span style={{ fontSize: '10px', color: '#B6B6B6', fontFamily: 'Poppins, sans-serif' }}>(113 Reviews)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#0A6738', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Poppins, sans-serif' }}>₹{parseFloat(price || 0).toFixed(2)}</span>
                    {oldPrice && (
                        <span style={{ color: '#FF0000', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                            {Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100)}% Off
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
};

const Slider = SliderComponent.default ? SliderComponent.default : SliderComponent;

const Home = () => {
    const navigate = useNavigate();
    const [mainSliders, setMainSliders] = useState([]);
    const [topSliders, setTopSliders] = useState([]);
    const [middleSliders, setMiddleSliders] = useState([]);
    const [bottomSliders, setBottomSliders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [dealProducts, setDealProducts] = useState([]);

    const [sections, setSections] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/sliders?position=main'),
            api.get('/sliders?position=top'),
            api.get('/sliders?position=middle'),
            api.get('/sliders?position=bottom'),
            api.get('/categories?featured=true'),
            api.get('/products?featured=true&limit=10'),
            api.get('/products?popular=true&limit=10'),
            api.get('/products?deal=true&limit=10'),
            api.get('/sections')
        ]).then(([mainRes, topRes, midRes, bottomRes, catRes, featuredRes, popularRes, dealRes, secRes]) => {
            if(mainRes.data.status) setMainSliders(mainRes.data.sliders);
            if(topRes.data.status) setTopSliders(topRes.data.sliders);
            if(midRes.data.status) setMiddleSliders(midRes.data.sliders);
            if(bottomRes.data.status) setBottomSliders(bottomRes.data.sliders);
            if(catRes.data.status) setCategories(catRes.data.categories);
            if(featuredRes.data.status) setFeaturedProducts(featuredRes.data.products);
            if(popularRes.data.status) setPopularProducts(popularRes.data.products);
            if(dealRes.data.status) setDealProducts(dealRes.data.products);
            if(secRes.data.status) setSections(secRes.data.sections);
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

    // Slick Configurations
    const heroSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        fade: true,
        arrows: false
    };

    const categorySettings = {
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 8,
        slidesToScroll: 1,
        autoplay: true,
        responsive: [
            { breakpoint: 1025, settings: { slidesToShow: 4 } },
            { breakpoint: 768, settings: { slidesToShow: 3 } },
            { breakpoint: 480, settings: { slidesToShow: 2 } }
        ]
    };

    const productSliderSettings = {
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        responsive: [
            { breakpoint: 1025, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } }
        ]
    };

    // Reusable banner grid for static slider arrays (Top, Middle, Bottom positions)
    const SliderBanner = ({ sliders, maxCols = 4 }) => (
        <section className={`banners mb-25 ${!sliders.length ? 'd-none' : ''}`}>
            <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                <div className="row">
                    {sliders.map(slider => (
                        <div key={slider.id} className={`col-lg-${Math.floor(12 / Math.min(sliders.length, maxCols))} col-md-6 col-12 mb-10`}>
                            <div className="banner-img wow animate__animated animate__fadeInUp" data-wow-delay="0">
                                <a href={getSliderLink(slider)}>
                                    <img src={getAssetUrl(slider.image)} alt={slider.name || ''} style={{ width: '100%', borderRadius: '8px' }} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    return (
        <>
            {/* 1. MAIN SLIDER */}
            {mainSliders.length > 0 && (
                <section className="home-slider position-relative pt-25 pb-20">
                    <div className="container-fluid" style={{ padding: '0 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: '14px', width: '100%' }}>
                            {/* Left Banners — Figma: 173x173 stacked, gap ~15px */}
                            <div className="d-none d-lg-flex" style={{ flexDirection: 'column', gap: '15px', width: '173px', flexShrink: 0 }}>
                                <img src={mainR1Left} alt="Main R1 Left" style={{ width: '173px', height: 'auto', borderRadius: '9px' }} />
                                <img src={mainR2Left} alt="Main R2 Left" style={{ width: '173px', height: 'auto', borderRadius: '9px' }} />
                            </div>

                            {/* Main Slider — Figma: 992x361 */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="home-slide-cover" style={{ borderRadius: '9px', overflow: 'hidden' }}>
                                    <div className="hero-slider-1 style-2 dot-style-1 dot-style-1-position-1">
                                        <Slider {...heroSettings}>
                                            {mainSliders.map(slider => (
                                                <div key={slider.id}>
                                                    <a href={getSliderLink(slider)}>
                                                        <img src={getAssetUrl(slider.image)} alt={slider.name || ''} style={{ width: '100%', height: '361px', objectFit: 'cover', borderRadius: '9px' }} />
                                                    </a>
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>
                                </div>
                            </div>

                            {/* Right Banners — Figma: 173x173 stacked */}
                            <div className="d-none d-lg-flex" style={{ flexDirection: 'column', gap: '15px', width: '173px', flexShrink: 0 }}>
                                <img src={mainR1Right} alt="Main R1 Right" style={{ width: '173px', height: 'auto', borderRadius: '9px' }} />
                                <img src={mainR2Right} alt="Main R2 Right" style={{ width: '173px', height: 'auto', borderRadius: '9px' }} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 2. Featured Categories */}
            {categories.length > 0 && (
                <section className="popular-categories section-padding">
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }} className="wow animate__animated animate__fadeIn">
                        <div className="section-title">
                            <div className="title">
                                <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Featured Categories</h3>
                            </div>
                        </div>
                        <div className="position-relative">
                            <Slider {...categorySettings}>
                                {categories.map(cat => (
                                    <div key={cat.id} className="m-2 wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                                        <figure 
                                            className="img-hover-scale overflow-hidden text-center d-flex flex-column align-items-center"
                                            style={{ cursor: 'pointer', gap: '10px' }}
                                            onClick={() => navigate(`/shop?category=${cat.slug}`)}
                                        >
                                            <div className="end" style={{ display: 'inline-block' }}>
                                                <img src={getAssetUrl(cat.image)} alt={cat.name} style={{ width: '112px', height: '112px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #F9F9F9' }} />
                                            </div>
                                            <h6 className="text-center" style={{ margin: 0 }}>
                                                <span className="end" style={{ fontSize: '13px', color: 'var(--yf-primary-dark)', fontFamily: 'var(--font-poppins)', fontWeight: 600 }}>{cat.name}</span>
                                            </h6>
                                        </figure>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. TOP SLIDER */}
            {topSliders.length > 0 && <SliderBanner sliders={topSliders} />}



            {/* 5. Popular Products (Figma Layout: Grid with Search and Pagination) */}
            {popularProducts.length > 0 && (
                <section className="section-padding pb-5">
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '25px', fontWeight: 600, lineHeight: '22px', margin: 0 }}>Popular Products</h3>
                            
                            {/* Search field in section header */}
                            <div style={{ position: 'relative', width: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: '5px', height: '35px', padding: '0 10px' }}>
                                    <i className="fi-rs-search" style={{ color: '#0A6738', fontSize: '14px', marginRight: '8px' }}></i>
                                    <input type="text" placeholder="Search for Product" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#333', width: '100%', fontFamily: 'Poppins, sans-serif' }} />
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '5px' }}>
                                        <path d="M1 1L5 5L9 1" stroke="#0A6738" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(4, 291px)', 
                            gap: '24px', 
                            justifyContent: 'center',
                            marginBottom: '30px'
                        }}>
                            {popularProducts.slice(0, 8).map(product => (
                                <div key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pagination-area mt-15 mb-sm-5 mb-lg-0" style={{ display: 'flex', justifyContent: 'center' }}>
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-start" style={{ display: 'flex', gap: '5px', listStyle: 'none', padding: 0 }}>
                                    <li className="page-item">
                                        <a className="page-link" href="#!" style={{ borderRadius: '4px', border: '1px solid #ECECEC', color: '#7E7E7E', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}><i className="fi-rs-angle-left"></i></a>
                                    </li>
                                    <li className="page-item active">
                                        <a className="page-link" href="#!" style={{ borderRadius: '4px', border: '1px solid #ECECEC', backgroundColor: '#F2F2F2', color: '#253D4E', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>1</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link" href="#!" style={{ borderRadius: '4px', border: '1px solid #ECECEC', color: '#253D4E', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>2</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link" href="#!" style={{ borderRadius: '4px', border: '1px solid #ECECEC', color: '#253D4E', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>3</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link dot" href="#!" style={{ color: '#7E7E7E', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>...</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link" href="#!" style={{ borderRadius: '4px', border: '1px solid #ECECEC', color: '#7E7E7E', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}><i className="fi-rs-angle-right"></i></a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. MIDDLE SLIDER */}
            {middleSliders.length > 0 && <SliderBanner sliders={middleSliders} />}

            {/* 6.5 DYNAMIC SECTIONS from Admin */}
            {sections.map(section => {
                const products = section.category?.products || [];
                if (products.length === 0) return null;
                return (
                    <section key={section.id} className="section-padding pb-5">
                        <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontStyle: 'italic', color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{section.name}</h3>
                                <Link to={`/shop?category=${section.category?.slug}`} style={{ color: '#0A6738', fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>View All <ArrowRight size={16} /></Link>
                            </div>
                            <div className="row product-grid-4">
                                {products.map(product => (
                                    <div key={product.id} className="col-lg-1-5 col-md-4 col-12 col-sm-6">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* 7. Deals Section (Restructured 2-over-3 Layout) */}
            <section className="section-padding pb-5">
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                    <div className="section-title">
                        <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Best Deals</h3>
                    </div>
                    
                    {/* Row 1: Two Wide Banners (606px each with 24px gap = 1236px) */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                        <div style={{ width: '606px' }}>
                            <img 
                                src={bestDealsR1C1} 
                                style={{ width: '100%', borderRadius: '15px', height: 'auto' }} 
                                alt="Best Deal R1 C1"
                            />
                        </div>
                        <div style={{ width: '606px' }}>
                            <img 
                                src={bestDealsR1C2} 
                                style={{ width: '100%', borderRadius: '15px', height: 'auto' }} 
                                alt="Best Deal R1 C2"
                            />
                        </div>
                    </div>

                    {/* Row 2: Ad | Video | Ad (280px | 628px | 280px with 2x24px gaps = 1236px) */}
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {/* Left Advertisement */}
                        <div style={{ width: '280px' }}>
                            <img 
                                src={bestDealsR2Left} 
                                style={{ width: '100%', borderRadius: '15px', height: 'auto' }} 
                                alt="Best Deal R2 Left"
                            />
                        </div>

                        {/* Center Video Banner */}
                        <div style={{ width: '628px', position: 'relative' }}>
                            <img 
                                src={bestDealsR2Mid} 
                                style={{ width: '100%', borderRadius: '15px', height: 'auto' }} 
                                alt="Best Deal R2 Mid"
                            />
                            {/* Video Play Button Overlay */}
                            <div style={{ 
                                position: 'absolute', 
                                top: '50%', 
                                left: '50%', 
                                transform: 'translate(-50%, -50%)', 
                                width: '64px', 
                                height: '64px', 
                                backgroundColor: 'rgba(255,255,255,0.2)', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: '#fff', 
                                cursor: 'pointer',
                                border: '2px solid #fff',
                                backdropFilter: 'blur(4px)'
                            }}>
                                <svg width="32" height="32" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>

                        {/* Right Advertisement */}
                        <div style={{ width: '280px' }}>
                            <img 
                                src={bestDealsR2Right} 
                                style={{ width: '100%', borderRadius: '15px', height: 'auto' }} 
                                alt="Best Deal R2 Right"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. BOTTOM SLIDER */}
            {bottomSliders.length > 0 && <SliderBanner sliders={bottomSliders} containerClass="container-fluid" maxCols={2} />}

            {/* 9. 4-Column Compact Products Section */}
            <section className="section-padding mb-30 mt-30">
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-md-0">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Top Selling</h4>
                            <div className="product-list-small">
                                {popularProducts.slice(0, 3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-md-0">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Trending Products</h4>
                            <div className="product-list-small">
                                {dealProducts.slice(0, 3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-sm-5 mb-md-0 d-none d-lg-block">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Recently Added</h4>
                            <div className="product-list-small">
                                {popularProducts.length > 3 ? popularProducts.slice(3, 6).map(p => <ProductSmallCard key={p.id} product={p} />) : dealProducts.slice(0,3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-sm-5 mb-md-0 d-none d-xl-block">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Top Rated</h4>
                            <div className="product-list-small">
                                {featuredProducts.slice(0, 3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. Upcoming Product Categories */}
            <section className="popular-categories section-padding pb-5">
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }} className="wow animate__animated animate__fadeIn">
                    <div className="section-title">
                        <div className="title">
                            <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '25px', fontWeight: 600 }}>Upcoming Products & Categories</h3>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap" style={{ gap: '15px' }}>
                        {['Beauty & Grooming', 'Makeup & Fragrances', 'Toys & Stationery', 'Health Wellness', 'Hardware', 'Auto Accessories', 'FMCG'].map(cat => (
                            <span key={cat} style={{ background: '#EFEFEF', padding: '14px 37px', borderRadius: '20px', color: '#030303', fontSize: '16px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '22px', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseOver={(e) => { e.target.style.background = '#0A6738'; e.target.style.color = '#fff'; }} onMouseOut={(e) => { e.target.style.background = '#EFEFEF'; e.target.style.color = '#030303'; }}>{cat}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* 11. Cooking Challenges Banner (Full Width) */}
            <section className="section-padding pb-5" style={{ background: '#F2FFD6', margin: '40px 0' }}>
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '40px 15px' }} className="wow animate__animated animate__fadeIn">
                    <div className="section-title text-center">
                        <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '32px', fontWeight: 600, lineHeight: '40px', marginBottom: '40px', textTransform: 'capitalize' }}>Participate in our Cooking Challenges & avail the offer</h3>
                    </div>
                    <div className="row justify-content-center mb-4">
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="position-relative overflow-hidden" style={{ borderRadius: '12px' }}>
                                <img src={cooking1} alt="Cooking 1" style={{ width: '100%', height: 'auto', transition: 'transform 0.5s ease' }} className="hover-zoom" />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '45px', height: '45px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="#0A6738"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="position-relative overflow-hidden" style={{ borderRadius: '12px' }}>
                                <img src={cooking2} alt="Cooking 2" style={{ width: '100%', height: 'auto', transition: 'transform 0.5s ease' }} className="hover-zoom" />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '45px', height: '45px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="#0A6738"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="position-relative overflow-hidden" style={{ borderRadius: '12px' }}>
                                <img src={cooking3} alt="Cooking 3" style={{ width: '100%', height: 'auto', transition: 'transform 0.5s ease' }} className="hover-zoom" />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '45px', height: '45px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="#0A6738"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="position-relative overflow-hidden" style={{ borderRadius: '12px' }}>
                                <img src={cooking4} alt="Cooking 4" style={{ width: '100%', height: 'auto', transition: 'transform 0.5s ease' }} className="hover-zoom" />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '45px', height: '45px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="#0A6738"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-40">
                        <button className="btn" style={{ padding: '18px 60px', fontSize: '18px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, borderRadius: '10px', backgroundColor: '#FF0000', color: '#FFFFFF', border: 'none', boxShadow: '0 10px 20px rgba(255,0,0,0.15)', cursor: 'pointer' }}>Explore More +</button>
                    </div>
                </div>
            </section>

            {/* 12. Why Families Choose Section */}
            <section className="section-padding" style={{ padding: '60px 0' }}>
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                    <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 700, marginBottom: '30px' }}>Why Families Choose Yogi’s Farms</h3>
                    
                    <div style={{ position: 'relative', width: '100%', borderRadius: '15px', overflow: 'hidden', marginBottom: '40px' }}>
                        <img src={whyChooseBg} alt="Why Choose Background" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <img src={yogisLogoWhite} alt="Yogis Farm Logo" style={{ width: '120px' }} />
                        </div>
                    </div>

                    <div className="row" style={{ marginBottom: '50px' }}>
                        <div className="col-md-5">
                            <p style={{ color: '#0A6738', fontSize: '16px', fontWeight: 600, lineHeight: '1.6', fontFamily: 'Poppins, sans-serif' }}>
                                We believe food should nourish your body, support your lifestyle, and earn your trust every single day. That’s why we follow traditional methods, maintain strict quality standards, and ensure every batch reflects consistency and freshness.
                            </p>
                        </div>
                        <div className="col-md-7">
                            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Poppins, sans-serif' }}>
                                In a world driven by speed and mass production, we choose honesty over shortcuts. At Yogi’s Farm, every product begins at the source with carefully selected farms, natural growing practices, and a commitment to preserving what truly matters. We don't believe in over processing or refining away the goodness; instead, we retain the natural taste, nutrition, and purity that real food is meant to have. What reaches your kitchen isn’t just a product it’s a process rooted in care, transparency, and intention.
                            </p>
                        </div>
                    </div>

                    <div className="row text-start">
                        <div className="col-md-4 mb-30">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconApproval} alt="Real Sourcing" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Real Sourcing, Not Market Buying</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Grown with intent, not sourced in bulk</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>We work directly with farmers who follow natural practices not middlemen or mass suppliers. Every grain has a known origin, not an unknown journey.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-30">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconGears} alt="Minimal Processing" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Minimal Processing</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>We don’t over process what nature perfected</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>No excessive polishing, no aggressive refining. We retain the natural structure, nutrition, and taste, just the way it should be.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-30">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconVision} alt="Complete Transparent" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Complete Transparent</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Nothing hidden. nothing artificial.</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>From sourcing to packaging, everything is clear. No confusing labels, no hidden chemicals, just honest food you can trust.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. Feature Banners (Perks) */}
            <FeatureBanners />

            {/* Floating Sidebar attached to right edge */}
            <FloatingSidebar />
        </>
    );
};

export default Home;
