import React, { useContext } from 'react';
import { CartContext } from '../CartContext/CartContext';
import './CheckOutPage.css';

export default function CheckOutPage() {
    const { cart } = useContext(CartContext);
    console.log(cart)

    return (
        <div className='checkout-container'>
            {cart.length === 0 ? (
                <div className='empty'>
                    <h1>Check Out is Empty</h1>
                    <p>Your Cart is Empty</p>
                </div>
            ) : (
                <div className="checkout-content">
                    <h1 className="checkout-title">CheckOut</h1>
                    <ul className="checkout-list">
                        {cart.map(({ _id, vegetableName, imageURL, price }) => (
                            <li key={_id} className="checkout-item">
                                <img src={imageURL} alt={vegetableName} className="checkout-image" />
                                <p className="checkout-name">{vegetableName}</p>
                                <p className="checkout-price">{`₹${price}`}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
