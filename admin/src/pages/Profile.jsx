import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import toast from 'react-hot-toast';

import { ChevronDown, Camera } from 'react-feather';

const Profile = () => {
    const { admin, fetchAdmin } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'basic');
    const [gstNumber, setGstNumber] = useState('');
    const [savedGstNumber, setSavedGstNumber] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    
    // Basic Details State
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [phone, setPhone] = useState('');
    
    // Password State
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState(''); // 'update-profile', 'change-password', 'toggle-2fa', 'verify-old-phone', 'update-phone'
    const [otpValue, setOtpValue] = useState('');
    const [otpMaskedPhone, setOtpMaskedPhone] = useState('');
    const [otpPayload, setOtpPayload] = useState({});
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    useEffect(() => {
        if (admin) {
            setProfileForm({ name: admin.name || '', email: admin.email || '' });
            setPhone(admin.phone || '');
        }
    }, [admin]);

    useEffect(() => {
        api.get('/settings').then(res => {
            if (res.data.status && res.data.settings) {
                const gst = res.data.settings.gst_number || '';
                setGstNumber(gst);
                setSavedGstNumber(gst);
            }
        }).catch(() => {});
    }, []);

    const handleSaveSettings = async () => {
        const cleanGst = gstNumber.trim();
        if (cleanGst.length !== 15) {
            return toast.error('GST Number must be exactly 15 characters');
        }
        if (!/^[A-Z0-9]{15}$/i.test(cleanGst)) {
            return toast.error('GST Number must be a valid 15-character alphanumeric code');
        }

        if (!window.confirm('Are you sure you want to save the new GST number?')) {
            return;
        }

        setSavingSettings(true);
        try {
            const res = await api.put('/settings', { settings: { gst_number: cleanGst } });
            if (res.data.status) {
                toast.success('Settings saved successfully');
                setSavedGstNumber(cleanGst);
                setGstNumber(cleanGst);
            }
            else toast.error(res.data.message);
        } catch (e) { toast.error('Failed to save settings'); }
        setSavingSettings(false);
    };

    // Helper to start OTP verification for any profile action
    const triggerProfileOtp = async (type, newPhoneVal = '') => {
        try {
            const res = await api.post('/profile/send-otp', { type, newPhone: newPhoneVal });
            if (res.data.status) {
                setOtpType(type);
                setOtpMaskedPhone(res.data.phone);
                setOtpValue('');
                setShowOtpModal(true);
                toast.success('OTP sent successfully');
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (err) {
            toast.error('Failed to send OTP verification code');
            return false;
        }
    };

    const handleUpdateProfile = async () => {
        if (!profileForm.name || !profileForm.email) {
            return toast.error('Name and email are required');
        }
        
        // 1. Check if registered phone is changing
        const dbPhone = admin?.phone || '';
        const currentInputPhone = phone.trim();
        
        if (currentInputPhone !== dbPhone) {
            if (!currentInputPhone) {
                return toast.error('Mobile number cannot be blank');
            }
            if (dbPhone) {
                // Verify old phone first
                setOtpPayload({ newPhone: currentInputPhone });
                await triggerProfileOtp('verify-old-phone');
            } else {
                // Directly send OTP to the new phone
                setOtpPayload({ newPhone: currentInputPhone });
                await triggerProfileOtp('verify-new-phone', currentInputPhone);
            }
            return;
        }

        // 2. Otherwise trigger normal profile details update
        setOtpPayload({ name: profileForm.name, email: profileForm.email });
        await triggerProfileOtp('update-profile');
    };

    const handleConfirmOtp = async () => {
        if (!otpValue || otpValue.length < 6) {
            return toast.error('Please enter 6-digit OTP');
        }
        setVerifyingOtp(true);
        try {
            // Translate front-end specific temporary types to backend update-phone if needed
            const submitType = otpType === 'verify-new-phone' ? 'update-phone' : otpType;

            const res = await api.post('/profile/verify-otp', {
                type: submitType,
                otp: otpValue,
                payload: otpPayload
            });

            if (res.data.status) {
                // Check if old phone verified successfully, then trigger new phone OTP
                if (otpType === 'verify-old-phone') {
                    toast.success('Old mobile number verified! Now sending verification to new number.');
                    setVerifyingOtp(false);
                    // Send OTP to new phone
                    const success = await triggerProfileOtp('verify-new-phone', otpPayload.newPhone);
                    if (success) {
                        setOtpType('update-phone'); // Transition to update new phone step
                    } else {
                        setShowOtpModal(false);
                    }
                    return;
                }

                if (otpType === 'verify-new-phone' || otpType === 'update-phone') {
                    toast.success('Mobile number updated successfully');
                } else {
                    toast.success('Changes updated successfully');
                }

                setShowOtpModal(false);
                fetchAdmin();
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(res.data.message);
            }
        } catch (e) {
            toast.error('Verification failed');
        }
        setVerifyingOtp(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await api.post('/profile/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.status) {
                toast.success('Profile image updated');
                fetchAdmin();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) { toast.error('Failed to upload image'); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        setOtpPayload({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        });
        await triggerProfileOtp('change-password');
    };

    const handleToggle2FA = async () => {
        setOtpPayload({ enabled: !admin.twoFactorEnabled });
        await triggerProfileOtp('toggle-2fa');
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '5px' }}>Profile</h2>
                <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                    <span>Dashboard</span> <span style={{ color: '#ccc' }}>/</span> <span style={{ color: '#3BB77E' }}>Profile</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2.5fr', gap: '20px', alignItems: 'start' }}>
                {/* LEFT PROFILE CARD */}
                <div className="admin-card" style={{ padding: '25px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 15px' }}>
                        <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            background: '#ccc', 
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            overflow: 'hidden'
                        }}>
                            {admin?.image ? (
                                <img src={getAssetUrl(admin.image)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            )}
                        </div>
                        <label style={{
                            position: 'absolute', bottom: '10px', right: '10px', background: '#3BB77E', color: '#fff',
                            width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                            <Camera size={18} />
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                        </label>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text)', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.5' }}>
                        Click On The Camera Icon To Change Best Size Is 400px X 400px
                    </p>
                    <div style={{ borderTop: '1px solid var(--border)', margin: '15px 0' }}></div>
                    <button onClick={handleUpdateProfile} className="btn-modal-submit" style={{ width: '100%', padding: '12px', background: '#006233', borderRadius: '4px' }}>
                        Update
                    </button>
                </div>

                {/* RIGHT TABS CARD */}
                <div className="admin-card" style={{ padding: '0' }}>
                    
                    {/* TABS HEADER */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', gap: '20px' }}>
                        <div 
                            onClick={() => setActiveTab('basic')}
                            style={{ padding: '20px 5px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                color: activeTab === 'basic' ? '#006233' : 'var(--text)',
                                borderBottom: activeTab === 'basic' ? '3px solid #006233' : '3px solid transparent'
                            }}
                        >
                            BASIC DETAILS
                        </div>
                        <div 
                            onClick={() => setActiveTab('timezone')}
                            style={{ padding: '20px 5px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                color: activeTab === 'timezone' ? '#006233' : 'var(--text)',
                                borderBottom: activeTab === 'timezone' ? '3px solid #006233' : '3px solid transparent'
                            }}
                        >
                            TIMEZONE
                        </div>
                        <div 
                            onClick={() => setActiveTab('2fa')}
                            style={{ padding: '20px 5px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                color: activeTab === '2fa' ? '#006233' : 'var(--text)',
                                borderBottom: activeTab === '2fa' ? '3px solid #006233' : '3px solid transparent'
                            }}
                        >
                            TWO-FACTOR AUTHENTICATION (2FA)
                        </div>
                        <div 
                            onClick={() => setActiveTab('business')}
                            style={{ padding: '20px 5px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                color: activeTab === 'business' ? '#006233' : 'var(--text)',
                                borderBottom: activeTab === 'business' ? '3px solid #006233' : '3px solid transparent'
                            }}
                        >
                            BUSINESS SETTINGS
                        </div>
                        <div 
                            onClick={() => setActiveTab('password')}
                            style={{ padding: '20px 5px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                color: activeTab === 'password' ? '#006233' : 'var(--text)',
                                borderBottom: activeTab === 'password' ? '3px solid #006233' : '3px solid transparent'
                            }}
                        >
                            PASSWORD
                        </div>
                    </div>

                    {/* TAB CONTENT */}
                    <div style={{ padding: '30px' }}>

                        {/* BASIC DETAILS */}
                        {activeTab === 'basic' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Username <span className="required">*</span></label>
                                        <input type="text" className="admin-input" value={admin?.email?.split('@')[0] || 'admin'} readOnly style={{ background: 'transparent' }} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Name <span className="required">*</span></label>
                                        <input type="text" className="admin-input" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Mobile No <span className="required">*</span></label>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ border: '1px solid var(--border)', borderRight: 'none', padding: '8px 12px', background: 'transparent', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <img src="https://flagcdn.com/w20/in.png" alt="India" style={{ width: '16px' }} />
                                                <span style={{ fontSize: '14px', color: 'var(--text)' }}>+91</span>
                                                <span style={{ fontSize: '10px' }}><ChevronDown size={16} /></span>
                                            </div>
                                            <input 
                                                type="text" 
                                                className="admin-input" 
                                                value={phone} 
                                                onChange={e => setPhone(e.target.value.replace(/\s+/g, ''))} 
                                                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} 
                                            />
                                        </div>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Email Id <span className="required">*</span></label>
                                        <input type="email" className="admin-input" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button onClick={handleUpdateProfile} className="btn-modal-submit" style={{ background: '#006233', padding: '10px 30px' }}>Update</button>
                                </div>
                            </div>
                        )}

                        {/* TIMEZONE */}
                        {activeTab === 'timezone' && (
                            <div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Timezone <span className="required">*</span></label>
                                    <select className="admin-select" defaultValue="Asia/Kolkata">
                                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '20px' }}>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Date Format <span className="required">*</span></label>
                                        <select className="admin-select" defaultValue="DD-MM-YYYY">
                                            <option value="DD-MM-YYYY">(DD-MM-YYYY) 11-04-2026</option>
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Time Format <span className="required">*</span></label>
                                        <select className="admin-select" defaultValue="12H">
                                            <option value="12H">12 H (HH:MM:SS PM) 11:59:59 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '30px 0 20px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button className="btn-modal-submit" style={{ background: '#006233', padding: '10px 30px' }}>Save</button>
                                </div>
                            </div>
                        )}

                        {/* 2FA */}
                        {activeTab === '2fa' && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ marginBottom: '25px' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: admin?.twoFactorEnabled ? '#eafaf1' : '#fdf2f2',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 15px', color: admin?.twoFactorEnabled ? '#006233' : '#d9534f'
                                    }}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d={admin?.twoFactorEnabled ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 9.9-1"}></path>
                                        </svg>
                                    </div>
                                    <h4 style={{ margin: '0 0 5px' }}>
                                        Two-Factor Authentication is <span style={{ color: admin?.twoFactorEnabled ? '#006233' : '#d9534f' }}>{admin?.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}</span>
                                    </h4>
                                    <p style={{ color: 'var(--text)', fontSize: '13px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                                        When enabled, you must enter a one-time verification code sent to your registered mobile number (+91 {admin?.phone ? admin.phone.slice(0, 2) + '******' + admin.phone.slice(-2) : 'N/A'}) to complete admin login.
                                    </p>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }}></div>
                                <button 
                                    onClick={handleToggle2FA} 
                                    className="btn-modal-submit" 
                                    style={{ background: admin?.twoFactorEnabled ? '#d9534f' : '#006233', padding: '12px 40px', borderRadius: '4px' }}
                                >
                                    {admin?.twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
                                </button>
                            </div>
                        )}

                        {/* BUSINESS SETTINGS */}
                        {activeTab === 'business' && (
                            <div>
                                <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#f0f9f4', border: '1px solid #c3e6cb', borderRadius: '6px', fontSize: '13px', color: '#155724' }}>
                                    <strong>Note:</strong> These settings will appear on all generated invoices. Changes take effect on the next invoice generated.
                                </div>
                                <div className="admin-form-group" style={{ maxWidth: '500px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label className="admin-label" style={{ margin: 0 }}>GST Number <span className="required">*</span></label>
                                        {savedGstNumber ? (
                                            <span style={{ fontSize: '12px', color: '#006233', background: '#eafaf1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                                Active: {savedGstNumber}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#d9534f', background: '#fdf2f2', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                                Not Configured
                                            </span>
                                        )}
                                    </div>
                                    <input 
                                        type="text" 
                                        className="admin-input" 
                                        value={gstNumber}
                                        onChange={e => setGstNumber(e.target.value.toUpperCase())}
                                        placeholder="e.g., 27AABCU9603R1ZM"
                                        maxLength={15}
                                    />
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '30px 0 20px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button 
                                        className="btn-modal-submit" 
                                        style={{ background: '#006233', padding: '10px 30px' }}
                                        onClick={handleSaveSettings}
                                        disabled={savingSettings}
                                    >
                                        {savingSettings ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* PASSWORD TAB */}
                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '25px', maxWidth: '500px', margin: '0 auto' }}>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Current Password <span className="required">*</span></label>
                                        <input type="password" required className="admin-input" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">New Password <span className="required">*</span></label>
                                        <input type="password" required className="admin-input" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Confirm New Password <span className="required">*</span></label>
                                        <input type="password" required className="admin-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button type="submit" className="btn-modal-submit" style={{ background: '#006233', padding: '10px 30px' }}>Change Password</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* OTP VERIFICATION MODAL OVERLAY */}
            {showOtpModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="admin-card" style={{ width: '400px', padding: '30px', margin: '20px', position: 'relative', background: 'white' }}>
                        <h3 style={{ margin: '0 0 15px', color: '#006233', textAlign: 'center' }}>Security Verification</h3>
                        <div style={{ marginBottom: '20px', padding: '12px', background: '#eafaf1', border: '1px solid #d4edda', borderRadius: '4px', fontSize: '13px', color: '#155724', lineHeight: '1.5' }}>
                            {otpType === 'verify-new-phone' || otpType === 'update-phone' ? (
                                <span>Please enter the verification code sent to your <strong>new</strong> mobile number: <strong>+91 {otpMaskedPhone}</strong></span>
                            ) : (
                                <span>Please enter the verification code sent to your registered mobile number: <strong>+91 {otpMaskedPhone}</strong></span>
                            )}
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                            <label className="admin-label" style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>Enter 6-digit OTP</label>
                            <input 
                                type="text" 
                                value={otpValue} 
                                onChange={e => setOtpValue(e.target.value)} 
                                className="admin-input" 
                                maxLength={6}
                                placeholder="Enter OTP"
                                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontWeight: 'bold', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={() => setShowOtpModal(false)} 
                                className="btn-modal-submit" 
                                style={{ background: '#666', flex: 1, padding: '10px', borderRadius: '4px' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmOtp} 
                                disabled={verifyingOtp}
                                className="btn-modal-submit" 
                                style={{ background: '#006233', flex: 1, padding: '10px', borderRadius: '4px' }}
                            >
                                {verifyingOtp ? 'Verifying...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
