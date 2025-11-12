/**
 * Redis Client Configuration (REST API Method)
 * 
 * This file creates a Redis client using Upstash REST API.
 * 
 * Why REST API instead of Redis Protocol?
 * - Better for serverless/edge environments
 * - No connection pooling issues with PM2 clustering
 * - HTTP-based (works everywhere)
 * - Simpler setup
 * 
 * Connection Method: Upstash REST API
 * - Uses @upstash/redis npm package
 * - Connects via HTTPS
 * - No TLS configuration needed
 */

import { Redis } from '@upstash/redis';

// Create Redis client with REST API
const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test connection (async, will be called from server.js)
export const testRedisConnection = async () => {
    try {
        const result = await redisClient.ping();
        console.log('✅ Redis (REST) connected successfully!');
        console.log(`📍 Connected to: ${process.env.UPSTASH_REDIS_REST_URL?.split('//')[1]?.split('.')[0] || 'Upstash'}`);
        console.log(`🏓 Ping result: ${result}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error.message);
        console.log('⚠️  App will continue without caching');
        return false;
    }
};

export default redisClient;
