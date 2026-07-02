import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://www.ismamstudio.me',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        // Add other static tools or pages here as you build them, for example:
        // {
        //   url: 'https://www.ismamstudio.me/ai-book-generator',
        //   lastModified: new Date(),
        //   changeFrequency: 'monthly',
        //   priority: 0.8,
        // },
    ]
}