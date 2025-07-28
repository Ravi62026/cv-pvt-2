import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email service configuration
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    // Initialize email transporter
    initializeTransporter() {
        try {
            // Gmail configuration (you can switch to SendGrid or other providers)
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS, // Use App Password for Gmail
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Alternative configuration for other SMTP providers
            if (process.env.SMTP_HOST) {
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD,
                    },
                });
            }

            console.log('📧 Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error);
        }
    }

    // Verify email configuration
    async verifyConnection() {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }
            
            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return true;
        } catch (error) {
            console.error('❌ Email service verification failed:', error);
            return false;
        }
    }

    // Send email
    async sendEmail(to, subject, html, text = null) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }

            const mailOptions = {
                from: `"ChainVerdict Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text: text || this.stripHtml(html),
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Email sent successfully to ${to}:`, result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Strip HTML tags for plain text version
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    // Lawyer verification approved email
    async sendLawyerVerificationApproved(lawyerEmail, lawyerName, verificationNotes = '') {
        const subject = '🎉 Your Lawyer Account Has Been Verified - ChainVerdict';
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Verified</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
                .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .highlight { background: #e0e7ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations!</h1>
                    <p>Your lawyer account has been verified</p>
                </div>
                <div class="content">
                    <p>Dear <strong>${lawyerName}</strong>,</p>
                    
                    <div class="success-badge">
                        ✅ Account Verified
                    </div>
                    
                    <p>Great news! Your lawyer account on ChainVerdict has been successfully verified by our admin team. You now have full access to all platform features.</p>
                    
                    ${verificationNotes ? `
                    <div class="highlight">
                        <strong>Admin Notes:</strong><br>
                        ${verificationNotes}
                    </div>
                    ` : ''}
                    
                    <h3>🚀 What you can do now:</h3>
                    <ul>
                        <li>Accept and manage client cases</li>
                        <li>Participate in legal consultations</li>
                        <li>Access AI-powered legal tools</li>
                        <li>Connect with citizens and other lawyers</li>
                        <li>Manage your professional profile</li>
                    </ul>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">
                        Login to Your Account
                    </a>
                    
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    
                    <p>Welcome to the ChainVerdict community!</p>
                    
                    <p>Best regards,<br>
                    <strong>ChainVerdict Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message from ChainVerdict Platform</p>
                    <p>© 2024 ChainVerdict. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        return await this.sendEmail(lawyerEmail, subject, html);
    }

    // Lawyer verification rejected email
    async sendLawyerVerificationRejected(lawyerEmail, lawyerName, rejectionReason = '') {
        const subject = '❌ Lawyer Account Verification Update - ChainVerdict';
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Update</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .warning-badge { background: #ef4444; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
                .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .highlight { background: #fee2e2; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ef4444; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Verification Update</h1>
                    <p>Regarding your lawyer account application</p>
                </div>
                <div class="content">
                    <p>Dear <strong>${lawyerName}</strong>,</p>
                    
                    <div class="warning-badge">
                        ❌ Verification Required
                    </div>
                    
                    <p>Thank you for your interest in joining ChainVerdict as a verified lawyer. After reviewing your application, we need additional information or documentation before we can approve your account.</p>
                    
                    ${rejectionReason ? `
                    <div class="highlight">
                        <strong>Reason for Review:</strong><br>
                        ${rejectionReason}
                    </div>
                    ` : ''}
                    
                    <h3>📋 Next Steps:</h3>
                    <ul>
                        <li>Review the feedback provided above</li>
                        <li>Update your profile with the required information</li>
                        <li>Upload any missing documents</li>
                        <li>Contact our support team if you need assistance</li>
                    </ul>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">
                        Update Your Profile
                    </a>
                    
                    <p>Once you've addressed the requirements, our team will review your application again. We appreciate your patience and look forward to having you as part of our legal community.</p>
                    
                    <p>If you have any questions, please contact our support team at admin@chainverdict.in./p>
                    
                    <p>Best regards,<br>
                    <strong>ChainVerdict Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message from ChainVerdict Platform</p>
                    <p>© 2024 ChainVerdict. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        return await this.sendEmail(lawyerEmail, subject, html);
    }

    // Welcome email for new lawyer registration
    async sendLawyerWelcomeEmail(lawyerEmail, lawyerName) {
        const subject = '👋 Welcome to ChainVerdict - Verification Pending';
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ChainVerdict</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-badge { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
                .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .highlight { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👋 Welcome to ChainVerdict!</h1>
                    <p>Your lawyer account has been created</p>
                </div>
                <div class="content">
                    <p>Dear <strong>${lawyerName}</strong>,</p>
                    
                    <div class="info-badge">
                        ⏳ Verification Pending
                    </div>
                    
                    <p>Thank you for registering as a lawyer on ChainVerdict! Your account has been created successfully and is currently under review by our admin team.</p>
                    
                    <div class="highlight">
                        <strong>What happens next?</strong><br>
                        Our team will review your credentials and documentation. You'll receive an email notification once your account is verified.
                    </div>
                    
                    <h3>📋 During the verification process:</h3>
                    <ul>
                        <li>Your account access is temporarily limited</li>
                        <li>You can log in and update your profile</li>
                        <li>Full platform features will be available after verification</li>
                        <li>Verification typically takes 1-3 business days</li>
                    </ul>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">
                        Access Your Account
                    </a>
                    
                    <p>If you have any questions during the verification process, please contact our support team.</p>
                    
                    <p>Thank you for choosing ChainVerdict!</p>
                    
                    <p>Best regards,<br>
                    <strong>ChainVerdict Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message from ChainVerdict Platform</p>
                    <p>© 2024 ChainVerdict. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        return await this.sendEmail(lawyerEmail, subject, html);
    }
}

// Create and export email service instance
const emailService = new EmailService();
export default emailService;
