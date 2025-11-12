import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGO_URI not found in .env file');
    process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

console.log('🧪 Testing Backend Performance...\n');

// Test 1: Email lookup (login simulation)
console.time('✅ Email Lookup (with index)');
await User.findOne({ email: 'test@example.com' });
console.timeEnd('✅ Email Lookup (with index)');

// Test 2: Role filtering
console.time('✅ Find All Lawyers (with index)');
await User.find({ role: 'lawyer' });
console.timeEnd('✅ Find All Lawyers (with index)');

// Test 3: Compound query (most common)
console.time('✅ Find Active Lawyers (with compound index)');
await User.find({ role: 'lawyer', isActive: true });
console.timeEnd('✅ Find Active Lawyers (with compound index)');

// Test 4: Sorting by date
console.time('✅ Get Recent Users (with index)');
await User.find().sort({ createdAt: -1 }).limit(10);
console.timeEnd('✅ Get Recent Users (with index)');

console.log('\n📊 Results:');
console.log('- Times under 50ms = Excellent ✅');
console.log('- Times 50-100ms = Good 👍');
console.log('- Times over 100ms = Needs optimization ⚠️');

await mongoose.connection.close();
