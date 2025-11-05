import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../CartContext/CartContext';
import PayPalButton from '../PayPalButton';
import ErrorBoundary from '../components/ErrorBoundary';
import { loadPayPal } from '../utils/loadPayPal';
import './CheckOutPage.css';

export default function CheckOutPage() {
    const { cart, clearCart, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);
    const [exchangeRate, setExchangeRate] = useState(1);
    const [loading, setLoading] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [address, setAddress] = useState('');
    const [paypalReady, setPaypalReady] = useState(false);
    const [showPayPal, setShowPayPal] = useState(false);
    const navigate = useNavigate();

    // Fetch exchange rate for INR to USD
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
                const data = await response.json();
                const rate = data?.rates?.USD;
                setExchangeRate(typeof rate === 'number' && rate > 0 ? rate : 0.012);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch exchange rate:', error);
                setExchangeRate(0.012);
                setLoading(false);
            }
        };
        fetchExchangeRate();
    }, []);

    // Lazy load PayPal SDK only when user opts in to pay
    useEffect(() => {
        if (!showPayPal) return;
        let mounted = true;
        (async () => {
            try {
                await loadPayPal('sb', 'USD');
                if (mounted) setPaypalReady(true);
            } catch (e) {
                console.error('Failed to load PayPal SDK:', e);
            }
        })();
        return () => { mounted = false; };
    }, [showPayPal]);

    // Suppress generic cross-origin "Script error." from third-party SDK to avoid dev overlay noise
    useEffect(() => {
        const handler = (event) => {
            if (event?.message === 'Script error.') {
                event.preventDefault();
            }
        };
        window.addEventListener('error', handler, true);
        return () => {
            window.removeEventListener('error', handler, true);
        };
    }, []);

    // Sync cart to backend on mount
    useEffect(() => {
        const syncCartToBackend = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token && cart.length > 0) {
                    await fetch("https://vegetable-dhukhan-backend.onrender.com/saveCart", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ cartItems: cart })
                    });
                }
            } catch (error) {
                console.error("Error syncing cart to backend:", error);
            }
        };
        syncCartToBackend();
    }, [cart]);

    const getTotalBill = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handlePaymentSuccess = async (details) => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem('userId');
            
            if (userId && token) {
                // Save transaction to backend
                const response = await fetch("https://vegetable-dhukhan-backend.onrender.com/saveTransaction", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ 
                                transactionId: details.id, 
                                cartItems: cart,
                                address: address || 'Not provided'
                            })
                        });

                if (response.ok) {
                    // Clear cart only after successful transaction
                    clearCart(); // This also clears localStorage
                    
                    setTransactionId(details.id);
                    setPaymentSuccess(true);
                } else {
                    alert('Failed to save transaction. Please contact support.');
                }
            }
        } catch (error) {
            console.error("Error saving transaction details:", error);
            alert('Error processing transaction. Please try again.');
        }
    };

    const handleLogout = () => {
        // Navigate first to avoid third-party script interactions during unmount
        navigate('/signin');
        setTimeout(() => {
            try {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
            } catch (_) {}
        }, 0);
    };

    const totalBillInINR = getTotalBill();
    const totalBillInUSD = (totalBillInINR * exchangeRate).toFixed(2);

    // Show success message after payment
    if (paymentSuccess) {
        return (
            <div className="checkout-container">
                <div className="payment-success-container">
                    <div className="success-icon">✅</div>
                    <h1 className="success-title">Payment Successful!</h1>
                    <p className="success-message">
                        Your order has been placed successfully.
                    </p>
                    <p className="transaction-id">
                        Transaction ID: <strong>{transactionId}</strong>
                    </p>
                    <div className="success-actions">
                        <button onClick={() => navigate('/vegetables')} className="btn-primary">
                            Continue Shopping
                        </button>
                        <button onClick={handleLogout} className="btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {cart.length === 0 ? (
                <div className="empty">
                    <h1>Check Out is Empty</h1>
                    <p>Your Cart is Empty</p>
                    <button onClick={() => navigate('/vegetables')} className="btn-primary">
                        Go Shopping
                    </button>
                </div>
            ) : (
                <div className="checkout-content">
                    <h1 className="checkout-title">CheckOut</h1>
                    
                    {/* Address Input */}
                    <div className="address-section">
                        <label htmlFor="address">Delivery Address</label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your delivery address"
                            rows="3"
                            className="address-input"
                        />
                    </div>

                    <table className="checkout-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Vegetable</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(({ _id, vegetableName, imageURL, price, quantity }) => (
                                <tr key={_id} className="checkout-item">
                                    <td><img src={imageURL} alt={vegetableName} className="checkout-image" /></td>
                                    <td>{vegetableName}</td>
                                    <td>₹{price}</td>
                                    <td>
                                        <div className="quantity-controls">
                                            <button className="qty-btn" aria-label="Decrease quantity" onClick={() => decreaseQuantity(_id)}>-</button>
                                            <span className="qty-value" aria-live="polite">{quantity}</span>
                                            <button className="qty-btn" aria-label="Increase quantity" onClick={() => increaseQuantity(_id)}>+</button>
                                        </div>
                                    </td>
                                    <td>₹{price * quantity}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => removeFromCart(_id)} className="delete-button">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="total-bill">
                        <h3>Total Bill in INR: ₹{totalBillInINR}</h3>
                        {loading ? (
                            <p>Loading conversion rate...</p>
                        ) : (
                            <h3>Total Bill in USD: ${totalBillInUSD}</h3>
                        )}
                    </div>
                    <div className="paypal-container">
                        <h3>Pay with PayPal</h3>
                        {!showPayPal ? (
                            <button className="btn btn-primary" onClick={() => setShowPayPal(true)}>
                                Proceed to Payment
                            </button>
                        ) : (
                            <ErrorBoundary>
                                {!loading && paypalReady && totalBillInUSD && !isNaN(parseFloat(totalBillInUSD)) && parseFloat(totalBillInUSD) > 0 && (
                                    <PayPalButton 
                                        amount={parseFloat(totalBillInUSD)}
                                        onSuccess={handlePaymentSuccess}
                                    />
                                )}
                            </ErrorBoundary>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
