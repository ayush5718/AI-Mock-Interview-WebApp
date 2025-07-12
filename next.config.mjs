/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "tailwindui.com", "i.ibb.co"],
  },
  // Configure API routes for file uploads
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase body size limit for PDF uploads
    },
    responseLimit: '10mb',
  },
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai'],
  },
};

export default nextConfig;
