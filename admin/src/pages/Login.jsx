import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { fetchAdmin } = useAuth();
    const navigate = useNavigate();

    // 2FA Verification State
    const [require2FA, setRequire2FA] = useState(false);
    const [otp, setOtp] = useState('');
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
        setVerifying2fa(true);
        try {
            const res = await api.post('/login/verify-2fa', { email, otp });
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
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setResetting(true);
        try {
            const res = await api.post('/forgot-password/reset', { email, otp, newPassword });
            if (res.data.status) {
                toast.success('Password reset successfully. Please login with your new password.');
                setMode('login');
                setOtpSent(false);
                setOtp('');
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

    return (
        <div className="admin-login-container" style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f4f5f9'}}>
            <div className="card" style={{width:'400px', padding:'30px', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', borderRadius:'8px', background:'white'}}>
                <div className="text-center mb-4" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#006233', margin: '0 0 5px' }}>YogisFarms Admin</h2>
                    {require2FA && <p className="text-muted" style={{ margin: 0 }}>Two-Factor Authentication Active</p>}
                    {!require2FA && mode === 'login' && <p className="text-muted" style={{ margin: 0 }}>Sign in to your account</p>}
                    {!require2FA && mode === 'forgot' && <p className="text-muted" style={{ margin: 0 }}>Reset Admin Password</p>}
                </div>

                {/* 2FA MODE */}
                {require2FA && (
                    <form onSubmit={handleVerify2FA}>
                        <div style={{ marginBottom: '20px', padding: '10px', background: '#eafaf1', border: '1px solid #d4edda', borderRadius: '4px', fontSize: '13px', color: '#155724' }}>
                            We have sent a verification code to registered mobile number: <strong>+91 {maskedPhone}</strong>
                        </div>
                        <div className="mb-4" style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: '500', fontSize: '14px' }}>Enter OTP</label>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={e => setOtp(e.target.value)} 
                                className="form-control" 
                                required 
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px', boxSizing: 'border-box', textAlign: 'center', fontSize: '18px', letterSpacing: '4px'}} 
                            />
                        </div>
                        <button type="submit" disabled={verifying2fa} style={{width:'100%', padding:'12px', background:'#006233', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight: '500'}}>
                            {verifying2fa ? 'Verifying...' : 'Verify & Log In'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <span onClick={() => setRequire2FA(false)} style={{ color: '#666', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>Back to Sign In</span>
                        </div>
                    </form>
                )}

                {/* FORGOT PASSWORD MODE */}
                {!require2FA && mode === 'forgot' && (
                    <form onSubmit={otpSent ? handleForgotPasswordReset : handleForgotPasswordSendOtp}>
                        {!otpSent ? (
                            <>
                                <div className="mb-4" style={{ marginBottom: '20px' }}>
                                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Enter Registered Admin Email</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        className="form-control" 
                                        required 
                                        placeholder="admin@yogisfarm.in"
                                        style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px', boxSizing: 'border-box'}} 
                                    />
                                </div>
                                <button type="submit" disabled={sendingOtp} style={{width:'100%', padding:'12px', background:'#006233', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight: '500'}}>
                                    {sendingOtp ? 'Sending OTP...' : 'Send OTP to Mobile'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '20px', padding: '10px', background: '#eafaf1', border: '1px solid #d4edda', borderRadius: '4px', fontSize: '13px', color: '#155724' }}>
                                    OTP has been sent to registered mobile number: <strong>+91 {maskedPhone}</strong>
                                </div>
                                <div className="mb-3" style={{ marginBottom: '15px' }}>
                                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Enter OTP</label>
                                    <input 
                                        type="text" 
                                        value={otp} 
                                        onChange={e => setOtp(e.target.value)} 
                                        className="form-control" 
                                        required 
                                        maxLength={6}
                                        placeholder="6-digit OTP"
                                        style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px', boxSizing: 'border-box', textAlign: 'center', fontSize: '16px', letterSpacing: '2px'}} 
                                    />
                                </div>
                                <div className="mb-3" style={{ marginBottom: '15px' }}>
                                    <label style={{ fontWeight: '500', fontSize: '14px' }}>New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        className="form-control" 
                                        required 
                                        placeholder="Enter new password"
                                        style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px', boxSizing: 'border-box'}} 
                                    />
                                </div>
                                <div className="mb-4" style={{ marginBottom: '20px' }}>
                                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)} 
                                        className="form-control" 
                                        required 
                                        placeholder="Confirm new password"
                                        style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px', boxSizing: 'border-box'}} 
                                    />
                                </div>
                                <button type="submit" disabled={resetting} style={{width:'100%', padding:'12px', background:'#006233', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight: '500'}}>
                                    {resetting ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </>
                        )}
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <span onClick={() => { setMode('login'); setOtpSent(false); }} style={{ color: '#666', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</span>
                        </div>
                    </form>
                )}

                {/* LOGIN MODE */}
                {!require2FA && mode === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="mb-3" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: '500', fontSize: '14px' }}>Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required placeholder="admin@yogisfarm.in" style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px', boxSizing: 'border-box'}} />
                        </div>

                        <div className="mb-3" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: '500', fontSize: '14px' }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required placeholder="••••••••" style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px', boxSizing: 'border-box'}} />
                        </div>

                        <div className="mb-4" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                            <span onClick={() => setMode('forgot')} style={{ color: '#006233', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Forgot Password?</span>
                        </div>

                        <button type="submit" style={{width:'100%', padding:'12px', background:'#006233', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px', fontWeight: '500'}}>Sign In</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
