import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import FeatureBanners from '../components/FeatureBanners';
import toast from 'react-hot-toast';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const { fetchUser } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const sendOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/send-otp', { phone });
            if (res.data.status) {
                toast.success(res.data.message);
                setStep(2);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/verify-otp', { phone, otp });
            if (res.data.status) {
                toast.success(res.data.message);
                fetchUser();
                fetchCart(); // Fetch new merged cart
                navigate(redirect);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        }
    };

    return (
        <main className="main">
            <div className="page-header breadcrumb-wrap" style={{ margin: '0 0 20px 0' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
                        <span></span> Login
                    </div>
                </div>
            </div>

            <div className="container mb-80 mt-80">
                <div className="row align-items-center">
                    {/* Left side illustration */}
                    <div className="col-lg-6 pr-30 d-none d-lg-block text-center">
                        <img className="border-radius-15" src="/assets/imgs/page/login-1.png" alt="Yogi's Farm Login" style={{ maxWidth: '80%' }} onError={(e) => { e.target.src='/assets/imgs/theme/login-image.webp'; e.target.onerror=null; }} />
                    </div>
                    
                    {/* Right side Form */}
                    <div className="col-lg-6 col-md-8 offset-lg-0 offset-md-2">
                        <div className="login_wrap widget-taber-content p-30 background-white border-radius-5">
                            <div className="padding_eight_all bg-white" style={{ textAlign: 'center' }}>
                                <div className="heading_s1" style={{ marginBottom: '40px' }}>
                                    <h2 style={{ fontSize: '36px', color: '#253D4E', fontWeight: '800' }}>
                                        {step === 1 ? 'Enter Your Mobile Number' : 'Enter OTP Code'}
                                    </h2>
                                </div>
                                
                                {step === 1 ? (
                                    <form onSubmit={sendOtp} style={{ maxWidth: '400px', margin: '0 auto' }}>
                                        <div className="form-group mb-30">
                                            <input 
                                                type="text" 
                                                value={phone} 
                                                onChange={(e) => setPhone(e.target.value)} 
                                                name="phone" 
                                                placeholder="Mobile Number" 
                                                required 
                                                style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, borderBottom: '2px solid #eee', fontSize: '18px', textAlign: 'center' }}
                                            />
                                        </div>
                                        <div className="form-group mb-30" style={{ textAlign: 'left' }}>
                                            <button 
                                                type="submit" 
                                                style={{ backgroundColor: '#046938', color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '5px', fontWeight: 'bold' }}
                                            >
                                                Send OTP
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={verifyOtp} style={{ maxWidth: '400px', margin: '0 auto' }}>
                                        <div className="form-group mb-20">
                                            <input 
                                                type="text" 
                                                value={phone} 
                                                readOnly 
                                                className="bg-light"
                                                style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, borderBottom: '2px solid #ececec', fontSize: '18px', textAlign: 'center', color: '#7E7E7E' }} 
                                            />
                                        </div>
                                        <div className="form-group mb-30">
                                            <input 
                                                type="text" 
                                                value={otp} 
                                                onChange={(e) => setOtp(e.target.value)} 
                                                name="otp" 
                                                placeholder="Enter 6-digit OTP" 
                                                required 
                                                style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, borderBottom: '2px solid #253D4E', fontSize: '18px', textAlign: 'center' }}
                                            />
                                        </div>
                                        <div className="login_footer form-group mb-30" style={{ textAlign: 'left' }}>
                                            <div className="text-muted">
                                                Didn't receive? <a href="javascript:void(0);" onClick={sendOtp} style={{ color: '#046938', fontWeight: 'bold' }}>Resend OTP</a>
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ textAlign: 'left' }}>
                                            <button 
                                                type="submit" 
                                                style={{ backgroundColor: '#046938', color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '5px', fontWeight: 'bold' }}
                                            >
                                                Verify & Login
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <FeatureBanners />
        </main>
    );
};

export default Login;
