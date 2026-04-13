import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SliderComponent from 'react-slick';
import api, { getAssetUrl } from '../api';
import ProductCard from '../components/ProductCard';

const Slider = SliderComponent.default ? SliderComponent.default : SliderComponent;

const Home = () => {
    const [mainSliders, setMainSliders] = useState([]);
    const [topSliders, setTopSliders] = useState([]);
    const [middleSliders, setMiddleSliders] = useState([]);
    const [bottomSliders, setBottomSliders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [dealProducts, setDealProducts] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/sliders?position=main'),
            api.get('/sliders?position=top'),
            api.get('/sliders?position=middle'),
            api.get('/sliders?position=bottom'),
            api.get('/categories?featured=true'),
            api.get('/products?featured=true&limit=10'),
            api.get('/products?popular=true&limit=10'),
            api.get('/products?deal=true&limit=10')
        ]).then(([mainRes, topRes, midRes, bottomRes, catRes, featuredRes, popularRes, dealRes]) => {
            if(mainRes.data.status) setMainSliders(mainRes.data.sliders);
            if(topRes.data.status) setTopSliders(topRes.data.sliders);
            if(midRes.data.status) setMiddleSliders(midRes.data.sliders);
            if(bottomRes.data.status) setBottomSliders(bottomRes.data.sliders);
            if(catRes.data.status) setCategories(catRes.data.categories);
            if(featuredRes.data.status) setFeaturedProducts(featuredRes.data.products);
            if(popularRes.data.status) setPopularProducts(popularRes.data.products);
            if(dealRes.data.status) setDealProducts(dealRes.data.products);
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
    const SliderBanner = ({ sliders, containerClass = 'container', maxCols = 4 }) => (
        <section className={`banners mb-25 ${!sliders.length ? 'd-none' : ''}`}>
            <div className={containerClass}>
                <div className="row">
                    {sliders.map(slider => (
                        <div key={slider.id} className={`col-lg-${Math.floor(12 / Math.min(sliders.length, maxCols))} col-md-6 mb-10`}>
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
                <section className="">
                    <div className="home-slide-cover mt-10">
                        <div className="hero-slider-1 style-2 dot-style-1 dot-style-1-position-1">
                            <Slider {...heroSettings}>
                                {mainSliders.map(slider => (
                                    <div key={slider.id}>
                                        <a href={getSliderLink(slider)}>
                                            <img src={getAssetUrl(slider.image)} alt={slider.name || ''} className="single-animation-wrap js-featuredItems single-hero-slider single-animation-wrap js-featuredItems rounded h-75 image-height" style={{ width: '100%' }} />
                                        </a>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </section>
            )}

            {/* 2. Featured Categories */}
            {categories.length > 0 && (
                <section className="popular-categories section-padding">
                    <div className="container wow animate__animated animate__fadeIn">
                        <div className="section-title">
                            <div className="title">
                                <h3>Featured Categories</h3>
                            </div>
                        </div>
                        <div className="position-relative">
                            <Slider {...categorySettings}>
                                {categories.map(cat => (
                                    <div key={cat.id} className="m-2 wow animate__animated animate__fadeInUp rounded-circle" data-wow-delay=".1s">
                                        <figure className="img-hover-scale overflow-hidden text-center">
                                            <Link className="end" to={`/shop?category=${cat.slug}`} style={{ padding: '8px 15px', fontSize: '14px', display:'inline-block' }}>
                                                <img src={getAssetUrl(cat.image)} alt={cat.name} className="p-2 mx-auto" />
                                            </Link>
                                            <h6 className="text-center">
                                                <Link className="end" to={`/shop?category=${cat.slug}`} style={{ padding: '8px 15px', fontSize: '14px' }}>{cat.name}</Link>
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

            {/* 4. Featured Products (Block Grid) */}
            {featuredProducts.length > 0 && (
                <section className="product-tabs section-padding position-relative">
                    <div className="container">
                        <div className="section-title style-2 wow animate__animated animate__fadeIn">
                            <h3>Featured Products</h3>
                        </div>
                        <div className="tab-content">
                            <div className="tab-pane fade show active">
                                <div className="row product-grid-5">
                                    {featuredProducts.map(product => (
                                        <div key={product.id} className="col-lg-1-5 col-md-4 col-12 col-sm-6">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Popular Products (Carousel Slider) */}
            {popularProducts.length > 0 && (
                <section className="section-padding pb-5">
                    <div className="container">
                        <div className="section-title">
                            <h3>Popular Products</h3>
                        </div>
                        <div className="position-relative">
                            <Slider {...productSliderSettings}>
                                {popularProducts.map(product => (
                                    <div key={product.id} className="px-2">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. MIDDLE SLIDER */}
            {middleSliders.length > 0 && <SliderBanner sliders={middleSliders} />}

            {/* 7. Deals Section (Carousel Slider) */}
            {dealProducts.length > 0 && (
                <section className="section-padding pb-5">
                    <div className="container">
                        <div className="section-title">
                            <h3>Deals Of The Day</h3>
                        </div>
                        <div className="position-relative">
                            <Slider {...productSliderSettings}>
                                {dealProducts.map(product => (
                                    <div key={product.id} className="px-2">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </section>
            )}

            {/* 8. BOTTOM SLIDER */}
            {bottomSliders.length > 0 && <SliderBanner sliders={bottomSliders} containerClass="container-fluid" maxCols={2} />}
        </>
    );
};

export default Home;
