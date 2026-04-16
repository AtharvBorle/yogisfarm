import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { admin } = useAuth();
    const [activeTab, setActiveTab] = useState('basic');
    const [gstNumber, setGstNumber] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        api.get('/settings').then(res => {
            if (res.data.status && res.data.settings) {
                setGstNumber(res.data.settings.gst_number || '');
            }
        }).catch(() => {});
    }, []);

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await api.put('/settings', { settings: { gst_number: gstNumber } });
            if (res.data.status) toast.success('Settings saved successfully');
            else toast.error(res.data.message);
        } catch (e) { toast.error('Failed to save settings'); }
        setSavingSettings(false);
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
                    <div style={{ 
                        width: '180px', 
                        height: '180px', 
                        background: '#ccc', 
                        margin: '0 auto 15px', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        overflow: 'hidden'
                    }}>
                        {/* Placeholder for user image */}
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text)', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.5' }}>
                        Click On The Image To Change Best Size Is 400px X 400px
                    </p>
                    <div style={{ borderTop: '1px solid var(--border)', margin: '15px 0' }}></div>
                    <button className="btn-modal-submit" style={{ width: '100%', padding: '12px', background: '#006233', borderRadius: '4px' }}>
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
                    </div>

                    {/* TAB CONTENT */}
                    <div style={{ padding: '30px' }}>

                        {/* BASIC DETAILS */}
                        {activeTab === 'basic' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Username <span className="required">*</span></label>
                                        <input type="text" className="admin-input" defaultValue="admin" readOnly style={{ background: 'transparent' }} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Name <span className="required">*</span></label>
                                        <input type="text" className="admin-input" defaultValue="Yogis Farm" />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Mobile No <span className="required">*</span></label>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ border: '1px solid var(--border)', borderRight: 'none', padding: '8px 12px', background: 'transparent', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <img src="https://flagcdn.com/w20/in.png" alt="India" style={{ width: '16px' }} />
                                                <span style={{ fontSize: '14px', color: 'var(--text)' }}>+91</span>
                                                <span style={{ fontSize: '10px' }}>▼</span>
                                            </div>
                                            <input type="text" className="admin-input" defaultValue="72100 43004" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
                                        </div>
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Email Id <span className="required">*</span></label>
                                        <input type="email" className="admin-input" defaultValue="admin@gmail.com" />
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button className="btn-modal-submit" style={{ background: '#006233', padding: '10px 30px' }}>Update</button>
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
                            <div>
                                <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '30px' }}>
                                    <label className="admin-label" style={{ marginBottom: 0 }}>TOTP Type <span className="required">*</span></label>
                                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center', color: 'var(--text)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="radio" name="totp_type" defaultChecked style={{ accentColor: '#006233', transform: 'scale(1.2)' }} />
                                            <span>Default</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="radio" name="totp_type" />
                                            <span>App</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="radio" name="totp_type" />
                                            <span>E-Mail</span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }}></div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                    <div className="admin-form-group">
                                        <label className="admin-label">TOTP <span className="required">*</span></label>
                                        <input type="text" className="admin-input" placeholder="TOTP" />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Confirm TOTP <span className="required">*</span></label>
                                        <input type="text" className="admin-input" placeholder="Confirm TOTP" />
                                    </div>
                                </div>
                                
                                <div style={{ borderTop: '1px solid var(--border)', margin: '30px 0 20px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button className="btn-modal-submit" style={{ background: '#006233', padding: '10px 30px' }}>Save</button>
                                </div>
                            </div>
                        )}

                        {/* BUSINESS SETTINGS */}
                        {activeTab === 'business' && (
                            <div>
                                <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#f0f9f4', border: '1px solid #c3e6cb', borderRadius: '6px', fontSize: '13px', color: '#155724' }}>
                                    <strong>Note:</strong> These settings will appear on all generated invoices. Changes take effect on the next invoice generated.
                                </div>
                                <div className="admin-form-group" style={{ maxWidth: '500px' }}>
                                    <label className="admin-label">GST Number <span className="required">*</span></label>
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


                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
