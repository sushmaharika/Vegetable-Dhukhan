// import mongoose from "mongoose";


// export async function mongoDBConnection(){
//     try{
//         const uri="mongodb+srv://sushmaharikapallam:SUSHMA@vegetable.tr3hi.mongodb.net/"
//         await mongoose.connect(uri)

//         const db=mongoose.connection.useDb("Vegetable_Dhukhan");
//         const user_details=db.collection("user_details");
//         const vegetableData_collection=db.collection("vegetableData_collection");
//         console.log("mongo connected")
//         return {user_details, vegetableData_collection};

//     }
//     catch(error){
//         console.log(error);
//     }
// }


import mongoose from "mongoose";

export async function mongoDBConnection() {
    try {
        const uri = "mongodb+srv://sushmaharikapallam:SUSHMA@vegetable.tr3hi.mongodb.net/";
        // Ensure models (mongoose.model) write to the intended DB
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "Vegetable_Dhukhan" });

        const db = mongoose.connection.useDb("Vegetable_Dhukhan");
        const user_details=db.collection("user_details");
        const admin_details=db.collection("admin_details");
        const vegetableData_collection=db.collection("vegetableData_collection");
        const transaction_collection=db.collection("transaction_collection");
        console.log("MongoDB connected");
        return { user_details, admin_details, vegetableData_collection, transaction_collection };
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}