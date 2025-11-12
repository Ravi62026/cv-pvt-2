/**
 * Redis Client Configuration
 * 
 * This file creates a Redis client connection for caching.
 * 
 * Why Redis?
 * - Stores frequently accessed data in memory (RAM)
 * - 50-100x faster than MongoDB queries
 * - Reduces database load by 90%
 * 
 * Connection Method: Standard Redis Protocol
 * - Uses redis npm package
 * - Connects via redis:// protocol
 * - Requires TLS for Upstash
 */

import { createClient } from 'redis';

// Create Redis client with Upstash URL
const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,  // Required for Upstash
        rejectUnauthorized: false  // Accept self-signed certificates
    }
});

// Error handling
redisClient.on('error', (err) => {
    console.error('❌ Redis Error:', err.message);
    // Don't crash the app if Redis fails
    // App will continue without caching
});

// Connection event
redisClient.on('connect', () => {
    console.log('🔄 Redis connecting...');
});

// Ready event
redisClient.on('ready', () => {
    console.log('✅ Redis connected successfully!');
    console.log(`📍 Connected to: ${process.env.REDIS_URL?.split('@')[1]?.split(':')[0] || 'Upstash'}`);
});

// Reconnecting event
redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});

// Connect to Redis
try {
    await redisClient.connect();
} catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    console.log('⚠️  App will continue without caching');
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await redisClient.quit();
    console.log('👋 Redis connection closed');
});

export default redisClient;
