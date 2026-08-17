import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.kdpage.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard', '/book/', '/sign-in', '/sign-up', '/api/'],
            },
            {
                userAgent: [
                    'GPTBot',
                    'OAI-SearchBot',
                    'ChatGPT-User',
                    'PerplexityBot',
                    'ClaudeBot',
                    'anthropic-ai',
                    'Google-Extended',
                    'Bingbot'
                ],
                allow: [
                    '/',
                    '/llms.txt',
                    '/pricing',
                    '/about',
                    '/blog',
                    '/docs',
                    '/help',
                    '/tools/',
                    '/studio',
                    '/sudoku',
                    '/maze',
                    '/faq',
                    '/compare'
                ],
                disallow: ['/dashboard', '/book/', '/sign-in', '/sign-up', '/api/'],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
