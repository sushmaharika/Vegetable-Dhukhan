import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                const userRole = localStorage.getItem('userRole');

                if (!token || !userId) {
                    navigate('/signin');
                    return;
                }

                // Check role from localStorage first
                if (userRole !== 'admin') {
                    navigate('/welcome');
                    return;
                }

                // Verify with backend
                const response = await fetch('http://localhost:3820/api/v2/get-user-details', {
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
                    if (data.data.role !== 'admin') {
                        navigate('/welcome');
                        return;
                    }
                    setIsAuthorized(true);
                } else {
                    navigate('/signin');
                }
            } catch (error) {
                console.error('Error checking admin access:', error);
                navigate('/signin');
            } finally {
                setLoading(false);
            }
        };

        checkAdminAccess();
    }, [navigate]);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Verifying access...
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return children;
}

export default AdminRoute;

