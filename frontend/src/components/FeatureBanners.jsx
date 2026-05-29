import React, { useEffect } from 'react';

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
const feedbackProfile = '/assets/imgs/feedback_avatar.svg';

export const Testimonials = () => {
    return (
        <section style={{ background: '#ECFFBE', overflow: 'hidden', padding: '40px 0' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
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
                @media (max-width: 767px) {
                    .auto-scroll-container {
                        flex-wrap: nowrap !important;
                    }
                    .auto-scroll-container::-webkit-scrollbar {
                        display: none !important;
                    }
                }
            `}} />

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '40px' }}>
                <h3 className="global-heading-style" style={{ color: '#0A6738', fontFamily: "Paytone One, sans-serif", fontWeight: 600, margin: 0, textAlign: 'center' }}>
                    What Our Customers Say
                </h3>
            </div>

            {/* Top Row (Sliding Left) */}
            <div className="marquee-container mb-4" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <div className="marquee-content">
                    {[
                        { name: 'Omkar Joshi', text: '“Finally found a trustworthy organic grocery brand in Pune! The wheat atta quality is amazing and tastes just like homemade chakki atta. Highly recommended for healthy families.”' },
                        { name: 'Lakhan S', text: '“The cold pressed oils from Yogi’s Farms are pure and aromatic. You can actually feel the difference in cooking quality and taste.”' },
                        { name: 'Pratik Ghodake', text: '“Fresh vegetables, premium dal, and healthy groceries delivered on time. Yogi’s Farms has become our go-to organic store.”' },
                        { name: 'Atharv Borle', text: '“Their millet atta collection is excellent for fitness and diabetic-friendly diets. Loved the freshness and packaging quality.”' },
                        { name: 'Jayraj P', text: '“I switched to Yogi’s Farms for healthier eating habits and the results are amazing. The products feel natural and chemical-free.”' },
                        { name: 'Avishkar Mandlik', text: '“Very impressed with the farm fresh quality and customer service. The tofu and soy paneer are super fresh every time.”' },
                        { name: 'Pravin Wadkar', text: '“Authentic organic grocery products with premium quality. The Lakdi Ghana groundnut oil tastes exactly like traditional village oil.”' },
                        { name: 'Shubham K', text: '“Best organic grocery delivery service in Pune. Fresh products, quick delivery, and excellent packaging.”' }
                    ].concat([
                        { name: 'Omkar Joshi', text: '“Finally found a trustworthy organic grocery brand in Pune! The wheat atta quality is amazing and tastes just like homemade chakki atta. Highly recommended for healthy families.”' },
                        { name: 'Lakhan S', text: '“The cold pressed oils from Yogi’s Farms are pure and aromatic. You can actually feel the difference in cooking quality and taste.”' },
                        { name: 'Pratik Ghodake', text: '“Fresh vegetables, premium dal, and healthy groceries delivered on time. Yogi’s Farms has become our go-to organic store.”' },
                        { name: 'Atharv Borle', text: '“Their millet atta collection is excellent for fitness and diabetic-friendly diets. Loved the freshness and packaging quality.”' },
                        { name: 'Jayraj P', text: '“I switched to Yogi’s Farms for healthier eating habits and the results are amazing. The products feel natural and chemical-free.”' },
                        { name: 'Avishkar Mandlik', text: '“Very impressed with the farm fresh quality and customer service. The tofu and soy paneer are super fresh every time.”' },
                        { name: 'Pravin Wadkar', text: '“Authentic organic grocery products with premium quality. The Lakdi Ghana groundnut oil tastes exactly like traditional village oil.”' },
                        { name: 'Shubham K', text: '“Best organic grocery delivery service in Pune. Fresh products, quick delivery, and excellent packaging.”' }
                    ]).map((item, i) => (
                        <div key={`top-${i}`} style={{ minWidth: '400px', maxWidth: '400px', background: '#fff', borderRadius: '15px', padding: '25px', display: 'flex', flexDirection: 'column', whiteSpace: 'normal', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                            <div className="d-flex align-items-center mb-3">
                                <img src={feedbackProfile} alt={item.name} style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover' }} />
                                <h6 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 600, color: '#000' }}>
                                    {item.name}
                                </h6>
                             </div>
                            <p style={{ fontSize: '13px', color: '#555', fontFamily: 'Poppins, sans-serif', margin: 0, lineHeight: '20px' }}>
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row (Sliding Right) */}
            <div className="marquee-container" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <div className="marquee-content reverse">
                    {[
                        { name: 'Pallavi M', text: '“Yogi’s Farms provides healthy groceries at reasonable prices. Perfect for families who care about clean eating and nutrition.”' },
                        { name: 'Mitesh W', text: '“The multigrain atta and dal quality are outstanding. Freshness, purity, and healthy nutrition in every product.”' },
                        { name: 'Jeevan Joshi', text: '“I love the healthy and traditional product range. It’s difficult to find genuine organic grocery products like these online.”' },
                        { name: 'Sayli G', text: '“The products feel premium and natural. Excellent choice for anyone looking for a healthier lifestyle and organic food options.”' },
                        { name: 'Rutuja S', text: '“Their customer support is very helpful and responsive. Great shopping experience from ordering to delivery.”' },
                        { name: 'Amit P', text: '“The freshness of vegetables and groceries is unmatched. Yogi’s Farms truly delivers farm-to-home quality.”' },
                        { name: 'Sneha R', text: '“Perfect place to buy healthy pantry essentials online. Clean packaging, natural products, and trustworthy quality.”' }
                    ].concat([
                        { name: 'Pallavi M', text: '“Yogi’s Farms provides healthy groceries at reasonable prices. Perfect for families who care about clean eating and nutrition.”' },
                        { name: 'Mitesh W', text: '“The multigrain atta and dal quality are outstanding. Freshness, purity, and healthy nutrition in every product.”' },
                        { name: 'Jeevan Joshi', text: '“I love the healthy and traditional product range. It’s difficult to find genuine organic grocery products like these online.”' },
                        { name: 'Sayli G', text: '“The products feel premium and natural. Excellent choice for anyone looking for a healthier lifestyle and organic food options.”' },
                        { name: 'Rutuja S', text: '“Their customer support is very helpful and responsive. Great shopping experience from ordering to delivery.”' },
                        { name: 'Amit P', text: '“The freshness of vegetables and groceries is unmatched. Yogi’s Farms truly delivers farm-to-home quality.”' },
                        { name: 'Sneha R', text: '“Perfect place to buy healthy pantry essentials online. Clean packaging, natural products, and trustworthy quality.”' }
                    ]).map((item, i) => (
                        <div key={`bottom-${i}`} style={{ minWidth: '400px', maxWidth: '400px', background: '#fff', borderRadius: '15px', padding: '25px', display: 'flex', flexDirection: 'column', whiteSpace: 'normal', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                            <div className="d-flex align-items-center mb-3">
                                <img src={feedbackProfile} alt={item.name} style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover' }} />
                                <h6 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 600, color: '#000' }}>
                                    {item.name}
                                </h6>
                            </div>
                            <p style={{ fontSize: '13px', color: '#555', fontFamily: 'Poppins, sans-serif', margin: 0, lineHeight: '20px' }}>
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const CorePillars = () => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const containers = document.querySelectorAll('.auto-scroll-container');
        let animationFrameId;
        let lastTime = 0;
        const speedPerSecond = 35;

        const animate = (time) => {
            if (!lastTime) lastTime = time;
            const deltaTime = time - lastTime;
            lastTime = time;

            if (window.innerWidth <= 768) {
                const moveAmount = (speedPerSecond * deltaTime) / 1000;

                containers.forEach(container => {
                    if (container.dataset.paused === 'true') {
                        container._wasPaused = true;
                        return;
                    }
                    
                    if (container._wasPaused) {
                        // Sync internal tracking with manual scroll position
                        container._exactScrollLeft = container.scrollLeft;
                        container._wasPaused = false;
                    }
                    
                    if (typeof container._exactScrollLeft === 'undefined') {
                        container._exactScrollLeft = container.scrollLeft;
                    }

                    container._exactScrollLeft += moveAmount;

                    const { scrollWidth, clientWidth } = container;
                    if (container._exactScrollLeft + clientWidth >= scrollWidth - 1) {
                        container._exactScrollLeft = 0;
                        container.scrollLeft = 0;
                    } else {
                        container.scrollLeft = container._exactScrollLeft;
                    }
                });
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        const pause = (e) => {
            const container = e.currentTarget;
            container.dataset.paused = 'true';
            clearTimeout(container._resumeTimeout);
        };
        const resume = (e) => {
            const container = e.currentTarget;
            clearTimeout(container._resumeTimeout);
            container._resumeTimeout = setTimeout(() => {
                container.dataset.paused = 'false';
            }, 500);
        };

        containers.forEach(container => {
            container.addEventListener('touchstart', pause, { passive: true });
            container.addEventListener('touchend', resume, { passive: true });
            container.addEventListener('mouseenter', pause);
            container.addEventListener('mouseleave', resume);
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            containers.forEach(container => {
                clearTimeout(container._resumeTimeout);
                container.removeEventListener('touchstart', pause);
                container.removeEventListener('touchend', resume);
                container.removeEventListener('mouseenter', pause);
                container.removeEventListener('mouseleave', resume);
            });
        };
    }, []);

    const pillars = [
        {
            id: 1,
            img: chemicalFree,
            title: "100% Chemical Free",
            desc: "Manufacturing And Extraction Process Is Chemical-Free."
        },
        {
            id: 2,
            img: crueltyFree,
            title: "100% Cruelty Free",
            desc: "We Utilize Motors, Not Bullocks, To Churn Oil Using Ancient Methods."
        },
        {
            id: 3,
            img: vegan,
            title: "100% Indian & Vegetarian",
            desc: "All Our Products Are Indian-Made, Excluding Himalayan Pink Rock Salt."
        },
        {
            id: 4,
            isLayered: true,
            title: "Always Fresh",
            desc: "Orders Will Contain Oils Packed Within 8-10 Days."
        }
    ];

    const displayPillars = [...pillars, ...pillars];

    return (
        <section style={{ background: '#FFF', overflow: 'hidden', paddingTop: '40px', paddingBottom: '40px' }}>
            <div className="container" style={{ maxWidth: '1236px' }}>
                {/* Desktop Grid View */}
                {!isMobile && (
                    <div className="row text-center">
                        {pillars.map((pillar) => (
                            <div key={`desktop-${pillar.id}`} className="col-lg-3 col-md-6 mb-4">
                                {pillar.isLayered ? (
                                    <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 25px auto' }}>
                                        <img src={vector1} alt="Circle Background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                                        <img src={freshLayer} alt="Always Fresh" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '60%', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <img src={pillar.img} alt={pillar.title} style={{ width: '90px', marginBottom: '25px', objectFit: 'contain' }} />
                                )}
                                <div style={{ color: '#000000', fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>{pillar.title}</div>
                                <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px', lineHeight: '22px', padding: '0 10px' }}>{pillar.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile 2x2 Grid View */}
                {isMobile && (
                    <div className="row" style={{ margin: '0 -5px', rowGap: '20px' }}>
                        {pillars.map((pillar) => (
                            <div key={`mobile-${pillar.id}`} className="col-6" style={{ padding: '0 5px', textAlign: 'center' }}>
                                {pillar.isLayered ? (
                                    <div style={{ position: 'relative', width: '42px', height: '42px', margin: '0 auto 10px auto' }}>
                                        <img src={vector1} alt="Circle Background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                                        <img src={freshLayer} alt="Always Fresh" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '60%', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <img src={pillar.img} alt={pillar.title} style={{ width: '42px', height: '42px', marginBottom: '10px', objectFit: 'contain' }} />
                                )}
                                <div style={{ color: '#000000', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, marginBottom: '6px', lineHeight: '14px', textTransform: 'capitalize' }}>{pillar.title}</div>
                                <p style={{ color: '#000', fontFamily: 'Poppins, sans-serif', fontSize: '8px', fontWeight: 400, lineHeight: '12px', padding: '0 5px' }}>{pillar.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export const PartnerLogos = () => {
    return null; // Commented out "You Can Find Us On" section on all pages
    /*
    return (
        <section className="section-padding pb-5 mb-5" style={{ background: '#FFF' }}>
            <div className="container text-center" style={{ maxWidth: '1236px' }}>
                <h3 className="global-heading-style" style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 700, marginBottom: '50px' }}>
                    You Can Find Us On
                </h3>
                <div className="d-flex justify-content-center">
                    <img src={findUs} alt="Partner Logos" style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
                </div>
            </div>
        </section>
    );
    */
};

const FeatureBanners = ({ showTestimonialsOnMobile = true }) => {
    return (
        <>
            {showTestimonialsOnMobile ? (
                <Testimonials />
            ) : (
                <div className="d-none d-md-block">
                    <Testimonials />
                </div>
            )}
            <CorePillars />
            <PartnerLogos />
        </>
    );
};

export default FeatureBanners;
