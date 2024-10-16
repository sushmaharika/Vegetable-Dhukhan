import "./SignUpPage.css"

import {Outlet,Link} from 'react-router-dom'
import { useState } from "react"
function SignUpPage(){
    const [signupdata,setsignupdata]=useState({
        name:'',
        phoneNumber:'',
        email:'',
        password:''
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
            const response=await fetch("http://localhost:3820/signupDetails",{
                method:'POST',
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(signupdata),
            })
            const data=await response.json()
            console.log(data)
        }
        catch(error){
            console.log(error);
        }
    }



    return (
        <div className="signup-main-container">
            <form onSubmit={handleSubmit} className="signup-form-container">
                <div>
                    <h1 style={{color:"black", fontFamily:"Rockwell"}}>Sign Up :)</h1>
                </div>
                <div className="signup-input-container">
                    <label className="signup-label-element-name">Name</label>
                    <input className="signup-input-element" onChange={handleChange} type="text" placeholder="Name" name="name"/>
                </div>
                <div className="signup-input-container">
                    <label className="signup-label-element-phone">Phone Number</label>
                    <input className="signup-input-element"  onChange={handleChange} type="text" placeholder="Phone Number" name="phoneNumber"/>
                </div>
                <div className="signup-input-container">
                    <label className="signup-label-element-email">Email</label>
                    <input className="signup-input-element" onChange={handleChange} type="text" placeholder="Email" name="email"/>
                </div>
                <div className="signup-input-container">
                    <label className="signup-label-element-password">Password</label>
                    <input className="signup-input-element" onChange={handleChange} type="password" placeholder="Password" name="password"/>
                </div>
                {error && <p style={{color:'red'}}>{error}</p>}
                <div className="signup-button-container">
                    <Link to="/signin">
                    <button className="signup-button-css">Sign In</button>
                    </Link>
                    <button className="signup-button-css" type="submit">Sign Up</button>
                </div>
            </form>
            <Outlet/>
        </div>

    )
}

export default SignUpPage