import { MetadataRoute } from 'next'
import { DESCRIPTION, APP_NAME, DEFAULT_TITLE } from '@/lib/constants'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: APP_NAME,
        short_name: APP_NAME,
        description: DESCRIPTION || DEFAULT_TITLE,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
