import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminCustomers.css';

function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://vegetable-dhukhan-backend.onrender.com/api/admin/customers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCustomers(data.customers);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewCustomerDetails = async (customerId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3820/api/admin/customers/${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSelectedCustomer(data);
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading-container">Loading customers...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-customers">
                <h1 className="customers-title">Customer Management</h1>

                {selectedCustomer ? (
                    <div className="customer-details-container">
                        <button className="btn-back" onClick={() => setSelectedCustomer(null)}>
                            ← Back to Customers
                        </button>
                        
                        <div className="customer-details-card">
                            <h2>Customer Details</h2>
                            
                            <div className="customer-info-section">
                                <h3>Contact Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">{selectedCustomer.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{selectedCustomer.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <span className="info-value">{selectedCustomer.phoneNumber}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Total Orders:</span>
                                        <span className="info-value">{selectedCustomer.totalOrders}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="customer-info-section">
                                <h3>Order History</h3>
                                {selectedCustomer.orderHistory.length === 0 ? (
                                    <p className="no-orders">No orders found</p>
                                ) : (
                                    <div className="order-history">
                                        {selectedCustomer.orderHistory.map((order) => (
                                            <div key={order.id} className="order-history-item">
                                                <div className="order-history-header">
                                                    <div>
                                                        <strong>Order #{order.orderId}</strong>
                                                        <span className="order-date">
                                                            {new Date(order.date).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="order-history-meta">
                                                        <span className="order-total">
                                                            ₹{order.total.toLocaleString('en-IN')}
                                                        </span>
                                                        <span 
                                                            className={`status-badge ${order.status}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="order-items-summary">
                                                    {order.items.length} item(s)
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="customers-table-container">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Total Orders</th>
                                    <th>Total Spent</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">No customers found</td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id}>
                                            <td>{customer.name}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.phoneNumber}</td>
                                            <td>{customer.totalOrders}</td>
                                            <td>₹{customer.totalSpent.toLocaleString('en-IN')}</td>
                                            <td>
                                                <button 
                                                    className="btn-view"
                                                    onClick={() => viewCustomerDetails(customer.id)}
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

export default AdminCustomers;

