import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CorePillars, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';
import useSEO from '../hooks/useSEO';

// Import Assets
import whyChooseBg from '../assets/figma/image_find/Why_choose_bg.png';
import yogisLogoWhite from '../assets/figma/image_find/Yogis-Farms-Logo-white.svg';
import iconApproval from '../assets/figma/icon_approval.svg';
import iconGears from '../assets/figma/icon_gears.svg';
import iconVision from '../assets/figma/icon_vision.svg';
import iconQuality from '../assets/figma/image_find/4-quality.svg';
import iconHome from '../assets/figma/image_find/5-home.svg';
import iconValues from '../assets/figma/image_find/6-values.svg';

const About = () => {
    useSEO({ key: 'about', canonical: 'https://yogisfarms.com/about-us' });

    useEffect(() => {
        let canonicalTag = document.querySelector('link[rel="canonical"]');
        let created = false;
        if (!canonicalTag) {
            canonicalTag = document.createElement('link');
            canonicalTag.rel = 'canonical';
            document.head.appendChild(canonicalTag);
            created = true;
        }
        canonicalTag.href = 'https://yogisfarms.com/about-us';

        return () => {
            if (created && canonicalTag.parentNode) {
                canonicalTag.parentNode.removeChild(canonicalTag);
            }
        };
    }, []);
    return (
        <main className="main pages">
            {/* Standard Breadcrumb */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> About Us
                    </div>
                </div>
            </div>

            <div className="page-content pt-10">
                {/* 12. Why Families Choose Section (Imported from Home page) */}
                <section className="section-padding" style={{ padding: '10px 0 20px 0' }}>
                    <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
                        <style dangerouslySetInnerHTML={{
                            __html: `
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
                            @media (max-width: 767px) {
                                .why-choose-logo {
                                    height: 24px !important;
                                    width: auto !important;
                                }
                            }
                        `}} />
                        <h3 className="global-heading-style" style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 700, marginBottom: '30px' }}>Why Families Choose Yogi’s Farms</h3>
                        
                        <div className="why-choose-banner" style={{ position: 'relative', width: '100%', borderRadius: '15px', overflow: 'hidden', marginBottom: '40px' }}>
                            <img src={whyChooseBg} alt="Why Choose Background" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img className="why-choose-logo" src={yogisLogoWhite} alt="YogisFarms Logo" style={{ display: 'block' }} />
                            </div>
                        </div>

                        <div className="row" style={{ marginBottom: '50px' }}>
                            <div className="col-md-5">
                                <p style={{ color: '#0A6738', fontSize: '16px', fontWeight: 600, lineHeight: '1.6', fontFamily: 'Poppins, sans-serif' }}>
                                    At Yogi’s Farms, we believe food should do more than simply fill your plate it should nourish your body, support your lifestyle, and earn your trust every day. Every product we create reflects our commitment to purity, authenticity, and mindful farming practices.
                                </p>
                            </div>
                            <div className="col-md-7">
                                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Poppins, sans-serif' }}>
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
                                        <img src={iconQuality} alt="Quality" style={{ width: '30px' }} />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>No Compromise on Quality</h4>
                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Crafted With Care</p>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>We believe quality should never be sacrificed for mass production. Every batch is carefully handled and inspected to maintain purity, freshness, and consistency that you can rely on every day.</p>
                                </div>
                            </div>
                            <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={iconHome} alt="Everyday Homes" style={{ width: '30px' }} />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Made for Everyday Homes</h4>
                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Simple, Healthy Living</p>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>Our products are thoughtfully created for real families and daily kitchens. We focus on delivering nutritious essentials that support balanced lifestyles and wholesome meals.</p>
                                </div>
                            </div>
                            <div className="col-10 col-sm-6 col-md-4 mb-30" style={{ flexShrink: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F2FFD6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={iconValues} alt="Honest Value" style={{ width: '30px' }} />
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0A6738', margin: 0 }}>Honest Value</h4>
                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#333' }}>Pay for Purity, Not Promotions</p>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>We invest in better sourcing and better ingredients instead of flashy marketing. This allows us to deliver genuine value through quality products that truly matter.</p>
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
