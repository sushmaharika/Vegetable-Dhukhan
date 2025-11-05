import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { mongoDBConnection } from './dbConnection.js';
import { Transaction } from './Schema.js';
import VerifyToken from './verifyToken.js';
import VerifyAdmin from './verifyAdmin.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import twilio from 'twilio';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post("/send-sms", VerifyToken, async (req, res) => {
    const { phoneNumber, message } = req.body;
    try {
        const messageResponse = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        res.status(200).json({ message: "SMS sent successfully", sid: messageResponse.sid });
    } catch (error) {
        console.error("Error sending SMS:", error);
        res.status(500).json({ message: "Failed to send SMS" });
    }
});

app.get("/api/v2/get-user-details", VerifyToken, async (req, res) => {
    const userId = req.headers.id;
    const userRole = req.user.role; // Get role from token
    if (!userId) {
        return res.status(400).json({ message: "User ID is missing in headers" });
    }
    try {
        const { user_details, admin_details } = await mongoDBConnection();

        // Check appropriate collection based on role
        let user = null;
        if (userRole === 'admin') {
            user = await admin_details.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        } else {
            user = await user_details.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            data: {
                username: user.name || "Guest",
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: userRole || user.role || 'user'
            },
        });
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/signupDetails", async (req, res) => {
    const { name, phoneNumber, email, password, role } = req.body;
    try {
        const { user_details, admin_details } = await mongoDBConnection();
        
        // Check if email exists in either collection
        const existingUser = await user_details.findOne({ email });
        const existingAdmin = await admin_details.findOne({ email });
        
        if (existingUser || existingAdmin) {
            return res.status(400).json({ message: "User Already Exists!" });
        }
        
        // Validate and set role
        const validRole = (role === 'admin') ? 'admin' : 'user';
        const userData = { 
            name, 
            email, 
            password, 
            phoneNumber, 
            role: validRole 
        };
        
        // Save to appropriate collection based on role
        let result;
        if (validRole === 'admin') {
            result = await admin_details.insertOne(userData);
            console.log('Admin registered - ID:', result.insertedId);
        } else {
            result = await user_details.insertOne(userData);
            console.log('Customer registered - ID:', result.insertedId);
        }
        
        res.status(200).json({ 
            message: "User successfully registered!",
            role: validRole
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Signin Endpoint
app.post("/signinDetails", async (req, res) => {
    const { email, password } = req.body;
    try {
        const { user_details, admin_details } = await mongoDBConnection();
        
        // Check in both collections
        let user = await user_details.findOne({ email });
        let isAdmin = false;
        
        if (!user) {
            user = await admin_details.findOne({ email });
            isAdmin = true;
        }
        
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }
        
        // Determine role based on which collection user was found in
        const userRole = isAdmin ? 'admin' : (user.role || 'user');
        console.log('User login - Email:', email, 'Role:', userRole, 'Collection:', isAdmin ? 'admin_details' : 'user_details');
        
        const token = jwt.sign({ id: user._id.toString(), role: userRole }, process.env.SECRET_KEY, { expiresIn: "2h" });
        return res.status(200).json({ 
            message: "Login successful!", 
            token,
            role: userRole,
            userId: user._id.toString()
        });
    } catch (error) {
        console.error('Signin error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Save Cart Data - Available to all authenticated users (customers and admins can shop)
app.post("/saveCart", VerifyToken, async (req, res) => {
    const { id } = req.user;
    const { cartItems } = req.body;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        await vegetableData_collection.updateOne(
            { userID: id },
            { $set: { cartItems } },
            { upsert: true }
        );
        return res.status(200).json({ message: "Cart data saved successfully" });
    } catch (error) {
        console.error("Error saving cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Retrieve Cart Data - Available to all authenticated users
app.get("/getCart", VerifyToken, async (req, res) => {
    const { id } = req.user;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        const cart = await vegetableData_collection.findOne({ userID: id });
        return res.status(200).json({ cartItems: cart?.cartItems || [] });
    } catch (error) {
        console.error("Error retrieving cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Save Transaction Data - Available to all authenticated users (customers and admins can purchase)
app.post("/saveTransaction", VerifyToken, async (req, res) => {
    const { id } = req.user;
    const { transactionId, cartItems, address } = req.body;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        
        // Save transaction with proper userID format (ensure it's a string)
        const userIdString = id.toString();
        const transactionData = {
            userID: userIdString,
            transactionId,
            cartItems: cartItems || [],
            address: address || 'Not provided',
            status: 'completed',
            date: new Date()
        };
        
        const created = await Transaction.create(transactionData);
        console.log('Transaction saved - ID:', created?._id?.toString?.(), 'UserID:', userIdString, 'Status:', created?.status, 'Address:', created?.address);
        
        // Clear cart after successful transaction (match string userID)
        await vegetableData_collection.updateOne(
            { userID: userIdString },
            { $set: { cartItems: [] } },
            { upsert: true }
        );
        
        return res.status(200).json({ message: "Transaction data saved successfully", id: created?._id?.toString?.() });
    } catch (error) {
        console.error("Error saving transaction:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get Vegetables Endpoint - Available to all authenticated users (customers and admins)
app.get("/getVegetables", VerifyToken, async (req, res) => {
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        // Get products that are not user-specific carts
        const vegetables = await vegetableData_collection.find({ userID: { $exists: false } }).toArray();
        return res.status(200).json({ vegetables });
    } catch (error) {
        console.error('Error fetching vegetables:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Insert Vegetables Endpoint
app.post("/insertVegetables", VerifyToken, async (req, res) => {
    const { vegetables } = req.body;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        await vegetableData_collection.insertMany(vegetables);
        return res.status(200).json({ message: "Vegetables inserted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update Vegetable Endpoint
app.put("/updateVegetable/:id", VerifyToken, async (req, res) => {
    const { id } = req.params;
    const { vegetableName, price, imageURL } = req.body;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        await vegetableData_collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { vegetableName, price, imageURL } }
        );
        return res.status(200).json({ message: "Vegetable updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ==================== ADMIN DASHBOARD ENDPOINTS ====================

// Get Dashboard Statistics - ADMIN ONLY
app.get("/api/admin/dashboard/stats", VerifyAdmin, async (req, res) => {
    try {
        const { user_details } = await mongoDBConnection();
        // Use model for transactions
        const allTransactions = await Transaction.find({}).lean();
        const completedTransactions = allTransactions.filter(t => (t.status || 'completed') === 'completed');
        const totalOrders = completedTransactions.length;

        const toNum = (v) => {
            const n = typeof v === 'string' ? parseFloat(v) : v;
            return Number.isFinite(n) ? n : 0;
        };

        const pendingOrders = allTransactions.filter(t => (t.status || 'completed') === 'pending').length;
        const totalRevenue = completedTransactions.reduce((sum, t) => {
            const orderTotal = Array.isArray(t.cartItems)
                ? t.cartItems.reduce((itemSum, item) => itemSum + (toNum(item.price) * toNum(item.quantity || 1)), 0)
                : 0;
            return sum + orderTotal;
        }, 0);

        const totalCustomers = await user_details.countDocuments({});
        const allUsers = await user_details.find({}).toArray();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let newCustomers = 0;
        try {
            allUsers.forEach(u => {
                const userId = u._id.toString();
                if (userId.length >= 8) {
                    const timestamp = parseInt(userId.substring(0, 8), 16) * 1000;
                    if (new Date(timestamp) >= thirtyDaysAgo) newCustomers++;
                }
            });
        } catch (_) {
            newCustomers = allUsers.length;
        }

        const statusCounts = {
            pending: allTransactions.filter(t => (t.status || 'completed') === 'pending').length,
            processing: allTransactions.filter(t => t.status === 'processing').length,
            completed: completedTransactions.length,
            cancelled: allTransactions.filter(t => t.status === 'cancelled').length
        };

        return res.status(200).json({
            totalOrders,
            pendingOrders,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            newCustomers,
            totalCustomers,
            statusDistribution: statusCounts
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Products (Admin)
app.get("/api/admin/products", VerifyAdmin, async (req, res) => {
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        // Get products that are not user-specific carts
        const products = await vegetableData_collection.find({ userID: { $exists: false } }).toArray();
        
        const formattedProducts = products.map(p => ({
            id: p._id,
            name: p.vegetableName || p.name || 'Unknown',
            image: p.imageURL || p.image || '',
            price: p.price || 0,
            stock: p.stock || 0,
            category: p.category || 'Vegetables',
            status: p.stock > 0 ? 'In Stock' : 'Out of Stock',
            description: p.description || ''
        }));
        
        return res.status(200).json({ products: formattedProducts });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Create/Add Product
app.post("/api/admin/products", VerifyAdmin, async (req, res) => {
    const { name, description, price, stock, category, imageURL } = req.body;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        await vegetableData_collection.insertOne({
            vegetableName: name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category: category || 'Vegetables',
            imageURL: imageURL || '',
            status: stock > 0 ? 'In Stock' : 'Out of Stock'
        });
        return res.status(200).json({ message: "Product added successfully" });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update Product
app.put("/api/admin/products/:id", VerifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, category, imageURL } = req.body;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        await vegetableData_collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { 
                $set: { 
                    vegetableName: name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    category: category || 'Vegetables',
                    imageURL: imageURL || '',
                    status: stock > 0 ? 'In Stock' : 'Out of Stock'
                } 
            }
        );
        return res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Product
app.delete("/api/admin/products/:id", VerifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const { vegetableData_collection } = await mongoDBConnection();
        await vegetableData_collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Orders - ADMIN ONLY
app.get("/api/admin/orders", VerifyAdmin, async (req, res) => {
    try {
        const { user_details } = await mongoDBConnection();
        const transactions = await Transaction.find({}).sort({ date: -1 }).lean();
        
        const ordersWithDetails = await Promise.all(transactions.map(async (t) => {
            // Try to find user with userID as string or ObjectId
            let user = null;
            try {
                user = await user_details.findOne({ _id: new mongoose.Types.ObjectId(t.userID) });
            } catch (e) {
                // If userID is already an ObjectId string, try direct match
                user = await user_details.findOne({ _id: t.userID });
            }
            
            const total = t.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
            
            const normalizedStatus = t.status && typeof t.status === 'string' && t.status.length > 0 ? t.status : 'completed';
            const normalizedAddress = (typeof t.address === 'string' && t.address.length > 0) ? t.address : 'Not provided';
            return {
                id: t._id.toString(),
                orderId: t.transactionId || t._id.toString(),
                customerName: user?.name || 'Unknown',
                customerEmail: user?.email || 'Unknown',
                customerId: t.userID?.toString() || t.userID,
                date: t.date,
                total: total,
                status: normalizedStatus,
                cartItems: Array.isArray(t.cartItems) ? t.cartItems : [],
                address: normalizedAddress
            };
        }));
        
        return res.status(200).json({ orders: ordersWithDetails });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get User's Orders - CUSTOMER ONLY (for regular users, not admins)
app.get("/api/user/orders", VerifyToken, async (req, res) => {
    const { id } = req.user;
    try {
        // Verify user is not admin - customers only
        const { user_details, admin_details } = await mongoDBConnection();
        
        // Check if user is admin
        const admin = await admin_details.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (admin) {
            return res.status(403).json({ message: "Admins should use admin endpoints" });
        }
        
        // Verify user exists in customer collection
        const user = await user_details.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (!user) {
            return res.status(404).json({ message: "Customer not found" });
        }
        
        // Fetch by stored string userID
        const userIdString = id.toString();
        const transactions = await Transaction.find({ userID: userIdString }).sort({ date: -1 }).lean();
        
        const orders = transactions.map(t => {
            const total = t.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
            const normalizedStatus = t.status && typeof t.status === 'string' && t.status.length > 0 ? t.status : 'completed';
            const normalizedAddress = (typeof t.address === 'string' && t.address.length > 0) ? t.address : 'Not provided';
            return {
                id: t._id.toString(),
                orderId: t.transactionId || t._id.toString(),
                date: t.date,
                total: total,
                status: normalizedStatus,
                cartItems: Array.isArray(t.cartItems) ? t.cartItems : [],
                address: normalizedAddress
            };
        });
        
        return res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get Single Order Details
app.get("/api/admin/orders/:id", VerifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const { user_details } = await mongoDBConnection();
        const order = await Transaction.findById(id).lean();
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        const user = await user_details.findOne({ _id: new mongoose.Types.ObjectId(order.userID) });
        const total = order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        
        return res.status(200).json({
            id: order._id,
            orderId: order.transactionId || order._id.toString(),
            customerName: user?.name || 'Unknown',
            customerEmail: user?.email || 'Unknown',
            customerPhone: user?.phoneNumber || 'Not provided',
            date: order.date,
            total: total,
            status: order.status || 'pending',
            cartItems: order.cartItems || [],
            address: order.address || 'Not provided'
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update Order Status
app.put("/api/admin/orders/:id/status", VerifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        // Validate status against allowed values
        const allowed = ['pending','processing','completed','cancelled'];
        const nextStatus = allowed.includes(status) ? status : 'processing';
        await Transaction.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { status: nextStatus } }
        );
        return res.status(200).json({ message: "Order status updated successfully", status: nextStatus });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Customers - ADMIN ONLY
app.get("/api/admin/customers", VerifyAdmin, async (req, res) => {
    try {
        const { user_details, admin_details } = await mongoDBConnection();
        // Get all customers from user_details collection only
        const users = await user_details.find({}).toArray();
        
        const customersWithOrders = await Promise.all(users.map(async (user) => {
            // Match userID as string or ObjectId
            const userOrders = await Transaction.find({ userID: user._id.toString() }).lean();
            
            const totalOrders = userOrders.length;
            const totalSpent = userOrders.reduce((sum, order) => {
                return sum + (order.cartItems?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0);
            }, 0);
            
            return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role || 'user',
                totalOrders,
                totalSpent
            };
        }));
        
        return res.status(200).json({ customers: customersWithOrders });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get Customer Details - ADMIN ONLY
app.get("/api/admin/customers/:id", VerifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const { user_details, transaction_collection } = await mongoDBConnection();
        const user = await user_details.findOne({ _id: new mongoose.Types.ObjectId(id) });
        
        if (!user) {
            return res.status(404).json({ message: "Customer not found" });
        }
        
        // Find orders matching userID as both string and ObjectId
        const orders = await transaction_collection.find({ 
            userID: { $in: [id, new mongoose.Types.ObjectId(id)] }
        }).sort({ date: -1 }).toArray();
        
        const orderHistory = orders.map(order => ({
            id: order._id,
            orderId: order.transactionId || order._id.toString(),
            date: order.date,
            total: order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
            status: order.status || 'pending',
            items: order.cartItems || [],
            address: order.address || 'Not provided'
        }));
        
        return res.status(200).json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role || 'user',
            totalOrders: orders.length,
            orderHistory
        });
    } catch (error) {
        console.error("Error fetching customer:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get Analytics Data
app.get("/api/admin/analytics", VerifyAdmin, async (req, res) => {
    try {
        const { transaction_collection, vegetableData_collection } = await mongoDBConnection();
        const transactions = await transaction_collection.find({}).toArray();
        
        // Sales trends (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            
            const dayTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= date && tDate < nextDate;
            });
            
            const daySales = dayTransactions.reduce((sum, t) => {
                return sum + (t.cartItems?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0);
            }, 0);
            
            last7Days.push({
                date: date.toISOString().split('T')[0],
                sales: daySales
            });
        }
        
        // Top 5 best-selling products
        const productSales = {};
        transactions.forEach(t => {
            t.cartItems?.forEach(item => {
                const productName = item.vegetableName || item.name || 'Unknown';
                if (!productSales[productName]) {
                    productSales[productName] = { name: productName, quantity: 0, revenue: 0 };
                }
                productSales[productName].quantity += item.quantity || 0;
                productSales[productName].revenue += (item.price || 0) * (item.quantity || 0);
            });
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        return res.status(200).json({
            salesTrends: last7Days,
            topProducts
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

mongoDBConnection();

app.listen(3820, () => {
    console.log("Node.js server is running on port 3820");
});