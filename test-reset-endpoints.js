// Test Reset Password Endpoints
// Run this to test: node test-reset-endpoints.js

const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testEndpoints() {
    console.log('🧪 Testing Password Reset Endpoints...\n');

    const baseUrl = 'localhost';
    const port = 5000;

    try {
        // Test 1: Forgot Password
        console.log('1️⃣ Testing forgot password...');
        const forgotResult = await makeRequest({
            hostname: baseUrl,
            port: port,
            path: '/api/auth/forgot-password',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'auralanegt@gmail.com' });

        console.log('Status:', forgotResult.status);
        console.log('Response:', forgotResult.data);

        if (forgotResult.data.success) {
            console.log('✅ Forgot password working!\n');

            // Test 2: GET reset password (should redirect)
            console.log('2️⃣ Testing GET reset password...');
            const getResetResult = await makeRequest({
                hostname: baseUrl,
                port: port,
                path: '/api/auth/reset-password/test-token-123',
                method: 'GET'
            });

            console.log('Status:', getResetResult.status);
            console.log('Response:', getResetResult.data);

            if (getResetResult.status === 302 || getResetResult.status === 200) {
                console.log('✅ GET reset password working!\n');
            }

            // Test 3: PUT reset password
            console.log('3️⃣ Testing PUT reset password...');
            const putResetResult = await makeRequest({
                hostname: baseUrl,
                port: port,
                path: '/api/auth/reset-password/test-token-123',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            }, { password: 'newpassword123' });

            console.log('Status:', putResetResult.status);
            console.log('Response:', putResetResult.data);

            if (putResetResult.status === 400) {
                console.log('✅ PUT reset password working (expected error for invalid token)!\n');
            }

        } else {
            console.log('❌ Forgot password failed');
        }

        console.log('🎉 All endpoint tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testEndpoints();
