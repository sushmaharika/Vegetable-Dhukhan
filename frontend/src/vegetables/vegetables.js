import React, { useContext, useEffect, useState } from 'react';
import "./vegetables.css";
import { CartContext } from '../CartContext/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Vegetables() {
    const [vegetables, setVegetables] = useState([]);
    const [err, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { cart, addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchVegetablesDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate('/signin');
                    return;
                }
                
                const response = await fetch("http://localhost:3820/getVegetables", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.status === 401) {
                    navigate('/signin');
                    return;
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data && data.vegetables) {
                    setVegetables(data.vegetables);
                    setError(null);
                } else {
                    setError("Failed to fetch vegetables");
                }
            } catch (error) {
                console.error("Error fetching vegetables:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVegetablesDetails();
    }, [navigate]);

    const handleCart = (vegetable) => {
        addToCart(vegetable);
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem('userId');
            if (userId && token) {
                await fetch("http://localhost:3820/saveCart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ cartItems: cart })
                });
            }
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userRole");
            localStorage.removeItem(`cart_${userId}`);
            navigate("/signin");
        } catch (error) {
            console.error("Error saving cart on logout:", error);
        }
    };

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="vegetables-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Loading vegetables...
            </div>
        );
    }

    return (
        <div className="vegetables-container">
            <div className='Vegetable-header header-sticky'>
                <h1 className="brand-text">🥬 Fresh Vegetables</h1>
                <div className="flex items-center" style={{ gap: '10px' }}>
                    <button 
                        className='checkout btn btn-primary' 
                        onClick={() => navigate("/checkout")}
                        style={{ position: 'relative' }}
                    >
                        🛒 Cart {getCartItemCount() > 0 && (
                            <span className="cart-badge">{getCartItemCount()}</span>
                        )}
                    </button>
                    <button className='logout btn btn-danger' onClick={handleLogout}>Logout</button>
                </div>
            </div>
            
            {err ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    background: 'white', 
                    borderRadius: '15px',
                    maxWidth: '600px',
                    margin: '0 auto',
                    color: '#f44336'
                }}>
                    <h2>Error Loading Vegetables</h2>
                    <p>{err}</p>
                </div>
            ) : (
                <div className="container">
                    {vegetables.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                            <h2 style={{ color: '#666' }}>No vegetables available</h2>
                            <p style={{ color: '#999' }}>Check back later for fresh produce!</p>
                        </div>
                    ) : (
                        <ul>
                            {vegetables.map(({ _id, imageURL, price, vegetableName }) => (
                                <li key={_id}>
                                    <img 
                                        src={imageURL || '/logo192.png'} 
                                        alt={vegetableName}
                                        onError={(e) => { e.target.src = '/logo192.png'; }}
                                    />
                                    <p className='vegetable-name'>{vegetableName}</p>
                                    <p className='vegetable-price'>₹{price}</p>
                                    <button className="btn btn-primary" onClick={() => handleCart({ _id, vegetableName, imageURL, price })}>
                                        Add to Cart
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
