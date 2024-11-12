import React, { useEffect } from 'react'
import './Welcome.css'
import { useNavigate } from 'react-router-dom'
export default function Welcome() {
  const navigate=useNavigate()
  useEffect(()=>{
    const timer=setTimeout(()=>{
      navigate("/vegetables")
    },5000);
    return ()=>{
      clearTimeout(timer)
    }
  },[navigate])
  return (
    <div className='welcome-main-container'>
        <div className='welcome-second-container'>
            <p className='welcome'>Welcome to</p>
            <h1 className='main-title'>Vegetable Dhukhan :)</h1>
            <img src='https://res.cloudinary.com/dfhvyfh6g/image/upload/v1726766461/indian-woman-face-avatar-cartoon-vector-25919004_pipgyg.jpg'
            alt="Harika" className='image'/>
            <p>Linked In : <span style={{fontWeight:"700"}}>Sushma Harika Pallam</span></p>
            <p>Gmail : <span style={{fontWeight:"700"}}>sushmaharikapallam@gmail.com</span></p>
        </div>
        <button className='button' onClick={()=>navigate("/vegetables")}>Vegetables</button>
    </div>
  )
}
