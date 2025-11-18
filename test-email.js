// Email Configuration Test Script
// Run this to test your email setup: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🧪 Testing Email Configuration...\n');

    // Check environment variables
    console.log('📋 Environment Check:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ Not set');
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ Not set');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
    console.log('');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('❌ Email not configured! Please set EMAIL_USER and EMAIL_PASS in .env file');
        console.log('📖 See EMAIL_SETUP_GUIDE.md for instructions');
        return;
    }

    try {
        // Create transporter
        console.log('🔧 Creating email transporter...');
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Test connection
        console.log('🔍 Testing connection...');
        await transporter.verify();
        console.log('✅ Connection successful!');

        // Send test email
        console.log('📤 Sending test email...');
        const info = await transporter.sendMail({
            from: `"Aurelane Gems Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: '🧪 Email Test - Aurelane Gems Backend',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
                        <h1 style="margin: 0;">🧪 Email Test Successful!</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your email configuration is working perfectly</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Congratulations! 🎉</h2>
                        <p style="color: #666;">Your backend email system is now configured and working. You should receive password reset emails when users request them.</p>
                        <p style="color: #666;"><strong>Test completed at:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📬 Check your inbox for the test email');

    } catch (error) {
        console.error('❌ Email test failed:', error.message);

        if (error.message.includes('Invalid login')) {
            console.log('\n💡 Solution: Check your email credentials');
            console.log('   - For Gmail: Use App Password, not regular password');
            console.log('   - Enable 2-Factor Authentication first');
        } else if (error.message.includes('ECONNECTION')) {
            console.log('\n💡 Solution: Check your internet connection and email host');
        } else if (error.message.includes('timeout')) {
            console.log('\n💡 Solution: Check firewall settings or try different port');
        }

        console.log('\n📖 See EMAIL_SETUP_GUIDE.md for detailed instructions');
    }
}

// Run the test
testEmail().catch(console.error);
