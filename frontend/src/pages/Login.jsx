import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [otpVals, setOtpVals] = useState(['', '', '', '', '', '']);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [step, setStep] = useState(1);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const { fetchUser, user, loading: authLoading } = useAuth();
    const { fetchCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const [resendTimer, setResendTimer] = useState(0);

    React.useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Restore timer state on page mount
    React.useEffect(() => {
        const savedPhone = localStorage.getItem('yogisfarm_login_phone');
        const savedTime = localStorage.getItem('yogisfarm_login_otp_sent_time');
        const savedStep = localStorage.getItem('yogisfarm_login_step');

        if (savedPhone && savedTime && savedStep === '2') {
            const elapsed = Math.floor((Date.now() - Number(savedTime)) / 1000);
            if (elapsed < 120) {
                setPhone(savedPhone);
                setStep(2);
                setResendTimer(120 - elapsed);
            } else {
                setPhone(savedPhone);
                setStep(2);
                setResendTimer(0);
            }
        }
    }, []);

    React.useEffect(() => {
        if (!authLoading && user) {
            if (!user.name || !user.email) {
                setStep(3);
                if (user.phone) {
                    setPhone(user.phone);
                }
            } else {
                navigate(redirect);
            }
        }
    }, [user, authLoading, navigate, redirect]);

    const sendOtp = async (e) => {
        if (e) e.preventDefault();
        if (resendTimer > 0) return;
        if (!phone || phone.length < 10) {
            return toast.error('Please enter a valid 10-digit mobile number');
        }
        setSendingOtp(true);
        try {
            const res = await api.post('/auth/send-otp', { phone });
            if (res.data.status) {
                toast.success(res.data.message);
                
                // Save to localStorage
                localStorage.setItem('yogisfarm_login_phone', phone);
                localStorage.setItem('yogisfarm_login_otp_sent_time', String(Date.now()));
                localStorage.setItem('yogisfarm_login_step', '2');

                setStep(2);
                setOtpVals(['', '', '', '', '', '']);
                setResendTimer(120); // 2 minutes countdown
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setSendingOtp(false);
        }
    };

    const verifyOtp = async (e) => {
        if (e) e.preventDefault();
        const otpCode = otpVals.join('');
        if (otpCode.length < 6) {
            return toast.error('Please enter the 6-digit OTP code');
        }
        setVerifyingOtp(true);
        try {
            const res = await api.post('/auth/verify-otp', { phone, otp: otpCode });
            if (res.data.status) {
                toast.success(res.data.message);
                
                // Clear localStorage
                localStorage.removeItem('yogisfarm_login_phone');
                localStorage.removeItem('yogisfarm_login_otp_sent_time');
                localStorage.removeItem('yogisfarm_login_step');

                if (res.data.needsDetails) {
                    setStep(3);
                } else {
                    await fetchUser();
                    fetchCart();
                    navigate(redirect);
                }
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const submitDetails = async (e) => {
        e.preventDefault();
        if (!agreeTerms) {
            return toast.error('You must agree to the Terms & Conditions and Policies to register.');
        }
        try {
            const res = await api.post('/auth/submit-details', { name, email });
            if (res.data.status) {
                toast.success('Registration successful!');

                // Clear localStorage
                localStorage.removeItem('yogisfarm_login_phone');
                localStorage.removeItem('yogisfarm_login_otp_sent_time');
                localStorage.removeItem('yogisfarm_login_step');

                await fetchUser();
                fetchCart();
                navigate(redirect);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save details');
        }
    };

    const handleBackToStep1 = () => {
        localStorage.removeItem('yogisfarm_login_phone');
        localStorage.removeItem('yogisfarm_login_otp_sent_time');
        localStorage.removeItem('yogisfarm_login_step');
        setStep(1);
        setResendTimer(0);
        setOtpVals(['', '', '', '', '', '']);
    };

    // Auto-shifting OTP input functions
    const handleOtpChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return; // numbers only
        const char = value.slice(-1);
        const nextVals = [...otpVals];
        nextVals[index] = char;
        setOtpVals(nextVals);

        if (char && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otpVals[index] && index > 0) {
                const nextVals = [...otpVals];
                nextVals[index - 1] = '';
                setOtpVals(nextVals);
                const prevInput = document.getElementById(`otp-input-${index - 1}`);
                if (prevInput) prevInput.focus();
            } else {
                const nextVals = [...otpVals];
                nextVals[index] = '';
                setOtpVals(nextVals);
            }
        }
    };

    const handleOtpPaste = (e) => {
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtpVals(digits);
            const lastInput = document.getElementById('otp-input-5');
            if (lastInput) lastInput.focus();
            e.preventDefault();
        }
    };

    return (
        <main className="main" style={{ minHeight: '80vh', background: '#FFF', display: 'flex', flexDirection: 'column' }}>
            {/* STYLES BLOCK FOR FIGMA PIXEL-PERFECT RESPONSIBILITY */}
            <style>{`
                .login-split-container {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 50px;
                    align-items: center;
                    max-width: 1200px;
                    width: 100%;
                    margin: 60px auto;
                    padding: 0 20px;
                    box-sizing: border-box;
                }

                .login-illustration-card {
                    border-radius: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    min-height: 520px;
                    transition: background 0.3s ease;
                }

                .login-illustration-img {
                    max-width: 100%;
                    max-height: 420px;
                    object-fit: contain;
                }

                .login-form-card {
                    background: #F7F7F7;
                    border-radius: 28px;
                    padding: 60px 40px;
                    max-width: 482px;
                    width: 100%;
                    margin: 0 auto;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.02);
                }

                .login-title {
                    color: #0A6738;
                    font-family: 'Poppins', sans-serif;
                    font-size: 26px;
                    font-weight: 700;
                    margin: 0 0 10px;
                    text-transform: capitalize;
                }

                .login-subtitle {
                    color: #000;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    margin: 0 0 24px;
                    text-transform: capitalize;
                }

                .login-input-mobile {
                    width: 100%;
                    height: 56px;
                    border-radius: 6px;
                    border: 1px solid #000;
                    background: #FFF;
                    font-size: 15px;
                    padding: 0 16px;
                    box-sizing: border-box;
                    font-family: 'Poppins', sans-serif;
                    margin-bottom: 24px;
                    outline: none;
                }

                .login-input-mobile:focus {
                    border-color: #0A6738;
                    box-shadow: 0 0 0 2px rgba(10, 103, 56, 0.1);
                }

                .login-otp-container {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    margin-bottom: 24px;
                }

                .login-otp-box {
                    flex: 1;
                    min-width: 0;
                    max-width: 52px;
                    height: 56px;
                    border-radius: 6px;
                    border: 1px solid #000;
                    background: #FFF;
                    text-align: center;
                    font-size: 20px;
                    font-weight: 600;
                    font-family: 'Poppins', sans-serif;
                    box-sizing: border-box;
                }

                .login-otp-box:focus {
                    border-color: #0A6738;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(10, 103, 56, 0.1);
                }

                .login-btn-submit {
                    width: 100%;
                    height: 56px;
                    border-radius: 12px;
                    background: #0A6738;
                    color: #FFF;
                    font-family: 'Poppins', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease, transform 0.1s ease;
                }

                .login-btn-submit:hover {
                    background: #08522c;
                }

                .login-btn-submit:active {
                    transform: scale(0.98);
                }

                .login-link-action {
                    color: #0A6738;
                    font-weight: 600;
                    text-decoration: underline;
                    cursor: pointer;
                }

                @media (max-width: 991px) {
                    .login-split-container {
                        grid-template-columns: 1fr;
                        gap: 30px;
                        margin: 30px auto;
                    }

                    .login-illustration-card {
                        min-height: auto;
                        padding: 20px;
                    }

                    .login-illustration-img {
                        max-height: 280px;
                    }

                    .login-form-card {
                        padding: 40px 24px;
                    }
                }

                @media (max-width: 480px) {
                    .login-otp-container {
                        gap: 6px;
                    }
                    .login-otp-box {
                        height: 48px;
                        font-size: 16px;
                    }
                }
            `}</style>

            <div className="login-split-container">
                {/* LEFT SIDE ILLUSTRATION (DYNAMIC SVGs BASED ON STEP) */}
                <div 
                    className="login-illustration-card" 
                    style={{ background: step === 1 ? '#FFF' : '#EBFFF5' }}
                >
                    <img 
                        src={step === 1 ? "/assets/imgs/login.svg" : "/assets/imgs/Enter_OTP.svg"} 
                        alt={step === 1 ? "Computer Login" : "Enter OTP Verification"} 
                        className="login-illustration-img"
                        onError={(e) => {
                            // Fallback in case images are in assets directory instead of public
                            e.target.src = step === 1 
                                ? "https://api.builder.io/api/v1/image/assets/TEMP/cae29a5bf4aa55dc7ba69fa252f1eb5d1215a326"
                                : "https://api.builder.io/api/v1/image/assets/TEMP/5b5ba67e60cbcc3d282e90c4665b6237de000e16";
                        }}
                    />
                </div>

                {/* RIGHT SIDE FORM CARD */}
                <div className="login-form-card">
                    <h2 className="login-title">Welcome Back</h2>
                    
                    {step === 1 && (
                        <form onSubmit={sendOtp}>
                            <p className="login-subtitle">Enter your mobile number</p>
                            <input 
                                type="text"
                                className="login-input-mobile"
                                placeholder="mobile number"
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                required
                            />
                            <button type="submit" disabled={sendingOtp} className="login-btn-submit">
                                {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={verifyOtp}>
                            <p className="login-subtitle">
                                Enter code sent to +91 {phone} <span onClick={handleBackToStep1} className="login-link-action" style={{fontSize: '12px', marginLeft: '5px'}}>Change</span>
                            </p>
                            <div className="login-otp-container" onPaste={handleOtpPaste}>
                                {otpVals.map((val, idx) => (
                                    <input 
                                        key={idx}
                                        id={`otp-input-${idx}`}
                                        type="text"
                                        className="login-otp-box"
                                        maxLength={1}
                                        value={val}
                                        onChange={e => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                                        required
                                    />
                                ))}
                            </div>
                            <button type="submit" disabled={verifyingOtp} className="login-btn-submit" style={{marginBottom: '15px'}}>
                                {verifyingOtp ? 'Verifying...' : 'Verify & Login'}
                            </button>
                            <div style={{textAlign: 'center', fontSize: '13px', color: '#666'}}>
                                Didn't receive code?{' '}
                                {resendTimer > 0 ? (
                                    <span style={{ fontWeight: '600', color: '#888' }}>
                                        Resend OTP in {formatTime(resendTimer)}
                                    </span>
                                ) : (
                                    <span onClick={sendOtp} className="login-link-action">
                                        Resend OTP
                                    </span>
                                )}
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={submitDetails}>
                            <p className="login-subtitle">Please complete your registration</p>
                            
                            <div style={{marginBottom: '15px'}}>
                                <label style={{fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px'}}>Full Name</label>
                                <input 
                                    type="text"
                                    className="login-input-mobile"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    style={{marginBottom: 0}}
                                />
                            </div>

                            <div style={{marginBottom: '24px'}}>
                                <label style={{fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '5px'}}>Email Address</label>
                                <input 
                                    type="email"
                                    className="login-input-mobile"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{marginBottom: 0}}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#253D4E', lineHeight: '1.4' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={agreeTerms} 
                                        onChange={e => setAgreeTerms(e.target.checked)}
                                        required
                                        style={{ width: '16px', height: '16px', accentColor: '#0A6738', flexShrink: 0, marginTop: '2px' }} 
                                    />
                                    <span>I Agree To The <Link to="/terms" target="_blank" style={{ color: '#0A6738', textDecoration: 'underline' }}>Terms & Conditions</Link>, <Link to="/shipping" target="_blank" style={{ color: '#0A6738', textDecoration: 'underline' }}>Shipping Policy</Link>, <Link to="/return-policy" target="_blank" style={{ color: '#0A6738', textDecoration: 'underline' }}>Return, Refund And Cancellation Policy</Link> & <Link to="/privacy" target="_blank" style={{ color: '#0A6738', textDecoration: 'underline' }}>Privacy Policy</Link></span>
                                </label>
                            </div>

                            <button type="submit" className="login-btn-submit">
                                Submit Details
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Login;
