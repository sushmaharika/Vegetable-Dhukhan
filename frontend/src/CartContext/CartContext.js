import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            const storedCart = localStorage.getItem(`cart_${userId}`);
            return storedCart ? JSON.parse(storedCart) : [];
        }
        return [];
    });

    // Load cart from backend on mount (when user is logged in)
    useEffect(() => {
        const loadCartFromBackend = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (token && userId) {
                try {
                    const response = await fetch("https://vegetable-dhukhan-backend.onrender.com/getCart", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (data.cartItems && data.cartItems.length > 0) {
                        setCart(data.cartItems);
                        localStorage.setItem(`cart_${userId}`, JSON.stringify(data.cartItems));
                    }
                } catch (error) {
                    console.error("Error loading cart from backend:", error);
                }
            }
        };
        loadCartFromBackend();
    }, []);

    // Store cart in localStorage and backend whenever it changes
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (userId) {
            localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
            
            // Sync to backend when cart changes
            if (token && cart.length >= 0) {
                const syncCart = async () => {
                    try {
                        await fetch("https://vegetable-dhukhan-backend.onrender.com/saveCart", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ cartItems: cart })
                        });
                    } catch (error) {
                        console.error("Error syncing cart to backend:", error);
                    }
                };
                // Debounce the sync to avoid too many requests
                const timeoutId = setTimeout(syncCart, 500);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [cart]);

    const addToCart = (vegetable) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item._id === vegetable._id);
            if (existingItem) {
                return prevCart.map(item =>
                    item._id === vegetable._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...vegetable, quantity: 1 }];
            }
        });
    };

    const increaseQuantity = (id) => {
        setCart((prevCart) =>
            prevCart.map(item =>
                item._id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCart((prevCart) =>
            prevCart.map(item =>
                item._id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
            )
        );
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item._id !== id));
    };

    const clearCart = () => {
        setCart([]); // Clears the cart
        const userId = localStorage.getItem('userId');
        if (userId) {
            localStorage.removeItem(`cart_${userId}`);
        }
    };

    return (
        <CartContext.Provider value={{ cart, setCart, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};