import React, { useEffect, useState } from 'react';
import api, { getAssetUrl } from '../api';
import { Link } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
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
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get(`/dashboard?period=${period}`); 
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
    }, [period]);

    const COLORS = ['#3BB77E', '#17a2b8', '#ffc107', '#fd7e14', '#dc3545', '#6610f2', '#6f42c1', '#e83e8c', '#20c997', '#007bff'];

    const StatCard = ({ title, value, change, icon: Icon, color }) => (
        <div style={{ 
            flex: 1, 
            background: 'var(--card-bg)', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid var(--border)'
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
                <div style={{ flex: 1.5, background: 'var(--card-bg)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0', fontSize: '16px', color: 'var(--text)' }}>Overview Of Sales</h4>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {['week', 'month', 'year'].map(p => (
                                <button key={p} onClick={() => setPeriod(p)} style={{ 
                                    padding: '5px 12px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid var(--border)',
                                    background: period === p ? '#3BB77E' : 'var(--card-bg)', color: period === p ? '#fff' : 'var(--text)'
                                }}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                            ))}
                        </div>
                    </div>
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

                <div style={{ flex: 1, background: 'var(--card-bg)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text)' }}>Top 10 Selling Products</h4>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.topProducts}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
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
                <div style={{ flex: 2, background: 'var(--card-bg)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text)' }}>New Order List</h4>
                    </div>
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        <DataTable 
                            columns={[
                                { header: 'ORDER ID', accessor: 'orderNumber', render: (row) => <span style={{fontWeight:'500'}}>#{row.orderNumber}</span> },
                                { header: 'CUSTOMER', render: (row) => row.user?.name },
                                { header: 'MOBILE NO', render: (row) => row.user?.phone },
                                { header: 'AMOUNT (₹)', accessor: 'total', render: (row) => <span style={{fontWeight:'600'}}>{row.total}</span> },
                                { 
                                    header: 'STATUS', 
                                    render: (row) => (
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '4px', fontSize: '12px', 
                                            background: row.orderStatus === 'pending' ? '#fff4e5' : '#e6f4ea', color: row.orderStatus === 'pending' ? '#ff9800' : '#3BB77E' 
                                        }}>
                                            {row.orderStatus.charAt(0).toUpperCase() + row.orderStatus.slice(1)}
                                        </span>
                                    )
                                },
                                { header: 'PAYMENT', render: (row) => row.paymentMethod.toUpperCase() },
                                { header: 'CREATED ON', render: (row) => new Date(row.createdAt).toLocaleDateString() },
                                { 
                                    header: 'ACTIONS', 
                                    render: (row) => <Link to={`/orders/detail/${row.orderNumber}`} style={{ color: '#1a73e8' }}><Eye size={18} /></Link>
                                }
                            ]} 
                            data={stats.recentOrders || []} 
                        />
                    </div>
                </div>
                
                {/* Most Sold Products List */}
                <div style={{ flex: 1, background: 'var(--card-bg)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text)' }}>Most Sold Products</h4>
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
