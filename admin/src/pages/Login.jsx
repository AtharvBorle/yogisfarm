import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Figma Assets
import loginBg from '../assets/login_page.png';
import yogisLogo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { fetchAdmin } = useAuth();
    const navigate = useNavigate();

    // 2FA Verification State
    const [require2FA, setRequire2FA] = useState(false);
    const [otpVals, setOtpVals] = useState(['', '', '', '', '', '']);
    const [maskedPhone, setMaskedPhone] = useState('');
    const [verifying2fa, setVerifying2fa] = useState(false);

    // Forgot Password State
    const [mode, setMode] = useState('login'); // 'login' or 'forgot'
    const [otpSent, setOtpSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            if (res.data.status) {
                if (res.data.require2FA) {
                    setMaskedPhone(res.data.phone);
                    setRequire2FA(true);
                    setOtpVals(['', '', '', '', '', '']);
                    toast.success('Two-factor OTP sent to registered number');
                } else {
                    toast.success('Login successful');
                    fetchAdmin();
                    navigate('/');
                }
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        const otpCode = otpVals.join('');
        if (otpCode.length < 6) {
            return toast.error('Please enter the 6-digit OTP code');
        }
        setVerifying2fa(true);
        try {
            const res = await api.post('/login/verify-2fa', { email, otp: otpCode });
            if (res.data.status) {
                toast.success('Login successful');
                fetchAdmin();
                navigate('/');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        }
        setVerifying2fa(false);
    };

    const handleForgotPasswordSendOtp = async (e) => {
        e.preventDefault();
        setSendingOtp(true);
        try {
            const res = await api.post('/forgot-password/send-otp', { email });
            if (res.data.status) {
                setMaskedPhone(res.data.phone);
                setOtpSent(true);
                setOtpVals(['', '', '', '', '', '']);
                toast.success('OTP sent to registered mobile number');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        }
        setSendingOtp(false);
    };

    const handleForgotPasswordReset = async (e) => {
        e.preventDefault();
        const otpCode = otpVals.join('');
        if (otpCode.length < 6) {
            return toast.error('Please enter the 6-digit OTP code');
        }
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setResetting(true);
        try {
            const res = await api.post('/forgot-password/reset', { email, otp: otpCode, newPassword });
            if (res.data.status) {
                toast.success('Password reset successfully. Please login with your new password.');
                setMode('login');
                setOtpSent(false);
                setOtpVals(['', '', '', '', '', '']);
                setNewPassword('');
                setConfirmPassword('');
                setPassword('');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        }
        setResetting(false);
    };

    // Auto-shifting OTP input functions
    const handleOtpChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return;
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
        <div className="admin-login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F9', padding: '20px' }}>
            <style>{`
                .admin-login-card {
                    width: 1026px;
                    min-height: 680px;
                    border-radius: 8px;
                    border: 1px solid #D5D5D5;
                    background: #FFF;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    display: grid;
                    grid-template-columns: 1fr 1.05fr;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .admin-login-left {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #EBFFF5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .admin-login-bg-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    position: absolute;
                    top: 0;
                    left: 0;
                    opacity: 0.95;
                }

                .admin-login-logo {
                    position: relative;
                    z-index: 2;
                    width: 140px;
                    height: auto;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
                }

                .admin-login-right {
                    padding: 50px 45px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    box-sizing: border-box;
                }

                .admin-login-title {
                    color: #0A6738;
                    font-family: 'Poppins', sans-serif;
                    font-size: 25px;
                    font-weight: 700;
                    margin: 0 0 4px;
                    text-transform: capitalize;
                }

                .admin-login-subtitle {
                    color: #000;
                    font-family: 'Poppins', sans-serif;
                    font-size: 25px;
                    font-weight: 500;
                    margin: 0 0 10px;
                    text-transform: capitalize;
                }

                .admin-login-desc {
                    color: #898989;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    margin: 0 0 25px;
                }

                .admin-login-group {
                    margin-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .admin-login-label {
                    color: #333;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                }

                .admin-login-input {
                    width: 100%;
                    height: 56px;
                    border-radius: 6px;
                    border: 1px solid #000;
                    background: #FFF;
                    font-size: 15px;
                    padding: 0 16px;
                    box-sizing: border-box;
                    font-family: 'Poppins', sans-serif;
                    outline: none;
                }

                .admin-login-input:focus {
                    border-color: #0A6738;
                    box-shadow: 0 0 0 2px rgba(10, 103, 56, 0.1);
                }

                .admin-login-otp-container {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .admin-login-otp-box {
                    width: 52px;
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

                .admin-login-otp-box:focus {
                    border-color: #0A6738;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(10, 103, 56, 0.1);
                }

                .admin-login-btn {
                    width: 100%;
                    height: 49px;
                    border-radius: 12px;
                    background: #FF1A00;
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

                .admin-login-btn:hover {
                    background: #e01700;
                }

                .admin-login-btn:active {
                    transform: scale(0.98);
                }

                .admin-login-action-link {
                    color: #0A6738;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: underline;
                }

                @media (max-width: 991px) {
                    .admin-login-card {
                        grid-template-columns: 1fr;
                        width: 100%;
                        max-width: 500px;
                        min-height: auto;
                    }

                    .admin-login-left {
                        display: none;
                    }

                    .admin-login-right {
                        padding: 40px 30px;
                    }
                }
            `}</style>

            <div className="admin-login-card">
                {/* LEFT COLUMN: FIGMA BACKGROUND IMAGE & CENTRED LOGO */}
                <div className="admin-login-left">
                    <img src={loginBg} alt="Admin Background" className="admin-login-bg-img" />
                    <img src={yogisLogo} alt="Yogis Farms Logo" className="admin-login-logo" />
                </div>

                {/* RIGHT COLUMN: INTERACTIVE FORM PANELS */}
                <div className="admin-login-right">
                    <h2 className="admin-login-title">Welcome to Yogis farms</h2>
                    <h3 className="admin-login-subtitle">Admin</h3>

                    {/* 2FA OTP MODE */}
                    {require2FA && (
                        <form onSubmit={handleVerify2FA}>
                            <p className="admin-login-desc" style={{ color: '#0A6738', fontWeight: '600' }}>
                                Two-Factor Authentication Active
                            </p>
                            <div style={{ marginBottom: '20px', padding: '12px', background: '#eafaf1', border: '1px solid #d4edda', borderRadius: '6px', fontSize: '13px', color: '#155724', lineHeight: '1.5' }}>
                                We have sent a verification code to your registered mobile number: <strong>+91 {maskedPhone}</strong>
                            </div>
                            
                            <div className="admin-login-group">
                                <label className="admin-login-label" style={{ textAlign: 'center', display: 'block', marginBottom: '4px' }}>Enter 6-digit OTP</label>
                                <div className="admin-login-otp-container" onPaste={handleOtpPaste}>
                                    {otpVals.map((val, idx) => (
                                        <input 
                                            key={idx}
                                            id={`otp-input-${idx}`}
                                            type="text"
                                            className="admin-login-otp-box"
                                            maxLength={1}
                                            value={val}
                                            onChange={e => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(idx, e)}
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={verifying2fa} className="admin-login-btn" style={{ marginBottom: '20px' }}>
                                {verifying2fa ? 'Verifying...' : 'Login'}
                            </button>

                            <div style={{ textAlign: 'center', fontSize: '13px' }}>
                                <span onClick={() => setRequire2FA(false)} className="admin-login-action-link">Back to Sign In</span>
                            </div>
                        </form>
                    )}

                    {/* FORGOT PASSWORD RECOVERY MODE */}
                    {!require2FA && mode === 'forgot' && (
                        <form onSubmit={otpSent ? handleForgotPasswordReset : handleForgotPasswordSendOtp}>
                            <p className="admin-login-desc">Reset Admin Password</p>

                            {!otpSent ? (
                                <>
                                    <div className="admin-login-group">
                                        <label className="admin-login-label">Enter Registered Admin Email</label>
                                        <input 
                                            type="email" 
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            className="admin-login-input" 
                                            required 
                                            placeholder="admin@yogisfarm.in" 
                                        />
                                    </div>
                                    <button type="submit" disabled={sendingOtp} className="admin-login-btn" style={{ marginBottom: '20px' }}>
                                        {sendingOtp ? 'Sending OTP...' : 'Send OTP to Mobile'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ marginBottom: '20px', padding: '12px', background: '#eafaf1', border: '1px solid #d4edda', borderRadius: '6px', fontSize: '13px', color: '#155724', lineHeight: '1.5' }}>
                                        OTP sent to registered mobile number: <strong>+91 {maskedPhone}</strong>
                                    </div>

                                    <div className="admin-login-group">
                                        <label className="admin-login-label" style={{ textAlign: 'center', display: 'block', marginBottom: '4px' }}>Enter 6-digit OTP</label>
                                        <div className="admin-login-otp-container" onPaste={handleOtpPaste}>
                                            {otpVals.map((val, idx) => (
                                                <input 
                                                    key={idx}
                                                    id={`otp-input-${idx}`}
                                                    type="text"
                                                    className="admin-login-otp-box"
                                                    maxLength={1}
                                                    value={val}
                                                    onChange={e => handleOtpChange(idx, e.target.value)}
                                                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                                                    required
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="admin-login-group">
                                        <label className="admin-login-label">New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPassword} 
                                            onChange={e => setNewPassword(e.target.value)} 
                                            className="admin-login-input" 
                                            required 
                                            placeholder="Enter new password" 
                                        />
                                    </div>

                                    <div className="admin-login-group">
                                        <label className="admin-login-label">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            value={confirmPassword} 
                                            onChange={e => setConfirmPassword(e.target.value)} 
                                            className="admin-login-input" 
                                            required 
                                            placeholder="Confirm new password" 
                                        />
                                    </div>

                                    <button type="submit" disabled={resetting} className="admin-login-btn" style={{ marginBottom: '20px' }}>
                                        {resetting ? 'Resetting Password...' : 'Reset Password'}
                                    </button>
                                </>
                            )}

                            <div style={{ textAlign: 'center', fontSize: '13px' }}>
                                <span onClick={() => { setMode('login'); setOtpSent(false); }} className="admin-login-action-link">Back to Sign In</span>
                            </div>
                        </form>
                    )}

                    {/* REGULAR CREDENTIALS LOGIN MODE */}
                    {!require2FA && mode === 'login' && (
                        <form onSubmit={handleLogin}>
                            <p className="admin-login-desc">Sign in to your account</p>

                            <div className="admin-login-group">
                                <label className="admin-login-label">Email ID</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="admin-login-input" 
                                    required 
                                    placeholder="Email ID" 
                                />
                            </div>

                            <div className="admin-login-group">
                                <label className="admin-login-label">Password</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="admin-login-input" 
                                    required 
                                    placeholder="Password" 
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
                                <span onClick={() => setMode('forgot')} style={{ color: '#0A6738', fontSize: '13px', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>Forgot Password?</span>
                            </div>

                            <button type="submit" className="admin-login-btn">
                                Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
