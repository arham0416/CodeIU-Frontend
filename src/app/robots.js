export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://codeiu.in";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/Admin/',   // Secure internal admin routes
        '/Profile/', // User-specific profile data
        '/(auth)/',  // Authentication flows
        '/api/',     // Backend API proxies
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
