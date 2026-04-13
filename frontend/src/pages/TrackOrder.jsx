import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FeatureBanners from '../components/FeatureBanners';

const TrackOrder = () => {
    const [orderCode, setOrderCode] = useState('');

    const handleTrack = (e) => {
        e.preventDefault();
        // Since backend tracking logic is not provided yet, just alert for now.
        if (orderCode) {
            alert(`Tracking module for ${orderCode} is not yet linked to an endpoint.`);
        }
    };

    return (
        <main className="main">
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Track Order
                    </div>
                </div>
            </div>

            <div className="container mt-80 mb-80">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10" style={{ border: '1px solid #f2f2f2', borderRadius: '10px', padding: 0, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#D9D9D9', padding: '20px', textAlign: 'center', fontWeight: '700', color: '#7E7E7E', fontSize: '18px' }}>
                            Check Your Order Status
                        </div>
                        <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fff' }}>
                            <form onSubmit={handleTrack}>
                                <input 
                                    type="text" 
                                    placeholder="Enter Order Code" 
                                    value={orderCode}
                                    onChange={(e) => setOrderCode(e.target.value)}
                                    style={{ 
                                        padding: '18px', 
                                        border: '1px solid #ececec', 
                                        borderRadius: '8px', 
                                        width: '100%', 
                                        maxWidth: '500px',
                                        marginBottom: '30px',
                                        fontSize: '16px'
                                    }} 
                                    required
                                />
                                <div>
                                    <button 
                                        type="submit" 
                                        style={{ 
                                            backgroundColor: '#046938', 
                                            color: '#fff', 
                                            border: 'none', 
                                            padding: '15px 50px', 
                                            borderRadius: '8px', 
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Track Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <FeatureBanners />
        </main>
    );
};

export default TrackOrder;
