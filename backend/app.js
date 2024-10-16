import express from 'express'
import cors from 'cors'
import { mongoDBConnection } from './dbConnection.js';
import { User } from './Schema.js';
import jwt from "jsonwebtoken";
const app=express()

app.use(express.json());
app.use(cors());

app.post("/signupDetails",async (req,res)=>{
    const data=req.body;
    const {name,phoneNumber,email,password}=data;
    try{
        const {user_details}=await mongoDBConnection();
        const existingUser=await user_details.findOne({email})
        console.log(existingUser);

        if (existingUser){
            console.log("User Already Exists !");
            return res.status(400).json({message:"User Already Exists!"});
        }
        const newUser=new User({email,password,phoneNumber});
        await user_details.insertOne(newUser);
        console.log("User Inserted in db");
        res.status(200).json({message:"User Successfully inserted into the db"});
    }catch(error){
        console.log(error)
    }
})


app.post("/signinDetails",async (req,res)=>{
    const data=req.body;
    const {email,password}=data;
    try{
        const {user_details}=await mongoDBConnection();
        const user=await user_details.findOne({email});
        console.log(user);
        if(!user){
            return res.status(400).json({message: "User not in the database"});
        }
        if(user.password==password){
            const token=jwt.sign({email:user.email},"jwttoken",{
                expiresIn:"2h",
            })
            return res.status(200).json({message:"User in the database",token:token});
        }else{
            return res.status(400).json({message:"User not in the database ! please signup"});
        }
    }
    catch(error){
        console.log(error);
    }
})

mongoDBConnection()


app.listen(3820,()=>{
    console.log("node js is running on the 3820");
});
