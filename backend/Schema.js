import mongoose from "mongoose";

// Customer Schema
const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'customer'],
        default: 'user',
        required: true,
    }
});

// Admin Schema
const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin',
        required: true,
    }
});



// Transaction/Order Schema
const CartItemSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.Mixed },
    vegetableName: { type: String },
    name: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    imageURL: { type: String }
}, { _id: false, strict: false });

const TransactionSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    transactionId: { type: String },
    cartItems: { type: [CartItemSchema], default: [] },
    address: { type: String, default: 'Not provided' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'completed' },
    date: { type: Date, default: Date.now }
}, { collection: 'transaction_collection' });

export const Customer = mongoose.model("Customer", CustomerSchema, "user_details");
export const Admin = mongoose.model("Admin", AdminSchema, "admin_details");
export const Transaction = mongoose.model('Transaction', TransactionSchema,"transaction_collection");
