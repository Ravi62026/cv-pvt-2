// Test script to verify email service and lawyer verification flow
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import emailService from './utils/emailService.js';

// Load environment variables
dotenv.config();

const testEmailVerification = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('🔗 Connected to database');

        // Test email service connection
        console.log('\n📧 Testing email service connection...');
        const isEmailServiceWorking = await emailService.verifyConnection();
        
        if (!isEmailServiceWorking) {
            console.log('❌ Email service not working. Please check your email configuration.');
            return;
        }

        console.log('✅ Email service is working!');

        // Find a test lawyer (create one if doesn't exist)
        let testLawyer = await User.findOne({ 
            email: 'test.lawyer@example.com',
            role: 'lawyer' 
        });

        if (!testLawyer) {
            console.log('\n👨‍⚖️ Creating test lawyer...');
            testLawyer = await User.create({
                name: 'Test Lawyer',
                email: 'test.lawyer@example.com',
                password: 'TestPassword123!',
                role: 'lawyer',
                phone: '9999999999',
                isVerified: false,
                isActive: true,
                address: {
                    street: 'Test Street',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456',
                },
                lawyerDetails: {
                    barId: 'TEST123',
                    experience: 5,
                    specialization: ['Constitutional Law'],
                    education: 'LLB from Test University',
                    verificationStatus: 'pending'
                }
            });
            console.log('✅ Test lawyer created');
        }

        // Test verification approval email
        console.log('\n📧 Testing verification approval email...');
        const approvalResult = await emailService.sendLawyerVerificationApproved(
            testLawyer.email,
            testLawyer.name,
            'Your documents have been verified successfully. Welcome to ChainVerdict!'
        );

        if (approvalResult.success) {
            console.log('✅ Verification approval email sent successfully!');
            console.log(`   Message ID: ${approvalResult.messageId}`);
        } else {
            console.log('❌ Failed to send verification approval email:', approvalResult.error);
        }

        // Test verification rejection email
        console.log('\n📧 Testing verification rejection email...');
        const rejectionResult = await emailService.sendLawyerVerificationRejected(
            testLawyer.email,
            testLawyer.name,
            'Please upload a clearer copy of your bar council certificate and update your profile with complete education details.'
        );

        if (rejectionResult.success) {
            console.log('✅ Verification rejection email sent successfully!');
            console.log(`   Message ID: ${rejectionResult.messageId}`);
        } else {
            console.log('❌ Failed to send verification rejection email:', rejectionResult.error);
        }

        // Test welcome email
        console.log('\n📧 Testing welcome email...');
        const welcomeResult = await emailService.sendLawyerWelcomeEmail(
            testLawyer.email,
            testLawyer.name
        );

        if (welcomeResult.success) {
            console.log('✅ Welcome email sent successfully!');
            console.log(`   Message ID: ${welcomeResult.messageId}`);
        } else {
            console.log('❌ Failed to send welcome email:', welcomeResult.error);
        }

        console.log('\n🎉 Email verification test completed!');
        console.log('\n📋 Summary:');
        console.log(`   Email Service: ${isEmailServiceWorking ? '✅ Working' : '❌ Not Working'}`);
        console.log(`   Approval Email: ${approvalResult.success ? '✅ Sent' : '❌ Failed'}`);
        console.log(`   Rejection Email: ${rejectionResult.success ? '✅ Sent' : '❌ Failed'}`);
        console.log(`   Welcome Email: ${welcomeResult.success ? '✅ Sent' : '❌ Failed'}`);

        // Clean up test lawyer (optional)
        // await User.deleteOne({ _id: testLawyer._id });
        // console.log('🧹 Test lawyer cleaned up');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        process.exit(0);
    }
};

// Test lawyer verification flow
const testLawyerVerificationFlow = async () => {
    try {
        await connectDB();
        console.log('🔗 Connected to database');

        // Find an unverified lawyer
        const unverifiedLawyer = await User.findOne({
            role: 'lawyer',
            isVerified: false
        });

        if (!unverifiedLawyer) {
            console.log('ℹ️ No unverified lawyers found to test with');
            return;
        }

        console.log(`\n👨‍⚖️ Found unverified lawyer: ${unverifiedLawyer.name} (${unverifiedLawyer.email})`);
        console.log(`   Current status: ${unverifiedLawyer.isVerified ? 'Verified' : 'Not Verified'}`);

        // Simulate admin verification
        console.log('\n⚖️ Simulating admin verification...');
        unverifiedLawyer.isVerified = true;
        if (!unverifiedLawyer.lawyerDetails) {
            unverifiedLawyer.lawyerDetails = {};
        }
        unverifiedLawyer.lawyerDetails.verificationNotes = 'Account verified successfully by admin';
        await unverifiedLawyer.save();

        // Send verification email
        const emailResult = await emailService.sendLawyerVerificationApproved(
            unverifiedLawyer.email,
            unverifiedLawyer.name,
            'Your account has been verified successfully. You now have full access to all platform features.'
        );

        if (emailResult.success) {
            console.log('✅ Verification complete! Email sent successfully.');
            console.log(`   Lawyer: ${unverifiedLawyer.name}`);
            console.log(`   Email: ${unverifiedLawyer.email}`);
            console.log(`   Status: Verified`);
            console.log(`   Message ID: ${emailResult.messageId}`);
        } else {
            console.log('❌ Verification completed but email failed:', emailResult.error);
        }

    } catch (error) {
        console.error('❌ Verification flow test failed:', error);
    } finally {
        process.exit(0);
    }
};

// Run the appropriate test based on command line argument
const testType = process.argv[2] || 'email';

if (testType === 'flow') {
    testLawyerVerificationFlow();
} else {
    testEmailVerification();
}
