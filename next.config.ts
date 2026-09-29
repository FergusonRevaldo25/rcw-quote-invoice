/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: `default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'${
      isDev ? " 'unsafe-eval'" : ""
    }; style-src 'self' 'unsafe-inline'; connect-src 'self' https://wa.me; frame-ancestors 'none';`,
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
