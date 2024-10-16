import React from 'react'
import './Welcome.css'
export default function Welcome() {
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

    </div>
  )
}
