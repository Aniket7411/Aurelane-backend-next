// Test Password Reset Functionality
// Run this to test: node test-password-reset.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testPasswordReset() {
    console.log('🧪 Testing Password Reset Flow...\n');
    
    try {
        // Step 1: Test forgot password
        console.log('1️⃣ Testing forgot password...');
        const forgotResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
            email: 'auralanegt@gmail.com'
        });
        
        console.log('✅ Forgot password response:', forgotResponse.data);
        
        if (forgotResponse.data.success) {
            console.log('📧 Email sent successfully!');
            
            // Extract token from response (for development)
            const resetToken = forgotResponse.data.resetToken;
            if (resetToken) {
                console.log('🔑 Reset token:', resetToken);
                
                // Step 2: Test reset password
                console.log('\n2️⃣ Testing reset password...');
                const resetResponse = await axios.put(`${BASE_URL}/api/auth/reset-password/${resetToken}`, {
                    password: 'newpassword123'
                });
                
                console.log('✅ Reset password response:', resetResponse.data);
                
                if (resetResponse.data.success) {
                    console.log('🎉 Password reset successful!');
                } else {
                    console.log('❌ Password reset failed:', resetResponse.data.message);
                }
            } else {
                console.log('ℹ️ No reset token in response (email configured)');
                console.log('📬 Check your email for the reset link');
            }
        } else {
            console.log('❌ Forgot password failed:', forgotResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testPasswordReset();
