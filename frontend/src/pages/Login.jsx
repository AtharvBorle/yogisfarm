import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import toast from 'react-hot-toast';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const { fetchUser } = useAuth();
    const { fetchCart } = useCart(); // to refresh cart after guest cart migration
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
            <Breadcrumb items={[{ label: 'Login' }]} />
            <div className="container mb-80 mt-50">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="login_wrap widget-taber-content p-30 background-white border-radius-5">
                            <div className="padding_eight_all bg-white">
                                <div className="heading_s1">
                                    <h3 className="mb-30">Login / Register</h3>
                                </div>
                                {step === 1 ? (
                                    <form onSubmit={sendOtp}>
                                        <div className="form-group mb-3">
                                            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} name="phone" placeholder="Mobile Number (10 digits)" required />
                                        </div>
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-fill-out btn-block hover-up font-weight-bold" name="login">Send OTP</button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={verifyOtp}>
                                        <div className="form-group mb-3">
                                            <input type="text" value={phone} readOnly className="bg-light" />
                                        </div>
                                        <div className="form-group mb-3">
                                            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} name="otp" placeholder="Enter OTP" required />
                                        </div>
                                        <div className="login_footer form-group mb-50">
                                            <div className="text-muted"><a href="javascript:void(0);" onClick={sendOtp}>Resend OTP</a></div>
                                        </div>
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-fill-out btn-block hover-up font-weight-bold" name="verify">Verify & Login</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Login;
