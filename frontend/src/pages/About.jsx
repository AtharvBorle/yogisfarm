import React from 'react';
import { Link } from 'react-router-dom';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';

// Import Assets
import whyChooseBg from '../assets/figma/image_find/Why_choose_bg.png';
import yogisLogoWhite from '../assets/figma/image_find/Yogis-Farms-Logo-white 1.png';
import iconApproval from '../assets/figma/icon_approval.svg';
import iconGears from '../assets/figma/icon_gears.svg';
import iconVision from '../assets/figma/icon_vision.svg';

const About = () => {
    return (
        <main className="main pages">
            {/* Standard Breadcrumb */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Pages
                        <span></span> About Us
                    </div>
                </div>
            </div>

            <div className="page-content pt-10">
                {/* 12. Why Families Choose Section (Imported from Home page) */}
                <section className="section-padding" style={{ padding: '10px 0 20px 0' }}>
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 700, marginBottom: '30px' }}>Why Families Choose Yogi’s Farms</h3>
                        
                        <div style={{ position: 'relative', width: '100%', borderRadius: '15px', overflow: 'hidden', marginBottom: '40px' }}>
                            <img src={whyChooseBg} alt="Why Choose Background" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <img src={yogisLogoWhite} alt="YogisFarms Logo" style={{ width: '120px' }} />
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
                            <div className="col-md-4 mb-30">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={iconApproval} alt="Quality" style={{ width: '30px' }} />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>No Shortcuts in Quality</h4>
                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Quality Isn't Optimized. It's Respected.</p>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>We don't chase volume at the cost of value. Every batch is handled carefully, ensuring consistency, purity, and authenticity.</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-30">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={iconGears} alt="Real Homes" style={{ width: '30px' }} />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Made for Real Homes</h4>
                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>What we serve Our families, we serve you</p>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>Our products aren't designed for shelves — they're made for kitchens, for daily meals, for real health.</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-30">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={iconVision} alt="Honest Value" style={{ width: '30px' }} />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Honest Value</h4>
                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>You pay for purity, not marketing</p>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>No inflated claims, no gimmicks — just real value in every product you bring home.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Pillars (Pillars from Home page) */}
                <CorePillars />

                {/* Partner Logos (Find us on from Home page) */}
                <PartnerLogos />
            </div>

            <FloatingSidebar />
        </main>
    );
};

export default About;
