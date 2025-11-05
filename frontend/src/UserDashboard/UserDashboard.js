import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

function UserDashboard() {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        username: 'Loading...',
        email: 'Loading...',
        phoneNumber: 'Loading...'
    });
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        // Check if user is admin and redirect
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
            navigate('/admin/dashboard');
            return;
        }
        
        fetchUserDetails();
        fetchMyOrders();
    }, [navigate]);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                navigate('/signin');
                return;
            }

            const roleCheck = localStorage.getItem('userRole');
            if (roleCheck === 'admin') {
                navigate('/admin/dashboard');
                return;
            }

            const response = await fetch(`https://vegetable-dhukhan-backend.onrender.com/api/v2/get-user-details`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    id: userId,
                },
            });

            if (response.status === 401) {
                navigate('/signin');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setUserDetails(data.data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`https://vegetable-dhukhan-backend.onrender.com/api/user/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMyOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        navigate('/signin');
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

    if (loading) {
        return (
            <div className="user-dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (selectedOrder) {
        return (
            <div className="user-dashboard">
                <header className="user-dashboard-header">
                    <div className="header-content">
                        <h1 className="dashboard-logo">Vegetable Dhukan</h1>
                        <nav className="user-nav">
                            <button onClick={() => setSelectedOrder(null)} className="nav-btn">
                                ← Back
                            </button>
                            <button onClick={handleLogout} className="nav-btn logout">
                                Logout
                            </button>
                        </nav>
                    </div>
                </header>

                <main className="user-dashboard-main">
                    <div className="dashboard-container">
                        <div className="order-detail-view">
                            <h2>Order Details</h2>
                            <div className="order-detail-card-full">
                                <div className="order-detail-header-full">
                                    <div>
                                        <h3>Order #{selectedOrder.orderId}</h3>
                                        <p className="order-date-full">
                                            {new Date(selectedOrder.date).toLocaleString()}
                                        </p>
                                    </div>
                                    <span 
                                        className="order-status-full"
                                        style={{ 
                                            backgroundColor: getStatusColor(selectedOrder.status) + '20',
                                            color: getStatusColor(selectedOrder.status)
                                        }}
                                    >
                                        {selectedOrder.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="order-items-section">
                                    <h4>Order Items</h4>
                                    <div className="order-items-list">
                                        {selectedOrder.cartItems && selectedOrder.cartItems.length > 0 ? (
                                            selectedOrder.cartItems.map((item, idx) => (
                                                <div key={idx} className="order-item-detail">
                                                    <div className="item-info">
                                                        <span className="item-name">{item.vegetableName || item.name || 'Item'}</span>
                                                        <span className="item-quantity">Qty: {item.quantity}</span>
                                                    </div>
                                                    <div className="item-pricing">
                                                        <span className="item-price">₹{item.price} each</span>
                                                        <span className="item-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No items found</p>
                                        )}
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total Amount:</span>
                                        <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                {selectedOrder.address && (
                                    <div className="order-address">
                                        <h4>Delivery Address</h4>
                                        <p>{selectedOrder.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <header className="user-dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-logo">Vegetable Dhukan</h1>
                    <nav className="user-nav">
                        <button onClick={() => navigate('/vegetables')} className="nav-btn">
                            🛒 Shop
                        </button>
                        <button onClick={handleLogout} className="nav-btn logout">
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <main className="user-dashboard-main">
                <div className="dashboard-container">
                    <div className="welcome-section">
                        <h2>Welcome, {userDetails.username}!</h2>
                        <p>Manage your account and track your orders</p>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-card profile-card">
                            <div className="card-header">
                                <h3>Profile Information</h3>
                            </div>
                            <div className="profile-info">
                                <div className="info-row">
                                    <span className="info-label">Name</span>
                                    <span className="info-value">{userDetails.username}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{userDetails.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{userDetails.phoneNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card orders-card">
                            <div className="card-header">
                                <h3>Order History</h3>
                                <span className="orders-count">{myOrders.length} {myOrders.length === 1 ? 'Order' : 'Orders'}</span>
                            </div>
                            {myOrders.length === 0 ? (
                                <div className="no-orders">
                                    <div className="empty-icon"></div>
                                    <p>You haven't placed any orders yet.</p>
                                    <button onClick={() => navigate('/vegetables')} className="shop-btn">
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {myOrders.map((order) => (
                                        <div key={order.id} className="order-item-card" onClick={() => setSelectedOrder(order)}>
                                            <div className="order-item-header">
                                                <div className="order-info-left">
                                                    <span className="order-id">Order #{order.orderId}</span>
                                                    <span className="order-date-text">
                                                        {new Date(order.date).toLocaleDateString('en-IN', { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
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
                                            {order.address && (
                                                <div className="order-address-preview" style={{ color: '#555', fontSize: '13px', marginTop: '6px' }}>
                                                    {order.address}
                                                </div>
                                            )}
                                            <div className="order-item-footer">
                                                <span className="items-count">
                                                    {order.cartItems?.length || 0} {order.cartItems?.length === 1 ? 'item' : 'items'}
                                                </span>
                                                <span className="order-total-amount">₹{order.total.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="view-details-hint">Click to view details →</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="dashboard-card quick-actions">
                            <div className="card-header">
                                <h3>Quick Actions</h3>
                            </div>
                            <div className="action-buttons">
                                <button onClick={() => navigate('/vegetables')} className="action-btn primary">
                                    <span className="btn-text">Browse Vegetables</span>
                                </button>
                                <button onClick={() => navigate('/checkout')} className="action-btn secondary">
                                    <span className="btn-text">View Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default UserDashboard;
