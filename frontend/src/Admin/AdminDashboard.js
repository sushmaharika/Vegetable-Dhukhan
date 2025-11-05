import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        newCustomers: 0,
        statusDistribution: {}
    });
    const [allUsers, setAllUsers] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch stats
            const statsResponse = await fetch('http://localhost:3820/api/admin/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Fetch all customers with detailed info
            const customersResponse = await fetch('http://localhost:3820/api/admin/customers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (customersResponse.ok) {
                const customersData = await customersResponse.json();
                setAllUsers(customersData.customers);
            }

            // Fetch recent orders
            const ordersResponse = await fetch('http://localhost:3820/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                setRecentOrders(ordersData.orders.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewUserDetails = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3820/api/admin/customers/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedUser(data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ff9800',
            processing: '#2196f3',
            completed: '#4caf50',
            cancelled: '#f44336'
        };
        return colors[status] || '#666';
    };

    // Filter and sort users
    const filteredUsers = allUsers
        .filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === 'all' || 
                                 (filterStatus === 'withOrders' && user.totalOrders > 0) ||
                                 (filterStatus === 'noOrders' && user.totalOrders === 0);
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            switch(sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'orders':
                    return b.totalOrders - a.totalOrders;
                case 'spent':
                    return b.totalSpent - a.totalSpent;
                default:
                    return 0;
            }
        });

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading-container">Loading dashboard...</div>
            </AdminLayout>
        );
    }

    if (selectedUser) {
        return (
            <AdminLayout>
                <div className="admin-dashboard">
                    <button className="btn-back" onClick={() => setSelectedUser(null)}>
                        ← Back to Dashboard
                    </button>
                    
                    <div className="user-detail-card">
                        <h2 className="user-detail-title">User Details & Transaction History</h2>
                        
                        <div className="user-info-section">
                            <h3>User Information</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Name:</span>
                                    <span className="info-value">{selectedUser.name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{selectedUser.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Phone:</span>
                                    <span className="info-value">{selectedUser.phoneNumber}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Total Orders:</span>
                                    <span className="info-value">{selectedUser.totalOrders}</span>
                                </div>
                            </div>
                        </div>

                        <div className="user-orders-section">
                            <h3>Order History & Transactions</h3>
                            {selectedUser.orderHistory.length === 0 ? (
                                <p className="no-data-text">No orders placed yet</p>
                            ) : (
                                <div className="orders-detail-list">
                                    {selectedUser.orderHistory.map((order) => (
                                        <div key={order.id} className="order-detail-card">
                                            <div className="order-detail-header">
                                                <div>
                                                    <strong>Order #{order.orderId}</strong>
                                                    <span className="order-date">
                                                        {new Date(order.date).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="order-detail-meta">
                                                    <span className="order-total-amount">
                                                        ₹{order.total.toLocaleString('en-IN')}
                                                    </span>
                                                    <span 
                                                        className="order-status-badge"
                                                        style={{ 
                                                            backgroundColor: getStatusColor(order.status) + '20',
                                                            color: getStatusColor(order.status)
                                                        }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="order-items-detail">
                                                <h4>Items:</h4>
                                                <div className="items-list">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="item-detail">
                                                            <span>{item.vegetableName || item.name} x {item.quantity}</span>
                                                            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Dashboard Overview</h1>
                    <p className="dashboard-subtitle">Monitor your store's performance and user activity</p>
                </div>
                
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"></div>
                        <div className="stat-info">
                            <h3>Total Orders</h3>
                            <p className="stat-value">{stats.totalOrders}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card pending">
                        <div className="stat-icon"></div>
                        <div className="stat-info">
                            <h3>Pending Orders</h3>
                            <p className="stat-value">{stats.pendingOrders}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card revenue">
                        <div className="stat-icon"></div>
                        <div className="stat-info">
                            <h3>Total Revenue</h3>
                            <p className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card customers">
                        <div className="stat-icon"></div>
                        <div className="stat-info">
                            <h3>Total Customers</h3>
                            <p className="stat-value">{stats.totalCustomers || allUsers.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-content-grid">
                    {/* All Users with Orders - Enhanced with Filtering */}
                    <div className="dashboard-section users-section">
                        <div className="section-header">
                            <h2>All Users & Their Orders</h2>
                            <Link to="/admin/customers" className="view-all-link">View All →</Link>
                        </div>
                        
                        {/* Filter Controls */}
                        <div className="filter-controls">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                            
                            <div className="filter-group">
                                <label>Filter:</label>
                                <select 
                                    value={filterStatus} 
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Users</option>
                                    <option value="withOrders">With Orders</option>
                                    <option value="noOrders">No Orders</option>
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label>Sort By:</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="name">Name</option>
                                    <option value="orders">Orders (High to Low)</option>
                                    <option value="spent">Amount Spent (High to Low)</option>
                                </select>
                            </div>
                        </div>

                        {allUsers.length === 0 ? (
                            <p className="no-data-text">No users registered yet</p>
                        ) : (
                            <>
                                <div className="results-count">
                                    Showing {filteredUsers.length} of {allUsers.length} users
                                </div>
                                <div className="users-detailed-list">
                                    {filteredUsers.map((user) => (
                                        <div key={user.id} className="user-detailed-card" onClick={() => viewUserDetails(user.id)}>
                                            <div className="user-avatar-large">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-detailed-info">
                                                <div className="user-name-large">{user.name}</div>
                                                <div className="user-email-large">{user.email}</div>
                                                <div className="user-phone-large">{user.phoneNumber}</div>
                                                <div className="user-stats-large">
                                                    <span className="stat-badge">
                                                        {user.totalOrders} {user.totalOrders === 1 ? 'Order' : 'Orders'}
                                                    </span>
                                                    <span className="stat-badge">
                                                        ₹{user.totalSpent.toLocaleString('en-IN')} Spent
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="view-details-arrow"></div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Recent Orders */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>Recent Orders</h2>
                            <Link to="/admin/orders" className="view-all-link">View All →</Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <p className="no-data-text">No orders yet</p>
                        ) : (
                            <div className="orders-list">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="order-item-card">
                                        <div className="order-item-header">
                                            <span className="order-id">#{order.orderId}</span>
                                            <span 
                                                className="order-status-badge"
                                                style={{ 
                                                    backgroundColor: getStatusColor(order.status) + '20',
                                                    color: getStatusColor(order.status)
                                                }}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="order-item-details">
                                            <span className="customer-name">{order.customerName}</span>
                                            <span className="order-total">₹{order.total.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="order-item-date">
                                            {new Date(order.date).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions (analytics removed) */}
                <div className="dashboard-section quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/admin/products" className="action-button">
                            <span className="action-icon">➕</span>
                            <span className="action-text">Manage Products</span>
                        </Link>
                        <Link to="/admin/orders" className="action-button">
                            <span className="action-icon">📦</span>
                            <span className="action-text">Manage Orders</span>
                        </Link>
                        <Link to="/admin/customers" className="action-button">
                            <span className="action-icon">👥</span>
                            <span className="action-text">View Customers</span>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;
