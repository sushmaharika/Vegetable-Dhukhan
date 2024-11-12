import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (vegetable) => {
        setCart((prevCart) => [...prevCart, vegetable]);  // Use functional update
        console.log("Updated cart:", cart); // Logging after adding
    };

    return (
        <CartContext.Provider value={{ cart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};
