/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL('https://appwrite.chuguang.vip:54810/**'),
        ],
    },
}

export default nextConfig
