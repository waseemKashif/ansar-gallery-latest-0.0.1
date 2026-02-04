import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n'
import { fetchCategoriesServer } from '@/lib/metadata-server'
import { CategoriesWithSubCategories } from '@/types'
import { slugify } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.ansargallery.com'

// Static routes to include
const staticRoutes = [
    '',
    '/about-us',
    '/contact', // Assuming this exists/works
    '/delivery-information',
    '/privacy-policy',
    '/terms-and-conditions',
    '/returnPolicy',
    '/faqs',
    '/promotions',
    '/bestSeller'
]

function flattenCategories(categories: CategoriesWithSubCategories[]): string[] {
    let slugs: string[] = []

    for (const cat of categories) {
        // Use provided slug or fallback to slugified title
        const slug = cat.slug || slugify(cat.title)
        if (slug) {
            slugs.push(slug)
        }

        if (cat.section && cat.section.length > 0) {
            slugs = [...slugs, ...flattenCategories(cat.section)]
        }
    }

    // Remove duplicates
    return Array.from(new Set(slugs))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = []

    for (const locale of i18n.locales) {
        // 1. Static Routes
        for (const route of staticRoutes) {
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: route === '' ? 1.0 : 0.8,
            })
        }

        // 2. Categories
        try {
            const categories = await fetchCategoriesServer(locale)
            const catSlugs = flattenCategories(categories)

            for (const slug of catSlugs) {
                sitemapEntries.push({
                    url: `${BASE_URL}/${locale}/${slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                })
            }
        } catch (error) {
            console.error(`Failed to generate sitemap for locale ${locale}:`, error)
        }
    }

    return sitemapEntries
}
