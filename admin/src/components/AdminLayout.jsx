import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from './ErrorBoundary';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Simple breadcrumb logic
    const pathnames = location.pathname.split('/').filter(x => x);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    useEffect(() => {
        if (isDarkMode) {
            document.body.style.backgroundColor = '#1a1a1a';
            document.body.classList.add('dark-mode');
        } else {
            document.body.style.backgroundColor = '#f4f5f9';
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const sidebarWidth = isSidebarCollapsed ? '80px' : '260px';

    return (
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh', 
            background: isDarkMode ? '#1a1a1a' : '#f4f5f9',
            color: isDarkMode ? '#fff' : '#333',
            transition: 'background 0.3s'
        }}>
            <Sidebar isCollapsed={isSidebarCollapsed} isDarkMode={isDarkMode} />
            <div style={{ 
                flex: 1, 
                marginLeft: sidebarWidth, 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'margin 0.3s'
            }}>
                <Header 
                    toggleSidebar={toggleSidebar} 
                    toggleDarkMode={toggleDarkMode} 
                    isDarkMode={isDarkMode} 
                />
                <main style={{ padding: '30px', flex: 1 }}>
                    {/* Breadcrumbs */}
                    <div style={{ marginBottom: '25px', fontSize: '14px', color: isDarkMode ? '#ccc' : '#7E7E7E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: '#3BB77E', fontWeight: '500' }}>Dashboard</Link>
                        {pathnames.map((value, index) => {
                            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;
                            return isLast ? (
                                <span key={to}> <span style={{color: '#adb5bd'}}>/</span> {value.charAt(0).toUpperCase() + value.slice(1)}</span>
                            ) : (
                                <span key={to}> <span style={{color: '#adb5bd'}}>/</span> <Link to={to} style={{ textDecoration: 'none', color: '#3BB77E', fontWeight: '500' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</Link></span>
                            );
                        })}
                    </div>
                    
                    {/* Page Content */}
                    <div style={{ minHeight: '80vh' }}>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </div>
                </main>
                <footer style={{ 
                    padding: '25px', 
                    textAlign: 'center', 
                    color: isDarkMode ? '#888' : '#7E7E7E', 
                    fontSize: '13px', 
                    borderTop: `1px solid ${isDarkMode ? '#333' : '#f2f2f2'}`, 
                    background: isDarkMode ? '#1a1a1a' : '#fff' 
                }}>
                    Copyright © {new Date().getFullYear()} Yogis Farm Crafted by NeoPace Infotech LLP
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
