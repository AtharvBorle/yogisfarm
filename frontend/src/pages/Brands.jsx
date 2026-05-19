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
            {/* Clean Standard Breadcrumb */}
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Brands
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
