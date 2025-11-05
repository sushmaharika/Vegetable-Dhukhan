import React, { useEffect, useState } from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';
import UserDashboard from '../UserDashboard/UserDashboard';

export default function Welcome() {
  const [userDetails, setUserDetails] = useState({
    username: 'Loading...',
    email: 'Loading...',
    role: 'user'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');

        if (!token || !userId) {
          navigate('/signin');
          return;
        }

        // If role is admin, redirect to admin dashboard
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
          return;
        }

        const response = await fetch("https://vegetable-dhukhan-backend.onrender.com/api/v2/get-user-details", {
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

        if (!response.ok) {
          console.error('Failed to fetch user details:', response.statusText);
          return;
        }

        const data = await response.json();
        setUserDetails({
          username: data.data.username || 'Guest',
          email: data.data.email || 'N/A',
          role: data.data.role || 'user'
        });

        // Redirect admin users
        if (data.data.role === 'admin') {
          navigate('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If user is not admin, show UserDashboard
  if (userDetails.role !== 'admin') {
    return <UserDashboard />;
  }

  // Fallback (shouldn't reach here)
  return (
    <div className="welcome-main-container">
      <div className="welcome-second-container">
        <p className="welcome">Welcome to</p>
        <h1 className="main-title">Vegetable Dhukhan :)</h1>
        <p>
          Name: <span style={{ fontWeight: '700' }}>{userDetails.username}</span>
        </p>
        <p>
          Email: <span style={{ fontWeight: '700' }}>{userDetails.email}</span>
        </p>
      </div>
      <button className="button" onClick={() => navigate('/vegetables')}>
        Vegetables
      </button>
    </div>
  );
}