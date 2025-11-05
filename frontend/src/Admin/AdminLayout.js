import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    
    useEffect(() => {
        const checkAdminRole = () => {
            const userRole = localStorage.getItem('userRole');
            if (userRole !== 'admin') {
                navigate('/welcome');
                return;
            }
            setIsAuthorized(true);
        };
        checkAdminRole();
    }, [navigate]);
    
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Vegetable Dhukan</h2>
                    <p>Admin Dashboard</p>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className={`admin-nav-item ${isActive('/admin/dashboard')}`}>
                        Dashboard
                    </Link>
                    <Link to="/admin/products" className={`admin-nav-item ${isActive('/admin/products')}`}>
                        Products
                    </Link>
                    <Link to="/admin/orders" className={`admin-nav-item ${isActive('/admin/orders')}`}>
                        Orders
                    </Link>
                    <Link to="/admin/customers" className={`admin-nav-item ${isActive('/admin/customers')}`}>
                        Customers
                    </Link>
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/welcome" className="admin-nav-item">
                        Back to Store
                    </Link>
                    <button 
                        className="admin-nav-item logout-btn" 
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('userId');
                            localStorage.removeItem('userRole');
                            window.location.href = '/signin';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </aside>
            <main className="admin-main-content">
                {children}
            </main>
        </div>
    );
}

export default AdminLayout;

