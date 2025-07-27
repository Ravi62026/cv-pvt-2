// Test script for email service
import emailService from './utils/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testEmail = async () => {
    console.log('🧪 Testing Email Service...\n');

    // Test email configuration
    console.log('📧 Email Configuration:');
    console.log(`- Email User: ${process.env.EMAIL_USER || 'Not configured'}`);
    console.log(`- Email From: ${process.env.EMAIL_FROM || 'Not configured'}`);
    console.log(`- Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('❌ Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
        return;
    }

    try {
        // Test 1: Welcome Email
        console.log('🔄 Testing Welcome Email...');
        const welcomeResult = await emailService.sendLawyerWelcomeEmail(
            'test@example.com', 
            'Test Lawyer'
        );
        
        if (welcomeResult.success) {
            console.log('✅ Welcome email test passed');
        } else {
            console.log('❌ Welcome email test failed:', welcomeResult.error);
        }

        // Test 2: Verification Approved Email
        console.log('\n🔄 Testing Verification Approved Email...');
        const approvedResult = await emailService.sendLawyerVerificationApproved(
            'test@example.com', 
            'Test Lawyer',
            'Your documents have been verified successfully.'
        );
        
        if (approvedResult.success) {
            console.log('✅ Verification approved email test passed');
        } else {
            console.log('❌ Verification approved email test failed:', approvedResult.error);
        }

        // Test 3: Verification Rejected Email
        console.log('\n🔄 Testing Verification Rejected Email...');
        const rejectedResult = await emailService.sendLawyerVerificationRejected(
            'test@example.com', 
            'Test Lawyer',
            'Please upload clearer documents and update your profile.'
        );
        
        if (rejectedResult.success) {
            console.log('✅ Verification rejected email test passed');
        } else {
            console.log('❌ Verification rejected email test failed:', rejectedResult.error);
        }

        console.log('\n🎉 Email service testing completed!');
        
    } catch (error) {
        console.error('❌ Email service test failed:', error);
    }
};

// Run the test
testEmail().then(() => {
    console.log('\n📝 Note: These are test emails sent to test@example.com');
    console.log('💡 To test with real emails, update the email addresses in this script');
    process.exit(0);
}).catch((error) => {
    console.error('Test script error:', error);
    process.exit(1);
});
