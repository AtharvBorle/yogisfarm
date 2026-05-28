import React, { useEffect, useState, useRef } from 'react';
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
import yogisLogoWhite from '../assets/figma/image_find/Yogis-Farms-Logo-white.svg';

import iconApproval from '../assets/figma/icon_approval.svg';
import iconGears from '../assets/figma/icon_gears.svg';
import iconVision from '../assets/figma/icon_vision.svg';

const ProductSmallCard = ({ product, isMobile }) => {

    const variants = product.variants || [];
    const firstStockedVariant = variants.find(v => v.stock > 0) || variants[0];
    const price = firstStockedVariant ? (firstStockedVariant.salePrice || firstStockedVariant.price) : null;
    const oldPrice = firstStockedVariant?.salePrice ? firstStockedVariant.price : null;

    const reviews = product.reviews || [];
    const avgRatingRaw = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) 
        : 5.0;
    const roundedRating = Math.round(avgRatingRaw);
    const starString = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);

    const imgSize = isMobile ? '140px' : '80px';
    const titleSize = isMobile ? '20px' : '15px';
    const priceSize = isMobile ? '20px' : '15px';
    const starsSize = isMobile ? '16px' : '12px';
    const reviewsSize = isMobile ? '13px' : '10px';
    const discountSize = isMobile ? '14px' : '11px';

    return (
        <article className="product-small-card-article" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '12px' }}>
            <figure style={{ margin: 0, width: imgSize, height: imgSize, flexShrink: 0 }}>
                <Link to={`/product/${product.slug}`}>
                    <img className="product-small-card-img" src={getAssetUrl(product.image)} alt={product.name} style={{ borderRadius: '10px', width: imgSize, height: imgSize, objectFit: 'cover', border: '1px solid #F0F0F0' }} />
                </Link>
            </figure>
            <div className="product-small-card-text-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <h6 style={{ margin: 0, lineHeight: '1.2' }}>
                    <Link className="product-small-card-title" to={`/product/${product.slug}`} style={{ color: '#000', fontSize: titleSize, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>{product.name}</Link>
                </h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                    <span className="product-small-card-stars" style={{ color: '#FFB800', fontSize: starsSize }}>{starString}</span>
                    <span className="product-small-card-reviews-text" style={{ fontSize: reviewsSize, color: '#B6B6B6', fontFamily: 'Poppins, sans-serif' }}>({reviews.length} Reviews)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span className="product-small-card-price" style={{ color: '#0A6738', fontWeight: 'bold', fontSize: priceSize, fontFamily: 'Poppins, sans-serif' }}>₹{parseFloat(price || 0).toFixed(2)}</span>
                    {oldPrice && (
                        <span className="product-small-card-discount" style={{ color: '#FF0000', fontSize: discountSize, fontFamily: 'Poppins, sans-serif' }}>
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [mainSliders, setMainSliders] = useState([]);
    const [topSliders, setTopSliders] = useState([]);
    const [middleSliders, setMiddleSliders] = useState([]);
    const [bottomSliders, setBottomSliders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [dealProducts, setDealProducts] = useState([]);

    // Automated Compact Dynamic Lists
    const [topSellingList, setTopSellingList] = useState([]);
    const [trendingList, setTrendingList] = useState([]);
    const [recentlyAddedList, setRecentlyAddedList] = useState([]);
    const [topRatedList, setTopRatedList] = useState([]);

    const [sections, setSections] = useState([]);

    const [popularPage, setPopularPage] = useState(1);
    const [popularTotalPages, setPopularTotalPages] = useState(1);
    const [popularSearch, setPopularSearch] = useState('');
    const [popularInputVal, setPopularInputVal] = useState('');
    const [popularSuggestions, setPopularSuggestions] = useState([]);
    const [isPopularSuggestionsOpen, setIsPopularSuggestionsOpen] = useState(false);
    const popularSearchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popularSearchRef.current && !popularSearchRef.current.contains(event.target)) {
                setIsPopularSuggestionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (popularInputVal.length > 1) {
            const delayDebounceFn = setTimeout(() => {
                api.get(`/products?search=${encodeURIComponent(popularInputVal)}&limit=7`).then(res => {
                    if (res.data.status) {
                        setPopularSuggestions(res.data.products || []);
                        setIsPopularSuggestionsOpen(true);
                    }
                });
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setPopularSuggestions([]);
            setIsPopularSuggestionsOpen(false);
        }
    }, [popularInputVal]);

    const handlePopularSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setPopularSearch(popularInputVal);
        setPopularPage(1);
        setIsPopularSuggestionsOpen(false);
    };

    useEffect(() => {
        Promise.all([
            api.get('/sliders?position=main'),
            api.get('/sliders?position=top'),
            api.get('/sliders?position=middle'),
            api.get('/sliders?position=bottom'),
            api.get('/categories?featured=true'),
            api.get('/products?featured=true&limit=10'),
            api.get('/products?deal=true&limit=10'),
            api.get('/sections'),
            api.get('/products/homepage-lists?limit=3')
        ]).then(([mainRes, topRes, midRes, bottomRes, catRes, featuredRes, dealRes, secRes, listRes]) => {
            if (mainRes.data.status) setMainSliders(mainRes.data.sliders);
            if (topRes.data.status) setTopSliders(topRes.data.sliders);
            if (midRes.data.status) setMiddleSliders(midRes.data.sliders);
            if (bottomRes.data.status) setBottomSliders(bottomRes.data.sliders);
            if (catRes.data.status) setCategories(catRes.data.categories);
            if (featuredRes.data.status) setFeaturedProducts(featuredRes.data.products);
            if (dealRes.data.status) setDealProducts(dealRes.data.products);
            if (secRes.data.status) setSections(secRes.data.sections);
            if (listRes && listRes.data.status) {
                setTopSellingList(listRes.data.topSelling || []);
                setTrendingList(listRes.data.trending || []);
                setRecentlyAddedList(listRes.data.recentlyAdded || []);
                setTopRatedList(listRes.data.topRated || []);
            }
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let url = `/products?popular=true&page=${popularPage}&limit=8`;
        if (popularSearch) {
            url += `&search=${encodeURIComponent(popularSearch)}`;
        }
        api.get(url)
            .then(res => {
                if (res.data.status) {
                    setPopularProducts(res.data.products || []);
                    setPopularTotalPages(res.data.totalPages || 1);
                }
            })
            .catch(err => console.error(err));
    }, [popularPage, popularSearch]);


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

    // Filter Main banner sliders
    const carouselSliders = mainSliders.filter(s => !s.subposition || s.subposition === 'Main' || s.subposition === '');
    const r1c1Slider = mainSliders.find(s => s.subposition === 'R1C1');
    const r2c1Slider = mainSliders.find(s => s.subposition === 'R2C1');
    const r1c2Slider = mainSliders.find(s => s.subposition === 'R1C2');
    const r2c2Slider = mainSliders.find(s => s.subposition === 'R2C2');

    // Filter homepage deal sections
    const dealSection = sections.find(s => s.isDeal && s.page === 'home');
    let dealBanners = [];
    if (dealSection && dealSection.image) {
        try {
            dealBanners = JSON.parse(dealSection.image);
        } catch (e) {
            console.error("Failed to parse deal banners JSON on Home", e);
        }
    }
    const dr1c1 = dealBanners.find(b => b.position === 'DR1C1');
    const dr1c2 = dealBanners.find(b => b.position === 'DR1C2');
    const dr2c1 = dealBanners.find(b => b.position === 'DR2C1');
    const dr2mid = dealBanners.find(b => b.position === 'DR2Mid');
    const dr2c2 = dealBanners.find(b => b.position === 'DR2C2');

    const homeDealsScrollRef = React.useRef(null);

    React.useEffect(() => {
        const el = homeDealsScrollRef.current;
        if (!el || dealBanners.length === 0) return;

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
            const cardWidth = 312 + 16; // 328px
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
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 767px) {
                    .auto-scroll-container {
                        flex-wrap: nowrap !important;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }
                    .auto-scroll-container::-webkit-scrollbar {
                        display: none !important;
                    }
                    .home-slider-img {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                    }
                    .home-slider {
                        aspect-ratio: 312 / 190 !important;
                        height: auto !important;
                        min-height: unset !important;
                        padding-top: 12px !important;
                        padding-bottom: 10px !important;
                    }
                    .home-slide-cover,
                    .hero-slider-1 {
                        aspect-ratio: 312 / 190 !important;
                        height: auto !important;
                        min-height: unset !important;
                    }
                    .hero-slider-1 .slick-slider,
                    .hero-slider-1 .slick-list,
                    .hero-slider-1 .slick-track,
                    .hero-slider-1 .slick-slide,
                    .hero-slider-1 .slick-slide * {
                        height: 100% !important;
                        min-height: unset !important;
                    }
                    .popular-categories .section-title h3 {
                        font-size: 14px !important;
                        line-height: 22px !important;
                        margin-bottom: 10px !important;
                    }
                    .popular-categories .col-4 {
                        width: auto !important;
                        padding-left: 6px !important;
                        padding-right: 6px !important;
                        margin-bottom: 5px !important;
                    }
                    .popular-categories figure {
                        gap: 6px !important;
                    }
                    .popular-categories img {
                        width: 95px !important;
                        height: 95px !important;
                        border-radius: 7.639px !important;
                        border: 0.849px solid #F9F9F9 !important;
                    }
                    .popular-categories h6 span {
                        font-size: 10px !important;
                    }
                    .section-title h3 {
                        font-size: 14px !important;
                        line-height: 22px !important;
                    }
                    

                    .product-list-small-section-title {
                        font-size: 12px !important;
                        border-bottom: none !important;
                        margin-bottom: 12px !important;
                        padding-bottom: 0 !important;
                    }
                    .why-choose-logo {
                        height: 18px !important;
                        width: auto !important;
                    }
                }
                .why-choose-logo {
                    height: 95px !important;
                    width: auto !important;
                    max-width: 80% !important;
                    max-height: 80% !important;
                }
                @media (max-width: 991px) {
                    .why-choose-logo {
                        height: 35px !important;
                        width: auto !important;
                    }
                }
                .home-slider-img {
                    width: 100% !important;
                    height: 361px !important;
                    object-fit: cover !important;
                    border-radius: 9px !important;
                }
                /* Global Small Card Desktop/Tablet Overrides to ensure center alignment */
                .product-small-card-text-container {
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                    height: 80px !important;
                }
                .product-small-card-article {
                    align-items: center !important;
                }
            `}} />
            {/* 1. MAIN SLIDER */}
            {mainSliders.length > 0 && (
                <section className="home-slider position-relative pt-25 pb-20">
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: '14px', width: '100%' }}>
                            {/* Left Banners — Figma: 173x173 stacked, gap ~15px */}
                            <div className="d-none d-lg-flex" style={{ flexDirection: 'column', gap: '15px', width: '173px', flexShrink: 0 }}>
                                {r1c1Slider ? (
                                    <a href={getSliderLink(r1c1Slider)}>
                                        <img src={getAssetUrl(r1c1Slider.image)} alt={r1c1Slider.name || ''} style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                    </a>
                                ) : (
                                    <img src={mainR1Left} alt="Main R1 Left" style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                )}
                                {r2c1Slider ? (
                                    <a href={getSliderLink(r2c1Slider)}>
                                        <img src={getAssetUrl(r2c1Slider.image)} alt={r2c1Slider.name || ''} style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                    </a>
                                ) : (
                                    <img src={mainR2Left} alt="Main R2 Left" style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                )}
                            </div>

                            {/* Main Slider — Figma: 992x361 */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="home-slide-cover" style={{ borderRadius: '9px', overflow: 'hidden' }}>
                                    <div className="hero-slider-1 style-2 dot-style-1 dot-style-1-position-1">
                                        <Slider {...heroSettings}>
                                            {carouselSliders.length > 0 ? (
                                                carouselSliders.map(slider => (
                                                    <div key={slider.id}>
                                                        <a href={getSliderLink(slider)}>
                                                            <img 
                                                                src={getAssetUrl((isMobile && slider.mobileImage) ? slider.mobileImage : slider.image)} 
                                                                alt={slider.name || ''} 
                                                                className="home-slider-img" 
                                                            />
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>
                                                    <a href="#">
                                                        <img src="/src/assets/figma/img_3.png" alt="Fallback Slider" className="home-slider-img" />
                                                    </a>
                                                </div>
                                            )}
                                        </Slider>
                                    </div>
                                </div>

                                {/* Mobile-Only Banner Grid Row (c1r1, c1r2, c2r1, c2r2) */}
                                {isMobile && (
                                    <div className="d-flex d-md-none justify-content-between" style={{ marginTop: '12px', gap: '8px' }}>
                                        {/* Box 1: c1r1 / R1C1 */}
                                        <div style={{ width: '72px', height: '72px', borderRadius: '6.158px', overflow: 'hidden', flex: 1, aspectRatio: '1/1' }}>
                                            <a href={r1c1Slider ? getSliderLink(r1c1Slider) : '#'}>
                                                <img src={r1c1Slider ? getAssetUrl(r1c1Slider.image) : mainR1Left} alt="R1C1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </a>
                                        </div>
                                        {/* Box 2: c1r2 / R2C1 */}
                                        <div style={{ width: '72px', height: '72px', borderRadius: '9.237px', overflow: 'hidden', flex: 1, aspectRatio: '1/1' }}>
                                            <a href={r2c1Slider ? getSliderLink(r2c1Slider) : '#'}>
                                                <img src={r2c1Slider ? getAssetUrl(r2c1Slider.image) : mainR2Left} alt="R2C1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </a>
                                        </div>
                                        {/* Box 3: c2r1 / R1C2 */}
                                        <div style={{ width: '72px', height: '72px', borderRadius: '9.237px', overflow: 'hidden', flex: 1, aspectRatio: '1/1' }}>
                                            <a href={r1c2Slider ? getSliderLink(r1c2Slider) : '#'}>
                                                <img src={r1c2Slider ? getAssetUrl(r1c2Slider.image) : mainR1Right} alt="R1C2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </a>
                                        </div>
                                        {/* Box 4: c2r2 / R2C2 with Video Icon */}
                                        <div style={{ width: '72px', height: '72px', borderRadius: '9.237px', overflow: 'hidden', flex: 1, aspectRatio: '1/1', position: 'relative' }}>
                                            <a href={r2c2Slider ? getSliderLink(r2c2Slider) : '#'}>
                                                <img src={r2c2Slider ? getAssetUrl(r2c2Slider.image) : mainR2Right} alt="R2C2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {/* Video Play Icon Overlay */}
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '22px', height: '22px', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                    <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="#0A6738" /></svg>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Banners — Figma: 173x173 stacked */}
                            <div className="d-none d-lg-flex" style={{ flexDirection: 'column', gap: '15px', width: '173px', flexShrink: 0 }}>
                                {r1c2Slider ? (
                                    <a href={getSliderLink(r1c2Slider)}>
                                        <img src={getAssetUrl(r1c2Slider.image)} alt={r1c2Slider.name || ''} style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                    </a>
                                ) : (
                                    <img src={mainR1Right} alt="Main R1 Right" style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                )}
                                {r2c2Slider ? (
                                    <a href={getSliderLink(r2c2Slider)}>
                                        <img src={getAssetUrl(r2c2Slider.image)} alt={r2c2Slider.name || ''} style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                    </a>
                                ) : (
                                    <img src={mainR2Right} alt="Main R2 Right" style={{ width: '173px', height: '173px', objectFit: 'cover', borderRadius: '9px' }} />
                                )}
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
                                <h3 className="global-heading-style" style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Featured Categories</h3>
                            </div>
                        </div>
                        <div className="row flex-nowrap flex-md-wrap overflow-auto auto-scroll-container justify-content-center" style={{ paddingBottom: '15px' }}>
                            {categories.map(cat => (
                                <div key={cat.id} className="col-4 col-sm-3 col-md-2 mb-3" style={{ flexShrink: 0 }}>
                                    <figure
                                        className="img-hover-scale overflow-hidden text-center d-flex flex-column align-items-center"
                                        style={{ cursor: 'pointer', gap: '10px' }}
                                        onClick={() => navigate(`/shop?category=${cat.slug}`)}
                                    >
                                        <div className="end" style={{ display: 'inline-block' }}>
                                            <img src={getAssetUrl(cat.image)} alt={cat.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #F9F9F9' }} />
                                        </div>
                                        <h6 className="text-center" style={{ margin: 0 }}>
                                            <span className="end" style={{ fontSize: '12px', color: 'var(--yf-primary-dark)', fontFamily: 'var(--font-poppins)', fontWeight: 600 }}>{cat.name}</span>
                                        </h6>
                                    </figure>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. TOP SLIDER */}
            {topSliders.length > 0 && <SliderBanner sliders={topSliders} />}



            {/* 5. Popular Products (Figma Layout: Grid with Search and Pagination) */}
            {(popularProducts.length > 0 || popularSearch) && (
                <section className="section-padding pb-5">
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                            <h3 className="global-heading-style" style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '22px', margin: 0 }}>Popular Products</h3>

                            {/* Search field in section header */}
                            <div ref={popularSearchRef} style={{ position: 'relative', width: isMobile ? '100%' : '200px' }}>
                                <form onSubmit={handlePopularSearchSubmit} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: '5px', height: '35px', padding: '0 10px' }}>
                                    <button type="submit" style={{ border: 'none', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A6738" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                    </button>
                                    <input 
                                        type="text" 
                                        placeholder="Search for Product" 
                                        value={popularInputVal}
                                        onChange={(e) => {
                                            setPopularInputVal(e.target.value);
                                        }}
                                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#333', width: '100%', fontFamily: 'Poppins, sans-serif' }} 
                                    />
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '5px' }}>
                                        <path d="M1 1L5 5L9 1" stroke="#0A6738" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </form>
                                {/* Search Suggestions Dropdown */}
                                {isPopularSuggestionsOpen && popularSuggestions.length > 0 && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', borderRadius: '0 0 8px 8px', zIndex: 9999, padding: '8px 0', maxHeight: '350px', overflowY: 'auto', marginTop: '2px' }}>
                                        {popularSuggestions.map(product => (
                                            <Link
                                                key={product.id}
                                                to={`/product/${product.slug}`}
                                                onClick={() => {
                                                    setIsPopularSuggestionsOpen(false);
                                                    setPopularInputVal('');
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', padding: '8px 15px', color: '#333', fontSize: '13px', textDecoration: 'none', gap: '10px', fontFamily: 'Poppins, sans-serif', transition: 'background-color 0.2s', borderBottom: '1px solid #f9f9f9' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                {product.images?.[0] && <img src={getAssetUrl(product.images[0]?.image || product.images[0])} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="row flex-wrap" style={{ paddingBottom: '20px' }}>
                            {popularProducts.length > 0 ? (
                                popularProducts.map(product => (
                                    <div key={product.id} className="col-6 col-sm-6 col-md-4 col-lg-3 mb-3 d-flex justify-content-center">
                                        <ProductCard product={product} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center" style={{ padding: '40px 0', color: '#7E7E7E', fontFamily: 'Poppins, sans-serif' }}>
                                    No popular products found matching your search.
                                </div>
                            )}
                        </div>

                        {/* Dynamic Pagination */}
                        {popularTotalPages > 1 && (
                            <div className="pagination-area mt-15 mb-sm-5 mb-lg-0" style={{ display: 'flex', justifyContent: 'center' }}>
                                <nav aria-label="Page navigation example">
                                    <ul className="pagination justify-content-start" style={{ display: 'flex', gap: '5px', listStyle: 'none', padding: 0 }}>
                                        <li className={`page-item ${popularPage === 1 ? 'disabled' : ''}`}>
                                            <a 
                                                className="page-link" 
                                                href="#!" 
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    if (popularPage > 1) setPopularPage(popularPage - 1); 
                                                }}
                                                style={{ 
                                                     borderRadius: '4px', 
                                                     border: '1px solid #ECECEC', 
                                                     color: '#7E7E7E', 
                                                     display: 'flex', 
                                                     alignItems: 'center', 
                                                     justifyContent: 'center', 
                                                     width: '40px', 
                                                     height: '40px',
                                                     cursor: popularPage === 1 ? 'not-allowed' : 'pointer',
                                                     opacity: popularPage === 1 ? 0.5 : 1
                                                }}
                                             >
                                                 <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                     <path d="M5 9L1 5L5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                 </svg>
                                             </a>
                                         </li>
                                         
                                         {Array.from({ length: popularTotalPages }, (_, i) => i + 1).map(pageNum => (
                                             <li key={pageNum} className={`page-item ${popularPage === pageNum ? 'active' : ''}`}>
                                                 <a 
                                                     className="page-link" 
                                                     href="#!" 
                                                     onClick={(e) => { 
                                                         e.preventDefault(); 
                                                         setPopularPage(pageNum); 
                                                     }}
                                                     style={{ 
                                                         borderRadius: '4px', 
                                                         border: '1px solid #ECECEC', 
                                                         backgroundColor: popularPage === pageNum ? '#0A6738' : '#F2F2F2', 
                                                         color: popularPage === pageNum ? '#FFF' : '#253D4E', 
                                                         fontWeight: 'bold', 
                                                         display: 'flex', 
                                                         alignItems: 'center', 
                                                         justifyContent: 'center', 
                                                         width: '40px', 
                                                         height: '40px',
                                                         cursor: 'pointer'
                                                     }}
                                                 >
                                                     {pageNum}
                                                 </a>
                                             </li>
                                         ))}

                                         <li className={`page-item ${popularPage === popularTotalPages ? 'disabled' : ''}`}>
                                             <a 
                                                 className="page-link" 
                                                 href="#!" 
                                                 onClick={(e) => { 
                                                     e.preventDefault(); 
                                                     if (popularPage < popularTotalPages) setPopularPage(popularPage + 1); 
                                                 }}
                                                 style={{ 
                                                     borderRadius: '4px', 
                                                     border: '1px solid #ECECEC', 
                                                     color: '#7E7E7E', 
                                                     display: 'flex', 
                                                     alignItems: 'center', 
                                                     justifyContent: 'center', 
                                                     width: '40px', 
                                                     height: '40px',
                                                     cursor: popularPage === popularTotalPages ? 'not-allowed' : 'pointer',
                                                     opacity: popularPage === popularTotalPages ? 0.5 : 1
                                                 }}
                                             >
                                                 <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                     <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                 </svg>
                                             </a>
                                         </li>
                                     </ul>
                                 </nav>
                             </div>
                         )}
                    </div>
                </section>
            )}

            {/* 6. MIDDLE SLIDER */}
            {middleSliders.length > 0 && <SliderBanner sliders={middleSliders} />}

            {/* 6.5 DYNAMIC SECTIONS from Admin */}
            {sections.filter(s => !s.isDeal && s.position !== 'cooking_challenge').map(section => {
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
            {!isMobile && (
                <section className="section-padding pb-5">
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        <div className="section-title">
                            <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Best Deals</h3>
                        </div>

                        {/* Row 1: Two Wide Banners (605px each with 26px gap = 1236px) */}
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

                        {/* Row 2: Ad | Video | Ad (291px | 606px | 291px with 2x24px gaps = 1236px) */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                            {/* Left Advertisement */}
                            <div style={{ flex: '1 1 240px', maxWidth: '291px' }}>
                                {dr2c1 ? (
                                    <a href={getSliderLink(dr2c1)}>
                                        <img src={getAssetUrl(dr2c1.image)} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Left" />
                                    </a>
                                ) : (
                                    <img src={bestDealsR2Left} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Left" />
                                )}
                            </div>

                            {/* Center Video Banner */}
                            <div style={{ flex: '2 1 480px', maxWidth: '606px', position: 'relative' }}>
                                {dr2mid ? (
                                    <a href={getSliderLink(dr2mid)}>
                                        <img src={getAssetUrl(dr2mid.image)} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Mid" />
                                    </a>
                                ) : (
                                    <img src={bestDealsR2Mid} style={{ width: '100%', height: '346px', objectFit: 'fill', borderRadius: '10px' }} alt="Best Deal R2 Mid" />
                                )}
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
                                        <path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>

                            {/* Right Advertisement */}
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
                </section>
            )}

            {/* Mobile-Only Best Deals swipe carousel */}
            {isMobile && dealSection && dealBanners.length > 0 && (
                <section className="best-deals-mobile" style={{ background: '#F2FFD6', padding: '20px 0 35px 0', marginBottom: '20px' }}>
                    <div style={{ padding: '0 24px' }}>
                        <div className="section-title" style={{ margin: '0 0 12px 0' }}>
                            <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, lineHeight: '22px', margin: 0 }}>Best Deals</h3>
                        </div>
                        <div ref={homeDealsScrollRef} className="d-flex flex-nowrap overflow-auto" style={{ gap: '16px', paddingBottom: '5px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {dealBanners.map((banner, idx) => (
                                <div key={idx} style={{ width: '312px', height: '159px', flexShrink: 0, borderRadius: '9px', overflow: 'hidden' }}>
                                    <a href={getSliderLink(banner)}>
                                        <img src={getAssetUrl(banner.image)} alt={banner.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. BOTTOM SLIDER */}
            {bottomSliders.length > 0 && <SliderBanner sliders={bottomSliders} containerClass="container-fluid" maxCols={2} />}

            {/* 9. 4-Column Compact Products Section */}
            <section className="section-padding mb-10 mt-10">
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                    {/* Desktop/Tablet Grid View */}
                    {!isMobile && (
                        <div className="row text-start">
                            <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-md-0 mb-4">
                                <h4 className="section-title style-1 mb-30 product-list-small-section-title global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Top Selling</h4>
                                <div className="product-list-small d-flex flex-column" style={{ gap: '10px' }}>
                                    {topSellingList.map(p => (
                                        <div key={p.id}>
                                            <ProductSmallCard product={p} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-md-0 mb-4">
                                <h4 className="section-title style-1 mb-30 product-list-small-section-title global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Trending Products</h4>
                                <div className="product-list-small d-flex flex-column" style={{ gap: '10px' }}>
                                    {trendingList.map(p => (
                                        <div key={p.id}>
                                            <ProductSmallCard product={p} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-md-0 mb-4">
                                <h4 className="section-title style-1 mb-30 product-list-small-section-title global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Recently Added</h4>
                                <div className="product-list-small d-flex flex-column" style={{ gap: '10px' }}>
                                    {recentlyAddedList.map(p => (
                                        <div key={p.id}>
                                            <ProductSmallCard product={p} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-md-0 mb-4">
                                <h4 className="section-title style-1 mb-30 product-list-small-section-title global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Top Rated</h4>
                                <div className="product-list-small d-flex flex-column" style={{ gap: '10px' }}>
                                    {topRatedList.map(p => (
                                        <div key={p.id}>
                                            <ProductSmallCard product={p} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile Horizontal Scrolling Compact Product View (Dynamic & limited to 3 items) */}
                    {isMobile && (
                        <div className="d-flex flex-column" style={{ gap: '25px' }}>
                            <div>
                                <h4 className="section-title style-1 mb-15 global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Top Selling</h4>
                                <div className="scroll-container" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
                                    {topSellingList.map(p => (
                                        <div key={p.id} style={{ width: '92vw', flexShrink: 0 }}>
                                            <ProductSmallCard product={p} isMobile={true} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="section-title style-1 mb-15 global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Trending Products</h4>
                                <div className="scroll-container" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
                                    {trendingList.map(p => (
                                        <div key={p.id} style={{ width: '92vw', flexShrink: 0 }}>
                                            <ProductSmallCard product={p} isMobile={true} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="section-title style-1 mb-15 global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Recently Added</h4>
                                <div className="scroll-container" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
                                    {recentlyAddedList.map(p => (
                                        <div key={p.id} style={{ width: '92vw', flexShrink: 0 }}>
                                            <ProductSmallCard product={p} isMobile={true} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="section-title style-1 mb-15 global-heading-style" style={{ borderBottom: '2px solid #ececec', paddingBottom: '10px', fontWeight: 'bold', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>Top Rated</h4>
                                <div className="scroll-container" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
                                    {topRatedList.map(p => (
                                        <div key={p.id} style={{ width: '92vw', flexShrink: 0 }}>
                                            <ProductSmallCard product={p} isMobile={true} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 10. Upcoming Product Categories */}
            <section className="popular-categories section-padding pb-5">
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }} className="wow animate__animated animate__fadeIn">
                    <div className="section-title">
                        <div className="title">
                            <h3 className="global-heading-style" style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Upcoming Products & Categories</h3>
                        </div>
                    </div>
                    <div className="d-flex flex-nowrap flex-md-wrap overflow-auto justify-content-center" style={{ gap: '15px', paddingBottom: '15px' }}>
                        {['Beauty & Grooming', 'Makeup & Fragrances', 'Toys & Stationery', 'Health Wellness', 'Hardware', 'Auto Accessories', 'FMCG'].map(cat => (
                            <span key={cat} style={{ flexShrink: 0, whiteSpace: 'nowrap', background: '#EFEFEF', padding: '14px 37px', borderRadius: '20px', color: '#030303', fontSize: '16px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '22px', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseOver={(e) => { e.target.style.background = '#0A6738'; e.target.style.color = '#fff'; }} onMouseOut={(e) => { e.target.style.background = '#EFEFEF'; e.target.style.color = '#030303'; }}>{cat}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* 11. Dynamic Cooking Challenges Sections */}
            {!isMobile && sections.filter(s => s.position === 'cooking_challenge').map(section => {
                let items = [];
                try {
                    items = JSON.parse(section.image || '[]');
                } catch (e) {
                    console.error("Failed to parse cooking challenge JSON", e);
                }
                if (items.length === 0) return null;
                return (
                    <section key={section.id} className="section-padding" style={{ background: '#F2FFD6', margin: '20px 0', padding: '30px 0' }}>
                        <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }} className="wow animate__animated animate__fadeIn">
                            <div className="section-title" style={{ marginBottom: '10px', display: 'block' }}>
                                <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '32px', fontWeight: 600, lineHeight: '40px', marginBottom: '10px', textTransform: 'capitalize' }}>
                                    {section.name}
                                </h3>
                            </div>
                            <div className="d-flex flex-nowrap overflow-auto mb-2" style={{ gap: '20px', paddingBottom: '15px', justifyContent: items.length * 311 - 20 > 1200 ? 'flex-start' : 'center' }}>
                                {items.map((item, idx) => {
                                    const cardContent = (
                                        <div className="position-relative overflow-hidden hover-zoom-container" style={{ borderRadius: '12px', width: '291px', height: '200px', flexShrink: 0, border: '1px solid #e0e0e0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative' }}>
                                            <img src={getAssetUrl(item.image)} alt={item.description || `Cooking ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="hover-zoom" />
                                            {/* Video Play Button Overlay */}
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '45px', height: '45px', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="#0A6738" /></svg>
                                            </div>
                                            {item.description && (
                                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(10, 103, 56, 0.95)', color: '#fff', padding: '8px 12px', fontSize: '13px', fontWeight: 600, fontFamily: 'Poppins, sans-serif', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                    );

                                    return (
                                        <div key={idx} style={{ flexShrink: 0 }}>
                                            {item.linkType && item.linkType !== 'none' ? (
                                                <a href={getSliderLink(item)} style={{ display: 'block' }}>
                                                    {cardContent}
                                                </a>
                                            ) : cardContent}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* 11. Dynamic Cooking Challenges Sections - Mobile Version */}
            {isMobile && sections.filter(s => s.position === 'cooking_challenge').map(section => {
                let items = [];
                try {
                    items = JSON.parse(section.image || '[]');
                } catch (e) {
                    console.error("Failed to parse cooking challenge JSON", e);
                }
                if (items.length === 0) return null;
                return (
                    <section key={`mobile-${section.id}`} className="section-padding" style={{ background: '#F2FFD6', padding: '20px 0 15px 0', margin: '15px 0' }}>
                        <div style={{ padding: '0 15px' }}>
                            <div className="section-title" style={{ marginBottom: '10px', display: 'block' }}>
                                <h4 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>
                                    {section.name}
                                </h4>
                            </div>
                            <div className="d-flex flex-nowrap overflow-auto auto-scroll-container mb-15" style={{ gap: '14px', paddingBottom: '10px' }}>
                                {items.map((item, idx) => {
                                    const cardContent = (
                                        <div className="position-relative overflow-hidden hover-zoom-container" style={{ borderRadius: '6px', width: '149px', height: '101px', flexShrink: 0, border: '0.5px solid #ececec', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                            <img src={getAssetUrl(item.image)} alt={item.description || `Cooking ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {/* Video Play Button Overlay */}
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '26px', height: '26px', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 11.5L11 7.5L5.5 3.5V11.5Z" fill="#0A6738" /></svg>
                                            </div>
                                            {item.description && (
                                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(10, 103, 56, 0.9)', color: '#fff', padding: '3px 6px', fontSize: '8px', fontWeight: 600, fontFamily: 'Poppins, sans-serif', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                    );

                                    return (
                                        <div key={idx} style={{ flexShrink: 0 }}>
                                            {item.linkType && item.linkType !== 'none' ? (
                                                <a href={getSliderLink(item)} style={{ display: 'block' }}>
                                                    {cardContent}
                                                </a>
                                            ) : cardContent}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* 12. Why Families Choose Section */}
            <section className="section-padding" style={{ paddingTop: '40px', paddingBottom: '0px' }}>
                <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                    <h3 className="why-choose-title global-heading-style" style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 700, marginBottom: '30px' }}>Why Families Choose Yogi’s Farms</h3>

                    <div className="why-choose-banner" style={{ position: 'relative', width: '100%', borderRadius: '15px', overflow: 'hidden', marginBottom: '40px' }}>
                        <img src={whyChooseBg} alt="Why Choose Background" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img className="why-choose-logo" src={yogisLogoWhite} alt="YogisFarms Logo" style={{ display: 'block' }} />
                        </div>
                    </div>

                    <div className="row" style={{ marginBottom: '50px' }}>
                        <div className="col-md-5">
                            <p className="why-choose-desc-1" style={{ color: '#0A6738', fontSize: '16px', fontWeight: 600, lineHeight: '1.6', fontFamily: 'Poppins, sans-serif' }}>
                                At Yogi’s Farms, we believe food should do more than simply fill your plate it should nourish your body, support your lifestyle, and earn your trust every day. Every product we create reflects our commitment to purity, authenticity, and mindful farming practices.
                            </p>
                        </div>
                        <div className="col-md-7">
                            <p className="why-choose-desc-2" style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Poppins, sans-serif' }}>
                                In a world where convenience often compromises quality, we choose a different path. From carefully selected farms to traditional processing methods, every step is guided by transparency, care, and responsibility. We don’t believe in unnecessary shortcuts or excessive processing we believe in food the way nature intended.
                            </p>
                        </div>
                    </div>

                    <div className="row text-start why-choose-points-grid flex-nowrap flex-md-wrap overflow-auto auto-scroll-container" style={{ paddingBottom: '0px' }}>
                        <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconApproval} alt="Real Sourcing" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Real Sourcing, Never Bulk Trading</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Directly From Trusted Farms</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>We work closely with responsible farmers who follow sustainable and ethical agricultural practices. Instead of purchasing anonymous bulk stock, we carefully source every ingredient to ensure traceability, consistency, and freshness in every batch.</p>
                            </div>
                        </div>
                        <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconGears} alt="Naturally Processed" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Naturally Processed</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Keeping Nature Intact</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>Our products are processed with minimal intervention to preserve their natural nutrients, aroma, taste, and texture. We avoid excessive refining and artificial enhancement, allowing you to enjoy food in its purest form.</p>
                            </div>
                        </div>
                        <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconVision} alt="Complete Transparency" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Complete Transparency</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Honest Food You Can Trust</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>From sourcing to packaging, we maintain complete clarity about what goes into our products. No hidden ingredients, misleading claims, or unnecessary chemicals only clean, authentic food for your family.</p>
                            </div>
                        </div>
                        <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconApproval} alt="Quality" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>No Compromise on Quality</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Crafted With Care</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>We believe quality should never be sacrificed for mass production. Every batch is carefully handled and inspected to maintain purity, freshness, and consistency that you can rely on every day.</p>
                            </div>
                        </div>
                        <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconGears} alt="Everyday Homes" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Made for Everyday Homes</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Simple, Healthy Living</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>Our products are thoughtfully created for real families and daily kitchens. We focus on delivering nutritious essentials that support balanced lifestyles and wholesome meals.</p>
                            </div>
                        </div>
                        <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={iconVision} alt="Honest Value" style={{ width: '30px' }} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Honest Value</h4>
                                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Pay for Purity, Not Promotions</p>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>We invest in better sourcing and better ingredients instead of flashy marketing. This allows us to deliver genuine value through quality products that truly matter.</p>
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
