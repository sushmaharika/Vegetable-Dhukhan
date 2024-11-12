import React, { useContext, useEffect, useState } from 'react';
import "./vegetables.css";
import { CartContext } from '../CartContext/CartContext';

import { useNavigate } from 'react-router-dom';

export default function Vegetables() {
    const [vegetables, setVegetables] = useState([]);  // Correct destructuring with square brackets
    const [err, setError] = useState(null);  // Same for err and setError
    const navigate=useNavigate();

    const {addToCart}=useContext(CartContext)


    useEffect(() => {
        const fetchVegetablesDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const fetchVegetablesDetails = await fetch("http://localhost:3820/getVegetables", {
                    method: "GET",
                    headers: {
                        Authorization: token
                    }
                });
                const data = await fetchVegetablesDetails.json();
                console.log(data);
                if (data) {
                    setVegetables(data.vegetables); // Assuming 'data' contains the 'vegetables' array
                    setError("");
                }
            } catch (error) {
                console.log(error);
                setError("Data not fetched");
            }
        };
        fetchVegetablesDetails();
    }, []);  // Adding an empty dependency array to run useEffect only once

    const handleCart=(vegetable)=>{
        addToCart(vegetable)
    }

    return (
        <div style={{ color: "white" }}>
            {
                err ? (<div>{err}</div>) : (
                    <div style={{ textAlign: "center" }}>
                        <div className='Vegetable-header'>
                            <h1 style={{ color: "black" }}>Vegetables</h1>
                            <button className='checkout' onClick={()=>navigate("/checkout")}>CheckOut</button>
                        </div>
                        <div>
                            <ul>
                                {vegetables.map(({ _id, imageURL, price, vegetableName }) => (
                                    <li key={_id}>
                                        <img src={imageURL} alt={vegetableName} />
                                        <p className='vegetable-name'>{vegetableName}</p>
                                        <p className='vegetable-price'>₹{price}</p>
                                        <button onClick={() => handleCart({ _id, vegetableName, imageURL, price })}>Add to Cart</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
