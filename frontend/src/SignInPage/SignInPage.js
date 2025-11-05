import "./SignInPage.css";
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useState, useContext } from "react";
import { CartContext } from '../CartContext/CartContext';

function SignInPage() {
    const navigate = useNavigate();
    const { setCart } = useContext(CartContext);
    const [signindata, setsignindata] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setsignindata({ ...signindata, [name]: value });
        setError("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!signindata.email || !signindata.password) {
            setError("*All Fields Are Required");
            return;
        }
        if (!signindata.email.includes('@')) {
            setError("*Valid Email Required");
            return;
        }
        if (signindata.password.length <= 4) {
            setError("Password Should be Greater than 4 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3820/signinDetails", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signindata),
            });
            const data = await response.json();

            if (data.token) {
                const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
                const userRole = data.role || decodedToken.role || 'user';
                
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", decodedToken.id || data.userId);
                localStorage.setItem("userRole", userRole);
                
                console.log('Login successful - Role:', userRole, 'UserID:', decodedToken.id || data.userId);

                // Retrieve cart items from backend for regular users
                if (data.role === 'user') {
                    try {
                        const cartResponse = await fetch("http://localhost:3820/getCart", {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${data.token}`
                            }
                        });
                        const cartData = await cartResponse.json();
                        setCart(cartData.cartItems || []);
                    } catch (cartError) {
                        console.error("Error fetching cart:", cartError);
                    }
                }

                // Redirect based on role
                if (data.role === 'admin') {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/user/dashboard");
                }
            } else {
                setError(data.message || "Login failed");
            }
        } catch (error) {
            console.log(error);
            setError("Failed to communicate with server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="signin-main-container">
            <div className="signin-wrapper">
                <div className="signin-header">
                    <h1 className="signin-title">Welcome Back</h1>
                    <p className="signin-subtitle">Sign in to your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="signin-form-container">
                    <div className="signin-input-container">
                        <label className="signin-label-element">Email Address</label>
                        <input 
                            className="signin-input-element" 
                            onChange={handleChange} 
                            type="email" 
                            placeholder="Enter your email" 
                            name="email"
                            value={signindata.email}
                        />
                    </div>
                    
                    <div className="signin-input-container">
                        <label className="signin-label-element">Password</label>
                        <input 
                            className="signin-input-element" 
                            onChange={handleChange} 
                            type="password" 
                            placeholder="Enter your password" 
                            name="password"
                            value={signindata.password}
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="signin-button-container">
                        <button 
                            className="signin-button-css primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    
                    <div className="signin-footer">
                        <p>Don't have an account? <Link to="/signup" className="link-text">Sign Up</Link></p>
                    </div>
                </form>
            </div>
            <Outlet />
        </div>
    )
}

export default SignInPage;
