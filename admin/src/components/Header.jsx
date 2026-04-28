import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Moon, 
  Sun,
  Menu, 
  User, 
  Settings, 
  Lock, 
  LogOut,
  ChevronDown
} from 'lucide-react';

const Header = ({ toggleSidebar, toggleDarkMode, isDarkMode }) => {
    const { admin, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header style={{
            height: '70px',
            background: isDarkMode ? '#1a1a1a' : '#fff',
            borderBottom: `1px solid ${isDarkMode ? '#333' : '#f2f2f2'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Menu 
                    size={20} 
                    style={{ color: isDarkMode ? '#ccc' : '#7E7E7E', cursor: 'pointer' }} 
                    onClick={toggleSidebar}
                />
                <span style={{ fontSize: '14px', color: isDarkMode ? '#ccc' : '#7E7E7E', fontWeight: '500' }}>
                    Yogis Farm (admin)
                </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <Link to="/" style={{ color: isDarkMode ? '#ccc' : '#7E7E7E' }}><Home size={20} /></Link>
                <div onClick={toggleDarkMode} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {isDarkMode ? <Sun size={20} color="#ffc107" /> : <Moon size={20} color="#7E7E7E" />}
                </div>
                
                <div style={{ position: 'relative' }} ref={profileRef}>
                    <div 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                        <div style={{ 
                            width: '35px', 
                            height: '35px', 
                            borderRadius: '50%', 
                            background: '#3BB77E', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            {admin?.name?.charAt(0) || 'A'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#fff' : '#333' }}>
                                {admin?.name || 'Admin'}
                            </span>
                            <ChevronDown size={14} color={isDarkMode ? '#ccc' : '#7E7E7E'} />
                        </div>
                    </div>

                    {isProfileOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '50px',
                            right: 0,
                            width: '200px',
                            background: isDarkMode ? '#242424' : '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: `1px solid ${isDarkMode ? '#444' : '#eee'}`,
                            padding: '10px 0',
                            zIndex: 100
                        }}>
                            <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setIsProfileOpen(false)}>
                                <div style={dropdownItemStyle(isDarkMode)}>
                                    <User size={16} /> My Profile
                                </div>
                            </Link>
                            <Link to="/profile" state={{ activeTab: 'business' }} style={{ textDecoration: 'none' }} onClick={() => setIsProfileOpen(false)}>
                                <div style={dropdownItemStyle(isDarkMode)}>
                                    <Settings size={16} /> Account Setting
                                </div>
                            </Link>
                            <Link to="/profile" state={{ activeTab: 'password' }} style={{ textDecoration: 'none' }} onClick={() => setIsProfileOpen(false)}>
                                <div style={dropdownItemStyle(isDarkMode)}>
                                    <Lock size={16} /> Change Password
                                </div>
                            </Link>
                            <div style={{ height: '1px', background: isDarkMode ? '#444' : '#eee', margin: '8px 0' }} />
                            <div 
                                onClick={logout}
                                style={{ ...dropdownItemStyle(isDarkMode), color: '#ff4d4f' }}
                            >
                                <LogOut size={16} /> Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const dropdownItemStyle = (isDark) => ({
    padding: '10px 20px',
    fontSize: '14px',
    color: isDark ? '#ccc' : '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': {
        background: isDark ? '#333' : '#f8f9fa'
    }
});

export default Header;
