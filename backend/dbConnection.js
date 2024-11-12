import mongoose from "mongoose";


export async function mongoDBConnection(){
    try{
        const uri="mongodb+srv://sushmaharikapallam:SUSHMA@vegetable.tr3hi.mongodb.net/"
        await mongoose.connect(uri)

        const db=mongoose.connection.useDb("Vegetable_Dhukhan");
        const user_details=db.collection("user_details");
        const vegetableData_collection=db.collection("vegetableData_collection");
        console.log("mongo connected")
        return {user_details, vegetableData_collection};

    }
    catch(error){
        console.log(error);
    }
}