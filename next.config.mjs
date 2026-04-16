/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/asoworkshop',
        destination: '/asoworkshop-session1',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
