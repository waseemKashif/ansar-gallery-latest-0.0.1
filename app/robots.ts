import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/my-account/',
        },
        sitemap: 'https://ansargallery.com/sitemap.xml',
    }
}
