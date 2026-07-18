import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.kdpage.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/book/', '/sign-in', '/sign-up', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
