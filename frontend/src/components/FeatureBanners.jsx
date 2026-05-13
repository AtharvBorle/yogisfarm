import React from 'react';

// Import Figma assets
import img25 from '../assets/figma/img_25.png';
import iconApproval from '../assets/figma/icon_approval.svg';
import iconGears from '../assets/figma/icon_gears.svg';
import iconVision from '../assets/figma/icon_vision.svg';

// Import image_find assets
import chemicalFree from '../assets/figma/image_find/chemical_free.svg';
import crueltyFree from '../assets/figma/image_find/Cruelty free 1.svg';
import vegan from '../assets/figma/image_find/vegan 1.svg';
import vector1 from '../assets/figma/image_find/Vector (1).svg';
import freshLayer from '../assets/figma/image_find/freshlayer.svg';
import findUs from '../assets/figma/image_find/findus.svg';

const FeatureBanners = () => {
    const testimonialText = "Groundnut oils are generally costlier than other cooking oils like ricebran oil, sunflower oil, mustard oil etc. Found this Freedom Groundnut oil in Flipcart being sold at a low price almost at the price of Sunflower oil. Purchased it, used it and was delighted with its sweet aroma and antic taste.";

    return (
        <>
        <section className="section-padding pb-5 mt-5">
            <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>

                {/* ── Why Families Choose Yogi's Farms ── */}
                <div className="section-title">
                    <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 600, marginBottom: '30px' }}>
                        Why Families Choose Yogi's Farms
                    </h3>
                </div>

                {/* Banner Image */}
                <div className="row mb-40">
                    <div className="col-12 position-relative text-center">
                        <img src={img25} alt="Tea Garden" style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                    </div>
                </div>

                {/* Two-column text Intro */}
                <div className="row mb-50">
                    <div className="col-md-5 mb-4">
                        <h4 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, lineHeight: '32px', borderLeft: '4px solid #B2D33D', paddingLeft: '20px' }}>
                            We believe food should nourish your body, support your lifestyle, and earn your trust every single day. That's why we follow traditional methods, maintain strict quality standards, and ensure every batch reflects consistency and freshness.
                        </h4>
                    </div>
                    <div className="col-md-7 mb-4">
                        <p style={{ color: '#444', fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 400, lineHeight: '28px' }}>
                            In a world driven by speed and mass production, we choose honesty over shortcuts. At Yogi's Farm, every product begins at the source — with carefully selected farms, natural growing practices, and a commitment to preserving what truly matters. We don't believe in over processing or refining away the goodness; instead, we retain the natural taste, nutrition, and purity that real food is meant to have. What reaches your kitchen isn't just a product — it's a process rooted in care, transparency, and intention.
                        </p>
                    </div>
                </div>

                {/* Feature Blocks Grid */}
                <div className="row mb-50">
                    {[
                        {
                            title: 'Real Sourcing, Not Market Buying',
                            subtitle: 'Grown with intent, not sourced in bulk',
                            desc: 'We work directly with farmers who follow natural practices — not middlemen or mass suppliers. Every grain has a known origin, not an unknown journey.',
                            icon: iconApproval
                        },
                        {
                            title: 'Minimal Processing',
                            subtitle: "We don't over process what nature perfected",
                            desc: 'No excessive polishing, no aggressive refining. We retain the natural structure, nutrition, and taste, just the way it should be.',
                            icon: iconGears
                        },
                        {
                            title: 'Complete Transparent',
                            subtitle: 'Nothing hidden. nothing artificial.',
                            desc: 'From sourcing to packaging, everything is clear. No confusing labels, no hidden chemicals, just honest food you can trust.',
                            icon: iconVision
                        },
                        {
                            title: 'No Shortcuts in Quality',
                            subtitle: "Quality Isn't Optimized. It's Respected.",
                            desc: "We don't chase volume at the cost of value. Every batch is handled carefully, ensuring consistency, purity, and authenticity.",
                            icon: iconApproval
                        },
                        {
                            title: 'Made for Real Homes',
                            subtitle: 'What we serve Our families, we serve you',
                            desc: "Our products aren't designed for shelves — they're made for kitchens, for daily meals, for real health.",
                            icon: iconGears
                        },
                        {
                            title: 'Honest Value',
                            subtitle: 'You pay for purity, not marketing',
                            desc: 'No inflated claims, no gimmicks — just real value in every product you bring home.',
                            icon: iconVision
                        }
                    ].map((item, i) => (
                        <div key={i} className="col-lg-4 col-md-6 mb-40">
                            <div style={{ height: '100%', paddingRight: '20px' }}>
                                {/* Icon Container (72x72px with #ECFFBE background) */}
                                <div style={{ 
                                    width: '72px', 
                                    height: '72px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#ECFFBE', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '20px',
                                    border: i === 0 ? '2px solid #3AB0FF' : 'none',
                                    transition: 'transform 0.3s ease'
                                }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                    <img src={item.icon} alt="Feature Icon" style={{ width: '40px', height: '40px' }} />
                                </div>
                                <h5 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
                                    {item.title}
                                </h5>
                                <p style={{ color: '#000', fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                                    {item.subtitle}
                                </p>
                                <p style={{ color: '#666', fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '24px' }}>
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>

        {/* ── What Our Customers Say (Auto-sliding Marquee) ── */}
        <section style={{ background: '#ECFFBE', overflow: 'hidden', padding: '80px 0' }}>
            <style>
                {`
                @keyframes marquee-left { 
                    0% { transform: translateX(0); } 
                    100% { transform: translateX(-50%); } 
                } 
                @keyframes marquee-right { 
                    0% { transform: translateX(-50%); } 
                    100% { transform: translateX(0); } 
                } 
                .marquee-container { 
                    overflow: hidden; 
                    white-space: nowrap; 
                    width: 100%; 
                    position: relative; 
                } 
                .marquee-content { 
                    display: inline-flex; 
                    gap: 30px; 
                    animation: marquee-left 40s linear infinite; 
                } 
                .marquee-content.reverse { 
                    animation: marquee-right 40s linear infinite; 
                } 
                .marquee-content:hover { 
                    animation-play-state: paused; 
                }
                `}
            </style>
            
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '40px' }}>
                <h3 style={{ color: '#0A6738', fontFamily: "Paytone One, sans-serif", fontSize: '36px', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                    What Our Customers Say
                </h3>
            </div>
            
            {/* Top Row (Sliding Left) */}
            <div className="marquee-container mb-4" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <div className="marquee-content">
                    {[1, 2, 3, 4, 1, 2, 3, 4].map((item, i) => (
                        <div key={`top-${i}`} style={{ minWidth: '320px', maxWidth: '320px', background: '#fff', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', whiteSpace: 'normal', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                            <div className="d-flex align-items-center mb-2">
                                <img src={img25} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #0A6738', marginRight: '12px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/imgs/theme/icons/icon-user.svg'; e.currentTarget.style.border = 'none'; }} />
                                <h6 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#000' }}>
                                    Avishkar Mandlik
                                </h6>
                            </div>
                            <p style={{ fontSize: '11px', color: '#555', fontFamily: 'Poppins, sans-serif', margin: 0, lineHeight: '16px' }}>
                                Groundnut oils are generally costlier than other cooking oils like ricebran oil, sunflower oil, mustard oil etc. Found this Freedom Groundnut oil in Flipcart being sold at a low price almost at the price of Sunflower oil. Purchased it, used it and was delighted with its sweet aroma and antic taste.
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row (Sliding Right) */}
            <div className="marquee-container" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <div className="marquee-content reverse">
                    {[1, 2, 3, 4, 1, 2, 3, 4].map((item, i) => (
                        <div key={`bottom-${i}`} style={{ minWidth: '320px', maxWidth: '320px', background: '#fff', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', whiteSpace: 'normal', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                            <div className="d-flex align-items-center mb-2">
                                <img src={img25} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #0A6738', marginRight: '12px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons.svg#icon-user'; e.currentTarget.style.border = 'none'; }} />
                                <h6 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#000' }}>
                                    Avishkar Mandlik
                                </h6>
                            </div>
                            <p style={{ fontSize: '11px', color: '#555', fontFamily: 'Poppins, sans-serif', margin: 0, lineHeight: '16px' }}>
                                Groundnut oils are generally costlier than other cooking oils like ricebran oil, sunflower oil, mustard oil etc. Found this Freedom Groundnut oil in Flipcart being sold at a low price almost at the price of Sunflower oil. Purchased it, used it and was delighted with its sweet aroma and antic taste.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── 4 Core Pillars ── */}
        <section className="section-padding py-5" style={{ background: '#FFF', marginTop: '40px' }}>
            <div className="container" style={{ maxWidth: '1236px' }}>
                <div className="row text-center">
                    <div className="col-lg-3 col-md-6 mb-4">
                        <img src={chemicalFree} alt="100% Chemical Free" style={{ width: '90px', marginBottom: '25px', objectFit: 'contain' }} />
                        <div style={{ color: '#000000', fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>100% Chemical Free</div>
                        <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px', lineHeight: '22px', padding: '0 10px' }}>Manufacturing And Extraction Process Is Chemical-Free.</p>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-4">
                        <img src={crueltyFree} alt="100% Cruelty Free" style={{ width: '90px', marginBottom: '25px', objectFit: 'contain' }} />
                        <div style={{ color: '#000000', fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>100% Cruelty Free</div>
                        <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px', lineHeight: '22px', padding: '0 10px' }}>We Utilize Motors, Not Bullocks, To Churn Oil Using Ancient Methods.</p>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-4">
                        <img src={vegan} alt="100% Indian & Vegetarian" style={{ width: '90px', marginBottom: '25px', objectFit: 'contain' }} />
                        <div style={{ color: '#000000', fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>100% Indian & Vegetarian</div>
                        <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px', lineHeight: '22px', padding: '0 10px' }}>All Our Products Are Indian-Made, Excluding Himalayan Pink Rock Salt.</p>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-4">
                        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 25px auto' }}>
                            <img src={vector1} alt="Circle Background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                            <img src={freshLayer} alt="Always Fresh" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '60%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ color: '#000000', fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Always Fresh</div>
                        <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px', lineHeight: '22px', padding: '0 10px' }}>Orders Will Contain Oils Packed Within 8-10 Days.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* ── You Can Find Us On ── */}
        <section className="section-padding pb-5 mb-5" style={{ background: '#FFF' }}>
            <div className="container text-center" style={{ maxWidth: '1236px' }}>
                <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '26px', fontWeight: 700, marginBottom: '50px' }}>
                    You Can Find Us On
                </h3>
                <div className="d-flex justify-content-center">
                    <img src={findUs} alt="Partner Logos" style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
                </div>
            </div>
        </section>
        </>
    );
};

export default FeatureBanners;
