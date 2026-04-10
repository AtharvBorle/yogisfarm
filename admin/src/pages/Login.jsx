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

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            if (res.data.status) {
                toast.success('Login successful');
                fetchAdmin();
                navigate('/');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="admin-login-container" style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f4f5f9'}}>
            <div className="card" style={{width:'400px', padding:'30px', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', borderRadius:'8px', background:'white'}}>
                <div className="text-center mb-4">
                    <h2>Yogis Farm Admin</h2>
                    <p className="text-muted">Sign in to your account</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px'}} />
                    </div>

                    <div className="mb-4">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required style={{width:'100%', padding:'10px', marginTop:'5px', border:'1px solid #ddd', borderRadius:'4px'}} />
                    </div>
                    <button type="submit" style={{width:'100%', padding:'10px', background:'#3BB77E', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'16px'}}>Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
