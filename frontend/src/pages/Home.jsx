import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SliderComponent from 'react-slick';
import api, { getAssetUrl } from '../api';
import ProductCard from '../components/ProductCard';
import FeatureBanners from '../components/FeatureBanners';

const ProductSmallCard = ({ product }) => (
    <article className="row align-items-center mb-10">
        <figure className="col-md-4 mb-0">
            <Link to={`/product/${product.slug}`}>
                <img src={getAssetUrl(product.image)} alt={product.name} style={{ borderRadius: '5px', width: '100%', objectFit: 'cover' }} />
            </Link>
        </figure>
        <div className="col-md-8 mb-0">
            <h6 className="mb-0" style={{ lineHeight: '1.2' }}>
                <Link to={`/product/${product.slug}`} style={{ color: '#253D4E', fontSize: '13px', fontWeight: 'bold' }}>{product.name}</Link>
            </h6>
            <div className="product-rate-cover" style={{ marginTop: '5px' }}>
                <div className="product-rate d-inline-block">
                    <div className="product-rating" style={{ width: '90%' }}></div>
                </div>
                <span className="font-small ml-5 text-muted" style={{ fontSize: '12px' }}> (0)</span>
            </div>
            <div className="product-price" style={{ marginTop: '5px' }}>
                <span className="fs-6" style={{ color: '#046938', fontWeight: 'bold' }}>₹{product.salePrice || product.price}</span>
                {product.salePrice && product.salePrice < product.price && (
                    <span className="old-price font-md ml-5 text-muted" style={{ textDecoration: 'line-through', fontSize: '12px' }}>₹{product.price}</span>
                )}
            </div>
        </div>
    </article>
);

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
    const SliderBanner = ({ sliders, containerClass = 'container', maxCols = 4 }) => (
        <section className={`banners mb-25 ${!sliders.length ? 'd-none' : ''}`}>
            <div className={containerClass}>
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
                                        <figure 
                                            className="img-hover-scale overflow-hidden text-center"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/shop?category=${cat.slug}`)}
                                        >
                                            <div className="end" style={{ padding: '8px 15px', fontSize: '14px', display:'inline-block' }}>
                                                <img src={getAssetUrl(cat.image)} alt={cat.name} className="p-2 mx-auto" />
                                            </div>
                                            <h6 className="text-center">
                                                <span className="end" style={{ padding: '8px 15px', fontSize: '14px', color: '#253D4E' }}>{cat.name}</span>
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

            {/* 6.5 DYNAMIC SECTIONS from Admin */}
            {sections.map(section => {
                const products = section.category?.products || [];
                if (products.length === 0) return null;
                return (
                    <section key={section.id} className="section-padding pb-5">
                        <div className="container">
                            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontStyle: 'italic' }}>{section.name}</h3>
                                <Link to={`/shop?category=${section.category?.slug}`} style={{ color: '#046938', fontSize: '14px', fontWeight: '600' }}>View All →</Link>
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

            {/* 9. 4-Column Compact Products Section */}
            <section className="section-padding mb-30 mt-30">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-md-0">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '1px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#253D4E' }}>Top Selling</h4>
                            <div className="product-list-small">
                                {popularProducts.slice(0, 3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-md-0">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '1px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#253D4E' }}>Trending Products</h4>
                            <div className="product-list-small">
                                {dealProducts.slice(0, 3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-sm-5 mb-md-0 d-none d-lg-block">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '1px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#253D4E' }}>Recently added</h4>
                            <div className="product-list-small">
                                {popularProducts.length > 3 ? popularProducts.slice(3, 6).map(p => <ProductSmallCard key={p.id} product={p} />) : dealProducts.slice(0,3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-sm-5 mb-md-0 d-none d-xl-block">
                            <h4 className="section-title style-1 mb-30" style={{ borderBottom: '1px solid #ececec', paddingBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#253D4E' }}>Top Rated</h4>
                            <div className="product-list-small">
                                {featuredProducts.slice(0, 3).map(p => <ProductSmallCard key={p.id} product={p} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. Feature Banners (Perks) */}
            <FeatureBanners />
        </>
    );
};

export default Home;
