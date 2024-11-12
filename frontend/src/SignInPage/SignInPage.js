import "./SignInPage.css"
import {useNavigate,Outlet,Link} from 'react-router-dom'
import { useState } from "react"
function SignInPage(){
    const navigate=useNavigate()
    const [signindata,setsignindata]=useState({
        email:'',
        password:''
    });

    const [error,setError]=useState('');

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setsignindata({...signindata,[name]:value})
        setError("");
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(!signindata.email || !signindata.password){
            setError("*All Fields Are Required");
            return;
        }
        if(!signindata.email.includes('@')){
            setError("*Valid Email Required");
            return;
        }
        if(signindata.password.length<=4){
            setError("Password Should be Greater than 4 characters");
            return;
        }
        console.log(signindata); 
        try{
            const response=await fetch("http://localhost:3820/signinDetails",{
                method:'POST',
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(signindata),
            })
            const data=await response.json()
            console.log("2323",data.token);
            if(data.token){
                localStorage.setItem("token",data.token)
            }
            if(data.message==="User in the database"){
                navigate("/welcome");
            }else{
                setError(data.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }
    return (
        <div className="signin-main-container">
            <form onSubmit={handleSubmit} className="signin-form-container">
                <div>
                    <h1 style={{color:"black", fontFamily:"Rockwell"}}>Sign In :)</h1>
                </div>
                <div className="signin-input-container">
                    <label className="signin-label-element-email">Email</label>
                    <input className="signin-input-element" onChange={handleChange} type="text" placeholder="Email" name="email"/>
                </div>
                <div className="signin-input-container">
                    <label className="signin-label-element-password">Password</label>
                    <input className="signin-input-element" onChange={handleChange} type="password" placeholder="Password" name="password"/>
                </div>
                {error && <p style={{color:'red'}}>{error}</p>}
                <div className="signin-button-container">
                    <Link to="/signup">
                    <button className="signin-button-css">Sign Up</button>
                    </Link>
                    <button className="signin-button-css" type="submit">Sign In</button>
                </div>
            </form>
            <Outlet/>
        </div>

    )
}

export default SignInPage