import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminOrders.css';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://vegetable-dhukhan-backend.onrender.com/api/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = [...orders].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://vegetable-dhukhan-backend.onrender.com/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                await fetchOrders();
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
                alert('Order status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3820/api/admin/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSelectedOrder(data);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
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

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading-container">Loading orders...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-orders">
                <h1 className="orders-title">Order Management</h1>

                {selectedOrder ? (
                    <div className="order-details-container">
                        <button className="btn-back" onClick={() => setSelectedOrder(null)}>
                            ← Back to Orders
                        </button>
                        
                        <div className="order-details-card">
                            <h2>Order Details</h2>
                            
                            <div className="order-info-section">
                                <h3>Order Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Order ID:</span>
                                        <span className="info-value">{selectedOrder.orderId}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Date:</span>
                                        <span className="info-value">
                                            {new Date(selectedOrder.date).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Status:</span>
                                        <span 
                                            className="info-value status"
                                            style={{ color: getStatusColor(selectedOrder.status) }}
                                        >
                                            {selectedOrder.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Total:</span>
                                        <span className="info-value">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-info-section">
                                <h3>Customer Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">{selectedOrder.customerName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{selectedOrder.customerEmail}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <span className="info-value">{selectedOrder.customerPhone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Address:</span>
                                        <span className="info-value">{selectedOrder.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-info-section">
                                <h3>Order Items</h3>
                                <table className="order-items-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.cartItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.vegetableName || item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{item.price}</td>
                                                <td>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="order-info-section">
                                <h3>Update Status</h3>
                                <div className="status-buttons">
                                    {['pending', 'processing', 'completed', 'cancelled'].map(status => (
                                        <button
                                            key={status}
                                            className={`status-btn ${selectedOrder.status === status ? 'active' : ''}`}
                                            onClick={() => handleStatusChange(selectedOrder.id, status)}
                                            style={{
                                                backgroundColor: selectedOrder.status === status ? getStatusColor(status) : '#e0e0e0',
                                                color: selectedOrder.status === status ? 'white' : '#666'
                                            }}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('orderId')} className="sortable">
                                        Order ID {sortConfig.key === 'orderId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('customerName')} className="sortable">
                                        Customer {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('date')} className="sortable">
                                        Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('total')} className="sortable">
                                        Total {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('status')} className="sortable">
                                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">No orders found</td>
                                    </tr>
                                ) : (
                                    sortedOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.orderId}</td>
                                            <td>{order.customerName}</td>
                                            <td>{new Date(order.date).toLocaleDateString()}</td>
                                            <td>₹{order.total.toLocaleString('en-IN')}</td>
                                            <td>
                                                <span 
                                                    className="status-badge"
                                                    style={{ 
                                                        backgroundColor: getStatusColor(order.status) + '20',
                                                        color: getStatusColor(order.status)
                                                    }}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn-view"
                                                    onClick={() => viewOrderDetails(order.id)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminOrders;

