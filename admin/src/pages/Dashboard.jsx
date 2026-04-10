import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        recentOrders: [],
        topProducts: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats from the backend
                const res = await api.get('/dashboard'); 
                if(res.data.status) {
                    setStats(res.data.stats);
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Sales</h5>
                    <h2 style={{ margin: '0' }}>₹{stats.totalSales}</h2>
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Orders</h5>
                    <h2 style={{ margin: '0' }}>{stats.totalOrders}</h2>
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Users</h5>
                    <h2 style={{ margin: '0' }}>{stats.totalUsers}</h2>
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Products</h5>
                    <h2 style={{ margin: '0' }}>{stats.totalProducts}</h2>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 2 }}>
                    <h4>New Order List</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '10px' }}>ORDER ID</th>
                                <th style={{ padding: '10px' }}>CUSTOMER</th>
                                <th style={{ padding: '10px' }}>AMOUNT (₹)</th>
                                <th style={{ padding: '10px' }}>STATUS</th>
                                <th style={{ padding: '10px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders?.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No new orders found.</td></tr>
                            ) : (
                                stats.recentOrders?.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>#{order.orderNumber}</td>
                                        <td style={{ padding: '10px' }}>{order.user?.name}</td>
                                        <td style={{ padding: '10px' }}>{order.total}</td>
                                        <td style={{ padding: '10px' }}>{order.orderStatus}</td>
                                        <td style={{ padding: '10px' }}><Link to={`/orders/${order.id}`}>View</Link></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div style={{ flex: 1 }}>
                    <h4>Most Sold Products</h4>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                        {stats.topProducts?.length === 0 ? (
                            <li style={{ padding: '10px', background: '#f8f9fa', marginBottom: '5px' }}>No data available</li>
                        ) : (
                            stats.topProducts?.map((tp, idx) => (
                                <li key={idx} style={{ padding: '10px', background: '#f8f9fa', marginBottom: '5px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{tp.name}</span>
                                    <strong>{tp.count}</strong>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
