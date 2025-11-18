// Configuration file for different environments

const config = {
    development: {
        rateLimiting: {
            enabled: false,
            authLimit: 1000,
            otpLimit: 100,
            generalLimit: 10000
        },
        cors: {
            allowAllOrigins: true
        }
    },
    production: {
        rateLimiting: {
            enabled: true,
            authLimit: 100,
            otpLimit: 10,
            generalLimit: 1000
        },
        cors: {
            allowAllOrigins: false,
            allowedOrigins: [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://auralaneweb.vercel.app',
                'https://gems-frontend-two.vercel.app'
            ]
        }
    }
};

module.exports = config[process.env.NODE_ENV || 'development'];

