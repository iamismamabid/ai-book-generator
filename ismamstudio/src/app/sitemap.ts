import { MetadataRoute } from 'next'
import { BLOG_POSTS } from './blog/posts'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.kdpage.com';

    // Dynamically generate blog post URLs from BLOG_POSTS array
    const blogPostUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [
        // ── Core Pages ──────────────────────────────────────────
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // ── Blog Posts (dynamically generated from BLOG_POSTS) ───
        ...blogPostUrls,
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/examples`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },

        // ── Creation Studios ────────────────────────────────────
        {
            url: `${baseUrl}/studio`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/maze`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/studio/cryptogram`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/studio/math-puzzle`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/studio/word-scramble`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/studio/kakuro`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },

        // ── Free Tools ──────────────────────────────────────────
        {
            url: `${baseUrl}/tools`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/tools/spine-calculator`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/tools/isbn-generator`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/tools/keyword-research`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/tools/word-search`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // New free tools (calculators, text, image, and PDF utilities)
        ...[
            'print-cost-calculator',
            'kenp-calculator',
            'ebook-royalty-calculator',
            'ads-roi-calculator',
            'reading-time-calculator',
            'readability-calculator',
            'keyword-density',
            'grammar-checker',
            'copyright-page-generator',
            'trademark-checker',
            'book-planner',
            'word-cloud',
            'qr-code-generator',
            'image-resizer',
            'background-remover',
            'photo-to-line-art',
            'pattern-generator',
            'stock-images',
            'pdf-compressor',
            'kdp-file-validator',
            'ocr-scanner',
            'interior-templates',
        ].map((slug) => ({
            url: `${baseUrl}/tools/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),

        // ── Utility & Marketing ─────────────────────────────────
        {
            url: `${baseUrl}/kdp-checklist`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/redeem`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/affiliate`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },

        // ── Legal ───────────────────────────────────────────────
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/refund`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/cookies`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]
}