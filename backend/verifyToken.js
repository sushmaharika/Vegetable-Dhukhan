import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const secret_key=process.env.SECRET_KEY;
console.log(secret_key);

const VerifyToken=(req,res,next)=>{
    const token=req.headers["authorization"]

    if(!token){
        return res.status(400).send({message:"Token is missing"})
    }
    jwt.verify(token,secret_key,(err,decode)=>{
        if(err){
            return res.status(400).send({message:"Invalid Token"})
        }
        req.user=decode;
        console.log("decoded",decode);
        next();
    })
}

export default VerifyToken;