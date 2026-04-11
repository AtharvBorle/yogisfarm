import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  ListTree, 
  Tag, 
  ShoppingBag, 
  ShoppingCart, 
  LayoutGrid, 
  Percent, 
  Users, 
  FolderOpen, 
  TicketPercent 
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Slider', path: '/sliders', icon: ImageIcon },
    { name: 'Category', path: '/categories', icon: ListTree },
    { name: 'Brand', path: '/brands', icon: Tag },
    { name: 'Product', path: '/products', icon: ShoppingBag },
    { name: 'Order', path: '/orders', icon: ShoppingCart },
    { name: 'Section', path: '/sections', icon: LayoutGrid },
    { name: 'Tax', path: '/taxes', icon: Percent },
    { name: 'Contact', path: '/contacts', icon: Users },
    { name: 'Filemanager', path: '/filemanager', icon: FolderOpen },
    { name: 'Coupon Code', path: '/coupons', icon: TicketPercent },
];

const Sidebar = ({ isCollapsed, isDarkMode }) => {
    return (
        <aside style={{
            width: isCollapsed ? '80px' : '260px', 
            background: isDarkMode ? '#1a1a1a' : '#fff', 
            color: isDarkMode ? '#ccc' : '#7E7E7E', 
            height: '100vh', 
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${isDarkMode ? '#333' : '#f2f2f2'}`,
            transition: 'width 0.3s, background 0.3s',
            zIndex: 100,
            overflow: 'hidden'
        }}>
            <div style={{ 
                padding: isCollapsed ? '25px 0' : '25px 20px', 
                textAlign: 'center',
                transition: 'padding 0.3s'
            }}>
                <img 
                    src="/assets/imgs/theme/logo.png" 
                    alt="Logo" 
                    style={{ 
                        width: isCollapsed ? '40px' : '150px',
                        height: 'auto',
                        objectFit: 'contain',
                        transition: 'width 0.3s'
                    }} 
                />
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
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    padding: '12px 25px',
                                    color: isActive ? '#3BB77E' : (isDarkMode ? '#ccc' : '#7E7E7E'),
                                    textDecoration: 'none',
                                    background: isActive ? (isDarkMode ? '#242424' : '#F2F9F6') : 'transparent',
                                    fontSize: '15px',
                                    fontWeight: isActive ? '600' : '400',
                                    transition: '0.3s',
                                    whiteSpace: 'nowrap'
                                })}
                                title={isCollapsed ? item.name : ''}
                            >
                                <item.icon size={20} style={{ 
                                    marginRight: isCollapsed ? '0' : '12px',
                                    minWidth: '20px'
                                }} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
