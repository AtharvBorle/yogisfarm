import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import FeatureBanners from '../components/FeatureBanners';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/categories')
            .then(res => {
                if(res.data.status) {
                    setCategories(res.data.categories);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
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
                overflow: 'hidden',
                marginLeft: '15px',
                marginRight: '15px'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    opacity: 0.1, backgroundImage: 'url(/assets/imgs/theme/breadcrumb-bg.jpg)', 
                    backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none'
                }}></div>

                <div className="container position-relative">
                    <div className="breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                        <div>
                            <Link to="/" style={{ color: '#fff', fontSize: '16px' }}><i className="fi-rs-home mr-5"></i>Home</Link>
                            <span style={{ margin: '0 10px' }}>›</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Category</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-50 mb-50">
                <div className="row">
                    {loading ? (
                        <div className="col-12 text-center"><p>Loading categories...</p></div>
                    ) : categories.length > 0 ? (
                        categories.map((cat) => (
                            <div key={cat.id} className="col-lg-2 col-md-3 col-sm-4 col-6 text-center mb-30 px-2">
                                <div style={{ 
                                    border: '1px solid #7ebf97', 
                                    borderRadius: '15px', 
                                    padding: '20px',
                                    marginBottom: '15px',
                                    height: '140px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#fff',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                }}>
                                    <Link to={`/category/${cat.slug}`}>
                                        <img src={getAssetUrl(cat.image)} alt={cat.name} style={{ maxWidth: '100%', maxHeight: '90px', objectFit: 'contain' }} />
                                    </Link>
                                </div>
                                <h6 style={{ fontWeight: '700', fontSize: '16px' }}>
                                    <Link to={`/category/${cat.slug}`} style={{ color: '#253D4E' }}>{cat.name}</Link>
                                </h6>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            <p>No categories found.</p>
                        </div>
                    )}
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default Category;
