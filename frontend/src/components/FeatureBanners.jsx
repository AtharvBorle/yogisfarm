import React from 'react';

const FeatureBanners = () => {
    return (
        <div className="container mt-60 mb-20 section-padding">
            <div className="row">
                {/* Organic and Sustainable Practices */}
                <div className="col-lg-3 col-md-6 mb-20">
                    <div style={{ background: '#FFF1F2', borderRadius: '10px', padding: '25px 20px', display: 'flex', alignItems: 'center', gap: '15px', height: '100px' }}>
                        <div style={{ flexShrink: 0 }}>
                            <img src="/assets/imgs/theme/icons/feature-1.png" alt="Organic" style={{ width: '50px' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                            <i className="fi-rs-leaf" style={{ fontSize: '30px', color: '#046938', display: 'none' }}></i>
                        </div>
                        <div>
                            <h6 style={{ color: '#046938', fontSize: '13px', fontWeight: '800', lineHeight: '1.2', marginBottom: '2px' }}>Organic and<br/>Sustainable Practices</h6>
                            <p style={{ fontSize: '10px', color: '#7E7E7E', margin: 0 }}>Chemical-Free Farming</p>
                        </div>
                    </div>
                </div>
                
                {/* Spiritual Harmony with Nature */}
                <div className="col-lg-3 col-md-6 mb-20">
                    <div style={{ background: '#F0F5FF', borderRadius: '10px', padding: '25px 20px', display: 'flex', alignItems: 'center', gap: '15px', height: '100px' }}>
                        <div style={{ flexShrink: 0 }}>
                            <img src="/assets/imgs/theme/icons/feature-2.png" alt="Spiritual" style={{ width: '50px' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                            <i className="fi-rs-magic-wand" style={{ fontSize: '30px', color: '#046938', display: 'none' }}></i>
                        </div>
                        <div>
                            <h6 style={{ color: '#046938', fontSize: '13px', fontWeight: '800', lineHeight: '1.2', marginBottom: '2px' }}>Spiritual Harmony<br/>with Nature</h6>
                            <p style={{ fontSize: '10px', color: '#7E7E7E', margin: 0 }}>Yogic Vibrations</p>
                        </div>
                    </div>
                </div>

                {/* Community Development */}
                <div className="col-lg-3 col-md-6 mb-20">
                    <div style={{ background: '#FFFBEA', borderRadius: '10px', padding: '25px 20px', display: 'flex', alignItems: 'center', gap: '15px', height: '100px' }}>
                        <div style={{ flexShrink: 0 }}>
                            <img src="/assets/imgs/theme/icons/feature-3.png" alt="Community" style={{ width: '50px' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                            <i className="fi-rs-users" style={{ fontSize: '30px', color: '#046938', display: 'none' }}></i>
                        </div>
                        <div>
                            <h6 style={{ color: '#046938', fontSize: '13px', fontWeight: '800', lineHeight: '1.2', marginBottom: '2px' }}>Community<br/>Development</h6>
                            <p style={{ fontSize: '10px', color: '#7E7E7E', margin: 0 }}>Supportive Partnerships</p>
                        </div>
                    </div>
                </div>

                {/* Innovative Techniques */}
                <div className="col-lg-3 col-md-6 mb-20">
                    <div style={{ background: '#E6F9EE', borderRadius: '10px', padding: '25px 20px', display: 'flex', alignItems: 'center', gap: '15px', height: '100px' }}>
                        <div style={{ flexShrink: 0 }}>
                            <img src="/assets/imgs/theme/icons/feature-4.png" alt="Innovative" style={{ width: '50px' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                            <i className="fi-rs-bulb" style={{ fontSize: '30px', color: '#046938', display: 'none' }}></i>
                        </div>
                        <div>
                            <h6 style={{ color: '#046938', fontSize: '13px', fontWeight: '800', lineHeight: '1.2', marginBottom: '2px' }}>Innovative<br/>Techniques</h6>
                            <p style={{ fontSize: '10px', color: '#7E7E7E', margin: 0 }}>Crop Circulation and Rotation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureBanners;
