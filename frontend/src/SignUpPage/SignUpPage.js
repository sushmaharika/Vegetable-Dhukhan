import "./SignUpPage.css"
import {useNavigate,Outlet,Link} from 'react-router-dom'
import { useState } from "react"

function SignUpPage(){
    const navigate=useNavigate()

    const [signupdata,setsignupdata]=useState({
        name:'',
        phoneNumber:'',
        email:'',
        password:'',
        role:'user'
    });

    const [error,setError]=useState('')

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setsignupdata({...signupdata,[name]:value})
        setError("");
    }
    
    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(!signupdata.name || !signupdata.phoneNumber || !signupdata.email || !signupdata.password){
            setError("*All Fields Are Required");
            return ;
        }
        if(!signupdata.email.includes('@')){
            setError("*Valid Email Required");
            return;
        }
        if(signupdata.password.length<=4){
            setError("Password Should be Greater than 4 characters");
            return;
        }
        console.log(signupdata);
        try{
            const response=await fetch("https://vegetable-dhukhan-backend.onrender.com/signupDetails",{
                method:'POST',
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(signupdata),
            })
            const data=await response.json()
            if (data.message === "User Already Exists!") {
                setError(data.message);
            } else if (data.message === "User successfully registered!" || response.ok) {
                navigate("/signin");
            } else {
                setError(data.message || "Registration failed");
            }
        }
        catch(error){
            console.log(error);
            setError("Failed to communicate with server");
        }
    }

    return (
        <div className="signup-main-container">
            <div className="signup-wrapper">
                <div className="signup-header">
                    <h1 className="signup-title">Create Account</h1>
                    <p className="signup-subtitle">Join Vegetable Dhukan today</p>
                </div>
                
                <form onSubmit={handleSubmit} className="signup-form-container">
                    <div className="signup-input-container">
                        <label className="signup-label-element">Full Name</label>
                        <input 
                            className="signup-input-element" 
                            onChange={handleChange} 
                            type="text" 
                            placeholder="Enter your full name" 
                            name="name"
                            value={signupdata.name}
                        />
                    </div>
                    
                    <div className="signup-input-container">
                        <label className="signup-label-element">Phone Number</label>
                        <input 
                            className="signup-input-element" 
                            onChange={handleChange} 
                            type="tel" 
                            placeholder="Enter your phone number" 
                            name="phoneNumber"
                            value={signupdata.phoneNumber}
                        />
                    </div>
                    
                    <div className="signup-input-container">
                        <label className="signup-label-element">Email Address</label>
                        <input 
                            className="signup-input-element" 
                            onChange={handleChange} 
                            type="email" 
                            placeholder="Enter your email" 
                            name="email"
                            value={signupdata.email}
                        />
                    </div>
                    
                    <div className="signup-input-container">
                        <label className="signup-label-element">Password</label>
                        <input 
                            className="signup-input-element" 
                            onChange={handleChange} 
                            type="password" 
                            placeholder="Enter your password (min 5 characters)" 
                            name="password"
                            value={signupdata.password}
                        />
                    </div>
                    
                    <div className="signup-input-container">
                        <label className="signup-label-element">Account Type</label>
                        <div className="role-selection">
                            <label className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="user"
                                    checked={signupdata.role === 'user'}
                                    onChange={handleChange}
                                />
                                <span className="role-label">Customer</span>
                            </label>
                            <label className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={signupdata.role === 'admin'}
                                    onChange={handleChange}
                                />
                                <span className="role-label">Admin</span>
                            </label>
                        </div>
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="signup-button-container">
                        <button className="signup-button-css primary" type="submit">
                            Create Account
                        </button>
                    </div>
                    
                    <div className="signup-footer">
                        <p>Already have an account? <Link to="/signin" className="link-text">Sign In</Link></p>
                    </div>
                </form>
            </div>
            <Outlet/>
        </div>
    )
}

export default SignUpPage
