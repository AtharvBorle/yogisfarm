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
import feedbackProfile from '../assets/figma/image_find/feedback_profile.png';

export const Testimonials = () => {
    return (
        <section style={{ background: '#ECFFBE', overflow: 'hidden', padding: '80px 0' }}>
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
                <h3 style={{ color: '#0A6738', fontFamily: "Paytone One, sans-serif", fontSize: '36px', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                    What Our Customers Say
                </h3>
            </div>

            {/* Top Row (Sliding Left) */}
            <div className="marquee-container mb-4" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <div className="marquee-content">
                    {[
                        { name: 'Omkar Joshi', text: 'The wood-pressed groundnut oil is exactly like what we used to get in our village. Very pure, aromatic, and it adds a distinct flavor to our cooking that processed oils simply can\'t match. We\'ve been using it for over six months now and the quality has been consistently excellent. Highly recommend it for health-conscious families.' },
                        { name: 'Lakhan S', text: 'Finally found a brand that doesn\'t use chemicals or hidden additives. Their turmeric is so bright and natural, you can immediately tell the difference in the color and aroma. It\'s heartening to see a brand committed to traditional purity in this age of mass-produced, refined food. Definitely a permanent addition to our pantry.' },
                        { name: 'Pratik Ghodake', text: 'Great quality products across the board. The ghee has a very nice grainy texture and smells wonderful, just like homemade ghee. My parents were very impressed with the authenticity. It\'s rare to find such genuine products delivered right to your doorstep. The packaging is also very robust and premium.' },
                        { name: 'Atharv Borle', text: 'I\'ve tried many organic brands, but Yogi\'s Farm\'s honey is the most authentic I\'ve found. It\'s raw, unprocessed, and you can truly taste the floral notes. It\'s great to know that I\'m giving my family something truly natural. Their commitment to transparency is what makes me a loyal customer.' },
                        { name: 'Jayraj P', text: 'Ordered the cold pressed mustard oil for traditional cooking. It has that strong, authentic pungency that is missing in most market brands. It reminds me of the oil we used to get directly from the ghani. Excellent quality and very reasonably priced considering the purity and health benefits it offers.' },
                        { name: 'Avishkar Mandlik', text: 'The packaging is very premium and ensures that the oils reach us in perfect condition. The quality of the wood pressed oil is top-notch, with no chemical smell or aftertaste. We\'ve completely switched to Yogi\'s Farm for all our cooking needs and have noticed a significant improvement in the taste of our meals.' },
                        { name: 'Pravin Wadkar', text: 'Excellent service and genuine organic products. My family loves the taste of their spices, especially the chili powder which has the perfect balance of heat and color. The delivery was prompt and the customer support was very helpful with my queries. A very reliable brand for authentic food.' }
                    ].concat([
                        { name: 'Omkar Joshi', text: 'The wood-pressed groundnut oil is exactly like what we used to get in our village. Very pure, aromatic, and it adds a distinct flavor to our cooking that processed oils simply can\'t match. We\'ve been using it for over six months now and the quality has been consistently excellent. Highly recommend it for health-conscious families.' },
                        { name: 'Lakhan S', text: 'Finally found a brand that doesn\'t use chemicals or hidden additives. Their turmeric is so bright and natural, you can immediately tell the difference in the color and aroma. It\'s heartening to see a brand committed to traditional purity in this age of mass-produced, refined food. Definitely a permanent addition to our pantry.' },
                        { name: 'Pratik Ghodake', text: 'Great quality products across the board. The ghee has a very nice grainy texture and smells wonderful, just like homemade ghee. My parents were very impressed with the authenticity. It\'s rare to find such genuine products delivered right to your doorstep. The packaging is also very robust and premium.' },
                        { name: 'Atharv Borle', text: 'I\'ve tried many organic brands, but Yogi\'s Farm\'s honey is the most authentic I\'ve found. It\'s raw, unprocessed, and you can truly taste the floral notes. It\'s great to know that I\'m giving my family something truly natural. Their commitment to transparency is what makes me a loyal customer.' },
                        { name: 'Jayraj P', text: 'Ordered the cold pressed mustard oil for traditional cooking. It has that strong, authentic pungency that is missing in most market brands. It reminds me of the oil we used to get directly from the ghani. Excellent quality and very reasonably priced considering the purity and health benefits it offers.' },
                        { name: 'Avishkar Mandlik', text: 'The packaging is very premium and ensures that the oils reach us in perfect condition. The quality of the wood pressed oil is top-notch, with no chemical smell or aftertaste. We\'ve completely switched to Yogi\'s Farm for all our cooking needs and have noticed a significant improvement in the taste of our meals.' },
                        { name: 'Pravin Wadkar', text: 'Excellent service and genuine organic products. My family loves the taste of their spices, especially the chili powder which has the perfect balance of heat and color. The delivery was prompt and the customer support was very helpful with my queries. A very reliable brand for authentic food.' }
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
                        { name: 'Shuham', text: 'Their cold pressed oils are a game changer for my kitchen. Not only are they healthier, but they also have a much higher smoke point than I expected, making them versatile for all types of Indian cooking. The natural aroma that fills the kitchen while cooking is just amazing. Truly a superior product.' },
                        { name: 'Pallavi', text: 'I\'m very conscious about what my kids eat, and Yogi\'s Farm gives me complete peace of mind with their purity and transparency. From their oils to their pulses, everything feels clean and full of nutrition. It\'s wonderful to have a local brand that prioritizes health and tradition over profit margins.' },
                        { name: 'Mitesh W', text: 'The multi-floral honey is amazing. You can tell it\'s raw and unprocessed by its texture and rich flavor. It\'s become a staple in our morning routine. I also tried their rock salt and it\'s much better than the refined salts available in the market. Great job on maintaining such high standards.' },
                        { name: 'Jeevan Joshi', text: 'Highly impressed with the transparent sourcing model. You know exactly where your food comes from and how it\'s processed. This level of honesty is rare in the food industry today. The wood pressed oils have a rich, dense consistency that proves their purity. Will definitely be ordering more soon.' },
                        { name: 'Sayli', text: 'The aroma of the fresh groundnut oil makes everything taste better, from simple stir-fries to elaborate festive dishes. It\'s become the secret ingredient in my kitchen! I love that they stick to ancient methods instead of modern shortcuts. It\'s a brand that truly respects our culinary heritage.' },
                        { name: 'Rutuja', text: 'Best quality organic products at reasonable prices. The delivery was also very prompt and the staff is very courteous. I appreciate the detailed information provided for each product, which helps in making informed choices. Yogi\'s Farm has made switching to a healthier lifestyle so much easier.' },
                        { name: 'Atharv Borle', text: 'The taste of their organic spices is unmatched. Very high quality and consistently fresh. I\'ve recommended Yogi\'s Farm to all my friends and family who are looking for authentic, chemical-free food options. It\'s truly a brand you can trust with your eyes closed.' }
                    ].concat([
                        { name: 'Shuham', text: 'Their cold pressed oils are a game changer for my kitchen. Not only are they healthier, but they also have a much higher smoke point than I expected, making them versatile for all types of Indian cooking. The natural aroma that fills the kitchen while cooking is just amazing. Truly a superior product.' },
                        { name: 'Pallavi', text: 'I\'m very conscious about what my kids eat, and Yogi\'s Farm gives me complete peace of mind with their purity and transparency. From their oils to their pulses, everything feels clean and full of nutrition. It\'s wonderful to have a local brand that prioritizes health and tradition over profit margins.' },
                        { name: 'Mitesh W', text: 'The multi-floral honey is amazing. You can tell it\'s raw and unprocessed by its texture and rich flavor. It\'s become a staple in our morning routine. I also tried their rock salt and it\'s much better than the refined salts available in the market. Great job on maintaining such high standards.' },
                        { name: 'Jeevan Joshi', text: 'Highly impressed with the transparent sourcing model. You know exactly where your food comes from and how it\'s processed. This level of honesty is rare in the food industry today. The wood pressed oils have a rich, dense consistency that proves their purity. Will definitely be ordering more soon.' },
                        { name: 'Sayli', text: 'The aroma of the fresh groundnut oil makes everything taste better, from simple stir-fries to elaborate festive dishes. It\'s become the secret ingredient in my kitchen! I love that they stick to ancient methods instead of modern shortcuts. It\'s a brand that truly respects our culinary heritage.' },
                        { name: 'Rutuja', text: 'Best quality organic products at reasonable prices. The delivery was also very prompt and the staff is very courteous. I appreciate the detailed information provided for each product, which helps in making informed choices. Yogi\'s Farm has made switching to a healthier lifestyle so much easier.' },
                        { name: 'Atharv Borle', text: 'The taste of their organic spices is unmatched. Very high quality and consistently fresh. I\'ve recommended Yogi\'s Farm to all my friends and family who are looking for authentic, chemical-free food options. It\'s truly a brand you can trust with your eyes closed.' }
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
                    if (container.dataset.paused === 'true') return;

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

        const pause = (e) => e.currentTarget.dataset.paused = 'true';
        const resume = (e) => e.currentTarget.dataset.paused = 'false';

        containers.forEach(container => {
            container.addEventListener('touchstart', pause, { passive: true });
            container.addEventListener('touchend', resume, { passive: true });
            container.addEventListener('mouseenter', pause);
            container.addEventListener('mouseleave', resume);
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            containers.forEach(container => {
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
        <section className="section-padding pt-0 pb-5" style={{ background: '#FFF', overflow: 'hidden' }}>
            <div className="container" style={{ maxWidth: '1236px' }}>
                {/* Desktop Grid View */}
                <div className="row text-center d-none d-md-flex">
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

                {/* Mobile Drag/Flick View */}
                <div className="d-flex d-md-none overflow-auto auto-scroll-container" style={{ paddingBottom: '15px', WebkitOverflowScrolling: 'touch', gap: '15px' }}>
                    {displayPillars.map((pillar, i) => (
                        <div key={`mobile-${i}`} style={{ minWidth: '250px', maxWidth: '250px', textAlign: 'center', padding: '10px', flexShrink: 0 }}>
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
            </div>
        </section>
    );
};

export const PartnerLogos = () => {
    return (
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
    );
};

const FeatureBanners = () => {
    return (
        <>
            <Testimonials />
            <CorePillars />
            <PartnerLogos />
        </>
    );
};

export default FeatureBanners;
