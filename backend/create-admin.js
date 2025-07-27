// Quick admin creation script
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('🔗 Connected to database');

        // Admin credentials
        const adminEmail = 'admin@chainverdict.com';
        const adminPassword = 'Admin@123456';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            return;
        }

        // Create admin user
        const adminData = {
            name: 'System Administrator',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            phone: '9999999999',
            isVerified: true,
            isActive: true,
            address: {
                street: 'Admin Office',
                city: 'System City',
                state: 'System State',
                pincode: '000000',
            },
        };

        const admin = await User.create(adminData);
        console.log('✅ Admin user created successfully!');
        console.log(`   ID: ${admin._id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        
        console.log('\n🎉 Admin account ready!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log('\n🌐 Login at: http://localhost:5174/login');
        console.log('🛡️ Admin Dashboard: http://localhost:5174/admin/dashboard');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        process.exit(0);
    }
};

createAdmin();
