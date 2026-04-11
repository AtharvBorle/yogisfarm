import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import FeatureBanners from '../components/FeatureBanners';

const Brands = () => {
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        api.get('/brands')
            .then(res => {
                if(res.data.status) {
                    setBrands(res.data.brands);
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <main className="main">
            {/* Custom Green Breadcrumb Banner */}
            <div className="page-header breadcrumb-wrap" style={{ 
                margin: '20px 0', 
                padding: '40px 0', 
                backgroundColor: '#046938', 
                borderRadius: '10px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background pattern placeholder - using transparent overlay for effect */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'url(/assets/imgs/theme/breadcrumb-bg.jpg)', 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    pointerEvents: 'none'
                }}></div>

                <div className="container position-relative">
                    <div className="breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                        <div>
                            <Link to="/" style={{ color: '#fff', fontSize: '16px' }}><i className="fi-rs-home mr-5"></i>Home</Link>
                            <span style={{ margin: '0 10px' }}>›</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Brands</span>
                        </div>
                        <div style={{ background: '#fff', color: '#046938', padding: '5px 25px', borderRadius: '50px', fontWeight: 'bold' }}>
                            Yogis
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mb-50">
                <div className="section-title text-start mb-40 mt-40">
                    <h2 style={{ fontSize: '32px', color: '#253D4E', fontWeight: '700' }}>Our Brands</h2>
                </div>

                {/* Brands Grid */}
                <div className="row">
                    {brands.length > 0 ? (
                        brands.map((brand) => (
                            <div key={brand.id} className="col-lg-3 col-md-4 col-sm-6 mb-30 text-center">
                                <div style={{ 
                                    border: '1px solid #7ebf97', 
                                    borderRadius: '15px', 
                                    padding: '30px',
                                    marginBottom: '15px',
                                    height: '250px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#fff'
                                }}>
                                    <Link to={`/shop?brand=${brand.slug}`}>
                                        <img src={getAssetUrl(brand.image)} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                                    </Link>
                                </div>
                                <h4 style={{ fontWeight: '700', color: '#253D4E', fontSize: '20px' }}>
                                    <Link to={`/shop?brand=${brand.slug}`}>{brand.name}</Link>
                                </h4>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            <p>Loading brands...</p>
                        </div>
                    )}
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Brands;
