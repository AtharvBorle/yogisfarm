import React, { useEffect, useState } from 'react';
import api, { getAssetUrl } from '../api';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Package,
  Eye
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        salesChange: 0,
        totalOrders: 0,
        ordersChange: 0,
        totalUsers: 0,
        usersChange: 0,
        totalProducts: 0,
        recentOrders: [],
        topProducts: [],
        salesTrend: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard'); 
                if(res.data.status) {
                    setStats(res.data.stats);
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ['#3BB77E', '#17a2b8', '#ffc107', '#fd7e14', '#dc3545', '#6610f2', '#6f42c1', '#e83e8c', '#20c997', '#007bff'];

    const StatCard = ({ title, value, change, icon: Icon, color }) => (
        <div style={{ 
            flex: 1, 
            background: '#fff', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>{title}</span>
                <div style={{ background: `${color}15`, padding: '10px', borderRadius: '10px' }}>
                    <Icon size={20} color={color} />
                </div>
            </div>
            <h2 style={{ margin: '0', fontSize: '28px', fontWeight: '700' }}>{value}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                {change >= 0 ? (
                    <>
                        <TrendingUp size={14} color="#3BB77E" />
                        <span style={{ color: '#3BB77E', fontWeight: '600' }}>+{change.toFixed(1)}%</span>
                    </>
                ) : (
                    <>
                        <TrendingDown size={14} color="#ea4335" />
                        <span style={{ color: '#ea4335', fontWeight: '600' }}>{change.toFixed(1)}%</span>
                    </>
                )}
                <span style={{ color: '#adb5bd' }}>Last Month</span>
            </div>
        </div>
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Stats Cards Row */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <StatCard title="Total Sales" value={`₹${stats.totalSales.toLocaleString()}`} change={stats.salesChange} icon={IndianRupee} color="#3BB77E" />
                <StatCard title="Total Orders" value={stats.totalOrders} change={stats.ordersChange} icon={ShoppingBag} color="#fd7e14" />
                <StatCard title="Total Register Users" value={stats.totalUsers} change={stats.usersChange} icon={Users} color="#17a2b8" />
                <StatCard title="Total Products" value={stats.totalProducts} change={0} icon={Package} color="#6610f2" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1.5, background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#333' }}>Overview Of Sales</h4>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="sales" fill="#3BB77E" radius={[4, 4, 0, 0]} barSize={35} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ flex: 1, background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#333' }}>Top 10 Selling Products</h4>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.topProducts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Orders Table */}
                <div style={{ flex: 2, background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#333' }}>New Order List</h4>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>ORDER ID</th>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>CUSTOMER</th>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>MOBILE NO</th>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>AMOUNT (₹)</th>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>STATUS</th>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>PAYMENT</th>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>CREATED ON</th>
                                    <th style={{ padding: '12px 10px', fontSize: '12px', color: '#adb5bd', fontWeight: '600' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders?.length === 0 ? (
                                    <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No orders found</td></tr>
                                ) : (
                                    stats.recentOrders?.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                            <td style={{ padding: '15px 10px', fontSize: '14px', fontWeight: '500' }}>#{order.orderNumber}</td>
                                            <td style={{ padding: '15px 10px', fontSize: '14px' }}>{order.user?.name}</td>
                                            <td style={{ padding: '15px 10px', fontSize: '14px' }}>{order.user?.phone}</td>
                                            <td style={{ padding: '15px 10px', fontSize: '14px', fontWeight: '600' }}>{order.total}</td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '12px', 
                                                    background: order.orderStatus === 'pending' ? '#fff4e5' : '#e6f4ea', 
                                                    color: order.orderStatus === 'pending' ? '#ff9800' : '#3BB77E' 
                                                }}>
                                                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 10px', fontSize: '14px' }}>{order.paymentMethod.toUpperCase()}</td>
                                            <td style={{ padding: '15px 10px', fontSize: '14px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <Link to={`/orders/detail/${order.orderNumber}`} style={{ color: '#1a73e8' }}><Eye size={18} /></Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Most Sold Products List */}
                <div style={{ flex: 1, background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#333' }}>Most Sold Products</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {stats.topProducts?.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No data</div>
                        ) : (
                            stats.topProducts?.slice(0, 5).map((tp, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx === 4 ? 'none' : '1px solid #f8f9fa' }}>
                                    <span style={{ fontSize: '14px', color: '#444', fontWeight: '500' }}>{tp.name}</span>
                                    <span style={{ fontWeight: '700', color: '#3BB77E' }}>{tp.value}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
