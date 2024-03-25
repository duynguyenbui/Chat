/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/api/v1/chat/messages/**',
            },
            {
                protocol: 'http',
                hostname: 'server',
                port: '8080',
                pathname: '/api/v1/chat/messages/**',
            },
        ],
    },
};

module.exports = nextConfig;
