import React from 'react';
import { Link } from 'react-router-dom';
import FeatureBanners from '../components/FeatureBanners';

import { Check, Feather, Heart } from 'react-feather';

const About = () => {
    return (
        <main className="main pages">
            {/* Standard Breadcrumb - can be customized to green banner if desired, but screenshot shows standard style for About Us but green banner logic usually applies globally or per-page. We'll stick to a plain breadcrumb as seen in the screenshot or generic green. Let's use generic green for consistency */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> About us
                    </div>
                </div>
            </div>

            <div className="page-content pt-50">
                <div className="container">
                    {/* Welcome Section */}
                    <div className="row align-items-center mb-50">
                        <div className="col-lg-6 mb-lg-0 mb-4">
                            <img src="/assets/imgs/page/about-1.png" alt="About Yogi's Farm" style={{ width: '100%', borderRadius: '15px' }} onError={(e) => e.target.src='/assets/imgs/theme/logo.png'} />
                        </div>
                        <div className="col-lg-6">
                            <div className="pl-25">
                                <h2 className="mb-30" style={{ color: '#253D4E', fontWeight: '700' }}>Welcome to Yogi's Farm</h2>
                                <p className="mb-25">
                                    At Yogi's Farm, we believe that great health begins with great food. Our mission is to preserve the purity of traditional Indian food and bring it straight to your table.
                                    Our mission is simple yet profound - to provide 100% natural, unrefined, and authentic food staples that your family can trust every single day.
                                </p>
                                <p className="mb-50">
                                    We started our journey with a rich passion. The inspiration is the wisdom of our ancestors who valued deep, traditional, and natural food practices.
                                    Today, Yogi's Farm has grown into a trusted brand offering a wide range of premium products including Atta, Wood-pressed Oils, all crafted with love, purity, and profound dedication.
                                </p>
                                <p>Every product we harvest and every meal you prepare carries the promise of purity, tradition, and authenticity.</p>
                                
                                <div className="mt-30 d-flex gap-3">
                                    <img src="/assets/imgs/page/about-sm-1.jpg" alt="" style={{ width: '80px', borderRadius: '5px' }} />
                                    <img src="/assets/imgs/page/about-sm-2.jpg" alt="" style={{ width: '80px', borderRadius: '5px' }} />
                                    <img src="/assets/imgs/page/about-sm-3.jpg" alt="" style={{ width: '80px', borderRadius: '5px' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What We Provide */}
                    <section className="text-center mb-50 mt-50">
                        <h2 className="title style-3 mb-40" style={{ color: '#253D4E', fontWeight: '700' }}>What We Provide?</h2>
                        <div className="row justify-content-center">
                            <div className="col-lg-3 col-md-4 col-sm-6 mb-24">
                                <div className="featured-card text-center" style={{ border: '1px solid #ececec', padding: '40px 20px', borderRadius: '15px', height: '100%' }}>
                                    <img src="/assets/imgs/theme/icons/icon-1.svg" alt="" style={{ marginBottom: '20px' }} />
                                    <h5 className="mb-10" style={{ color: '#253D4E', fontWeight: '700' }}>Best Prices & Offers</h5>
                                    <p className="text-muted" style={{ fontSize: '14px' }}>Healthy food at affordable rates.</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 mb-24">
                                <div className="featured-card text-center" style={{ border: '1px solid #ececec', padding: '40px 20px', borderRadius: '15px', height: '100%' }}>
                                    <img src="/assets/imgs/theme/icons/icon-2.svg" alt="" style={{ marginBottom: '20px' }} />
                                    <h5 className="mb-10" style={{ color: '#253D4E', fontWeight: '700' }}>Wide Assortment</h5>
                                    <p className="text-muted" style={{ fontSize: '14px' }}>Atta, Dals, Oils & more under one roof.</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 mb-24">
                                <div className="featured-card text-center" style={{ border: '1px solid #ececec', padding: '40px 20px', borderRadius: '15px', height: '100%' }}>
                                    <img src="/assets/imgs/theme/icons/icon-3.svg" alt="" style={{ marginBottom: '20px' }} />
                                    <h5 className="mb-10" style={{ color: '#253D4E', fontWeight: '700' }}>Fast Delivery</h5>
                                    <p className="text-muted" style={{ fontSize: '14px' }}>Fresh products delivered quickly to your home.</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 mb-24">
                                <div className="featured-card text-center" style={{ border: '1px solid #ececec', padding: '40px 20px', borderRadius: '15px', height: '100%' }}>
                                    <img src="/assets/imgs/theme/icons/icon-4.svg" alt="" style={{ marginBottom: '20px' }} />
                                    <h5 className="mb-10" style={{ color: '#253D4E', fontWeight: '700' }}>100% Satisfaction</h5>
                                    <p className="text-muted" style={{ fontSize: '14px' }}>Pure quality, guaranteed.</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6 mb-24">
                                <div className="featured-card text-center" style={{ border: '1px solid #ececec', padding: '40px 20px', borderRadius: '15px', height: '100%' }}>
                                    <img src="/assets/imgs/theme/icons/icon-5.svg" alt="" style={{ marginBottom: '20px' }} />
                                    <h5 className="mb-10" style={{ color: '#253D4E', fontWeight: '700' }}>Great Daily Deal</h5>
                                    <p className="text-muted" style={{ fontSize: '14px' }}>Healthy living doesn't have to be expensive.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Our Promise */}
                    <div className="row align-items-center mb-50 mt-50">
                        <div className="col-lg-6 mb-lg-0 mb-4">
                            <div className="row">
                                <div className="col-6">
                                    <img src="/assets/imgs/page/about-2.png" alt="" style={{ width: '100%', borderRadius: '15px' }} />
                                </div>
                                <div className="col-6">
                                    <img src="/assets/imgs/page/about-3.png" alt="" style={{ width: '100%', borderRadius: '15px' }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="pl-25">
                                <h6 className="text-brand mb-10" style={{ color: '#046938' }}>Our Promise</h6>
                                <h2 className="mb-30" style={{ color: '#253D4E', fontWeight: '700', fontSize: '36px', lineHeight: '1.2' }}>When you choose Yogi's Farm, you choose:</h2>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li className="mb-15" style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ color: '#046938' }}><Check size={16} /></span> <strong>Purity:</strong> 100% natural and unrefined food without any adulteration.
                                    </li>
                                    <li className="mb-15" style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ color: '#046938' }}><Feather size={16} /></span> <strong>Nutrition:</strong> Products rich in vitamins, minerals, and natural goodness.
                                    </li>
                                    <li className="mb-15" style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ color: '#046938' }}><Feather size={16} color="green" /></span> <strong>Sustainability:</strong> Supporting eco-friendly and sustainable farming practices.
                                    </li>
                                    <li className="mb-15" style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ color: '#046938' }}><Heart size={16} color="red" /></span> <strong>Trust:</strong> Every item is processed and packed with care.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Three Columns Info */}
                    <div className="row mb-50 mt-50">
                        <div className="col-lg-4 col-md-6 mb-24">
                            <h4 className="mb-15" style={{ color: '#253D4E', fontWeight: '700' }}>Who we are</h4>
                            <p style={{ color: '#7E7E7E', fontSize: '15px' }}>
                                We are a passion-driven team delivering pure, natural, and wholesome food products sourced directly from farms.
                                Being farmers, we believe in bringing back traditional, healthy, and chemical-free eating.
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-24">
                            <h4 className="mb-15" style={{ color: '#253D4E', fontWeight: '700' }}>Our history</h4>
                            <p style={{ color: '#7E7E7E', fontSize: '15px' }}>
                                We have roots in traditional Indian agriculture. Over the years we expanded into Atta, Oils, and Dals backed by families.
                                Our journey is built on purity, authenticity, and a commitment to healthy food.
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-24">
                            <h4 className="mb-15" style={{ color: '#253D4E', fontWeight: '700' }}>Our mission</h4>
                            <p style={{ color: '#7E7E7E', fontSize: '15px' }}>
                                Our mission is to make healthy, nutritious, and farm-fresh staples accessible to every household.
                                We strive to empower farmers, promote sustainability, and create a positive impact on society.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Stats Banner */}
                <section className="mt-50 mb-50">
                    <div className="container-fluid p-0">
                        <div className="row" style={{ 
                            background: 'url(/assets/imgs/page/about-5.png) no-repeat center center',
                            backgroundSize: 'cover',
                            padding: '80px 0',
                            position: 'relative',
                            backgroundColor: '#046938' // Fallback
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(37,61,78,0.7)' }}></div>
                            <div className="container position-relative">
                                <div className="row text-center text-white">
                                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                                        <h1 className="text-white" style={{ fontSize: '48px', fontWeight: '700' }}>3+</h1>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>Glorious years</p>
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                                        <h1 className="text-white" style={{ fontSize: '48px', fontWeight: '700' }}>9+</h1>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>Happy clients</p>
                                    </div>
                                    <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
                                        <h1 className="text-white" style={{ fontSize: '48px', fontWeight: '700' }}>15+</h1>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>Projects complete</p>
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                                        <h1 className="text-white" style={{ fontSize: '48px', fontWeight: '700' }}>6+</h1>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>Team advisor</p>
                                    </div>
                                    <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
                                        <h1 className="text-white" style={{ fontSize: '48px', fontWeight: '700' }}>6+</h1>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>Products Sale</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default About;
