import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from './ErrorBoundary';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    
    // Simple breadcrumb logic
    const pathnames = location.pathname.split('/').filter(x => x);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f5f9' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '250px', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <main style={{ padding: '20px', flex: 1 }}>
                    {/* Breadcrumbs */}
                    <div style={{ marginBottom: '20px', fontSize: '14px', color: '#6c757d' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: '#1a6e3a' }}>Dashboard</Link>
                        {pathnames.map((value, index) => {
                            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;
                            return isLast ? (
                                <span key={to}> / {value.charAt(0).toUpperCase() + value.slice(1)}</span>
                            ) : (
                                <span key={to}> / <Link to={to} style={{ textDecoration: 'none', color: '#1a6e3a' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</Link></span>
                            );
                        })}
                    </div>
                    
                    {/* Page Content */}
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </div>
                </main>
                <footer style={{ padding: '20px', textAlign: 'center', color: '#6c757d', fontSize: '14px', borderTop: '1px solid #eee' }}>
                    Copyright © {new Date().getFullYear()} Yogis Farm Crafted with by Deepminds Infotech Pvt.Ltd
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
