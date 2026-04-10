import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import ProductCard from '../components/ProductCard';

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
            api.get('/products?popular=true&limit=8'),
            api.get('/products?deal=true&limit=8')
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
        if (slider.linkType === 'category') return `/category/${slider.link}`;
        if (slider.linkType === 'brand') return `/brand/${slider.link}`;
        if (slider.linkType === 'product') return `/product/${slider.link}`;
        return slider.link || '#';
    };

    // Reusable banner grid for slider arrays
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
            {/* 1. MAIN SLIDER — Hero banner at the very top */}
            {mainSliders.length > 0 && (
                <section className="">
                    <div className="home-slide-cover mt-10">
                        <div className="hero-slider-1 style-2 dot-style-1 dot-style-1-position-1">
                            {mainSliders.map(slider => (
                                <div key={slider.id}>
                                    <a href={getSliderLink(slider)}>
                                        <img src={getAssetUrl(slider.image)} alt={slider.name || ''} className="single-animation-wrap js-featuredItems single-hero-slider single-animation-wrap js-featuredItems rounded h-75 image-height" style={{ width: '100%' }} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 2. Featured Categories */}
            <section className="popular-categories section-padding">
                <div className="container wow animate__animated animate__fadeIn">
                    <div className="section-title">
                        <div className="title">
                            <h3>Featured Categories</h3>
                        </div>
                        <div className="slider-arrow slider-arrow-2 flex-right carausel-10-columns-arrow" id="carausel-10-columns-arrows"></div>
                    </div>
                    <div className="carausel-8-columns-cover position-relative">
                        <div className="carausel-8-columns" id="carausel-8-columns">
                            {categories.map(cat => (
                                <div key={cat.id} className="m-2 wow animate__animated animate__fadeInUp rounded-circle" data-wow-delay=".1s">
                                    <figure className="img-hover-scale overflow-hidden">
                                        <Link className="end" to={`/category/${cat.slug}`} style={{ padding: '8px 15px', fontSize: '14px' }}>
                                            <img src={getAssetUrl(cat.image)} alt={cat.name} className="p-2" />
                                        </Link>
                                        <h6 className="text-center">
                                            <Link className="end" to={`/category/${cat.slug}`} style={{ padding: '8px 15px', fontSize: '14px' }}>{cat.name}</Link>
                                        </h6>
                                    </figure>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TOP SLIDER — between Featured Categories and Featured Products */}
            {topSliders.length > 0 && <SliderBanner sliders={topSliders} />}

            {/* 4. Featured Products */}
            <section className="product-tabs section-padding position-relative">
                <div className="container">
                    <div className="section-title style-2 wow animate__animated animate__fadeIn">
                        <h3>Featured Products</h3>
                    </div>
                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="tab-one" role="tabpanel">
                            <div className="row product-grid-5">
                                {featuredProducts.map(product => (
                                    <div key={product.id} className="col-lg-1-5 col-md-4 col-6 col-sm-6">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Popular Products */}
            <section className="section-padding pb-5">
                <div className="container">
                    <div className="section-title">
                        <h3>Popular Products</h3>
                    </div>
                    <div className="row">
                        <div className="col-lg-12 col-md-12">
                            <div className="tab-content" id="myTabContent-1">
                                <div className="tab-pane fade show active" id="tab-one-1" role="tabpanel">
                                    <div className="carausel-4-clumn-cover arrow-center position-relative">
                                        <div className="slider-arrow slider-arrow-2 carausel--columns-arrow"></div>
                                        <div className="carausel-4-columns carausel-arrow-center mb-30" id="carausel-3-columns">
                                            {popularProducts.map(product => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. MIDDLE SLIDER — right below Popular Products */}
            {middleSliders.length > 0 && <SliderBanner sliders={middleSliders} />}

            {/* 7. Deals Section */}
            {dealProducts.length > 0 && (
                <section className="section-padding pb-5">
                    <div className="container">
                        <div className="section-title">
                            <h3>Deals Of The Day</h3>
                        </div>
                        <div className="row product-grid-5">
                            {dealProducts.map(product => (
                                <div key={product.id} className="col-lg-1-5 col-md-4 col-6 col-sm-6">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. BOTTOM SLIDER — below Deals of the Day */}
            {bottomSliders.length > 0 && <SliderBanner sliders={bottomSliders} containerClass="container-fluid" maxCols={2} />}
        </>
    );
};

export default Home;
