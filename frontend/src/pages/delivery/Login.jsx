import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api'; // Assuming api.js is in src/
import toast from 'react-hot-toast';

const DeliveryLogin = () => {
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/delivery/login', { phone, pin });
            if (res.data.status) {
                toast.success('Logged in successfully!');
                navigate('/delivery/dashboard');
            } else {
                toast.error(res.data.message || 'Login failed');
            }
        } catch (err) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '380px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#3BB77E', margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>Delivery Portal</h2>
                    <p style={{ color: '#7E7E7E', margin: 0, fontSize: '14px' }}>Login to manage your deliveries</p>
                </div>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#253D4E' }}>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter 10-digit number"
                            required
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e9e1', boxSizing: 'border-box', fontSize: '15px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#253D4E' }}>PIN</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter your PIN"
                            required
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e9e1', boxSizing: 'border-box', fontSize: '15px' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#3BB77E',
                            color: '#fff',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DeliveryLogin;
