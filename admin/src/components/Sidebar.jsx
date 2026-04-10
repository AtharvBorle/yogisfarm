import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Slider', path: '/sliders', icon: '🔀' },
    { name: 'Category', path: '/categories', icon: '📋' },
    { name: 'Brand', path: '/brands', icon: '🏷️' },
    { name: 'Product', path: '/products', icon: '🛒' },
    { name: 'Order', path: '/orders', icon: '🛍️' },
    { name: 'Section', path: '/sections', icon: '📦' },
    { name: 'Tax', path: '/taxes', icon: '%' },
    { name: 'Contact', path: '/contacts', icon: '👥' },
    { name: 'Filemanager', path: '/filemanager', icon: '📁' },
    { name: 'Coupon Code', path: '/coupons', icon: '🎫' },
];

const Sidebar = () => {
    return (
        <aside style={{
            width: '250px', 
            background: '#253d2c', 
            color: 'white', 
            height: '100vh', 
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #1a2a1e', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: 'white' }}>Yogis Farm</h3>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {navItems.map(item => (
                        <li key={item.name}>
                            <NavLink 
                                to={item.path} 
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: isActive ? '#fff' : '#ccc',
                                    textDecoration: 'none',
                                    background: isActive ? '#1a6e3a' : 'transparent',
                                    borderLeft: isActive ? '4px solid #fff' : '4px solid transparent'
                                })}
                            >
                                <span style={{ marginRight: '10px' }}>{item.icon}</span>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
