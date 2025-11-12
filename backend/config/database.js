import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false);

        // Connection pool configuration for scalability
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 50,              // Maximum 50 connections in pool
            minPoolSize: 10,              // Minimum 10 connections always ready
            socketTimeoutMS: 45000,       // Close sockets after 45s of inactivity
            serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server available
            family: 4                     // Use IPv4, skip IPv6 for faster connection
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Connection Pool: Min=${10}, Max=${50}`);
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
