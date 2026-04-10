import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { admin, logout } = useAuth();

    return (
        <header style={{
            height: '60px',
            background: '#fff',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                    Yogis Farm (admin)
                </Link>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Icons placeholder */}
                <span style={{ cursor: 'pointer' }}>🏠</span>
                <span style={{ cursor: 'pointer' }}>🌙</span>
                
                {/* Profile dropdown placeholder */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#1a6e3a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {admin?.name?.charAt(0) || 'A'}
                    </div>
                    <span>{admin?.name || 'Admin'}</span>
                    <button onClick={logout} style={{ marginLeft: '10px', border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Sign Out</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
