import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

const BlogAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if admin session is already active
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get('/admin/me');
        if (res.data.status) {
          navigate('/blogs/admin/dashboard');
        }
      } catch (err) {
        // Not logged in, stay on login page
      }
    };
    checkSession();
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      if (res.data.status) {
        if (res.data.require2FA) {
          setShow2FA(true);
          setMaskedPhone(res.data.phone);
          toast.success('OTP sent to registered phone number!');
        } else {
          toast.success('Logged in successfully!');
          navigate('/blogs/admin/dashboard');
        }
      } else {
        toast.error(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/login/verify-2fa', { email, otp });
      if (res.data.status) {
        toast.success('2FA verified! Logged in successfully.');
        navigate('/blogs/admin/dashboard');
      } else {
        toast.error(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A6738 0%, #1A472A 100%)',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '400px',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {/* Brand Logo Placeholder / Styled text */}
          <h2 style={{ color: '#0A6738', margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800' }}>
            Yogi's Farms
          </h2>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(172, 209, 64, 0.15)',
            color: '#0A6738',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            padding: '4px 12px',
            borderRadius: '50px',
            marginBottom: '15px'
          }}>
            Blog Admin Panel
          </span>
          <p style={{ color: '#667085', margin: 0, fontSize: '14px' }}>
            {show2FA ? 'Enter OTP sent to ' + maskedPhone : 'Sign in to manage blog posts'}
          </p>
        </div>

        {!show2FA ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yogisfarm.in"
                required
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0A6738'}
                onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0A6738'}
                onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#0A6738',
                color: '#ffffff',
                border: 'none',
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#08532d'; }}
              onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#0A6738'; }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FAVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  outline: 'none',
                  textAlign: 'center',
                  letterSpacing: '4px',
                  fontWeight: '700',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0A6738'}
                onBlur={(e) => e.target.style.borderColor = '#D0D5DD'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#0A6738',
                color: '#ffffff',
                border: 'none',
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#08532d'; }}
              onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#0A6738'; }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setShow2FA(false)}
              style={{
                background: 'transparent',
                color: '#667085',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlogAdminLogin;
