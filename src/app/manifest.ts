import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Instruement App',
    short_name: 'Instruement App',
    description: 'Secure your musical instrument\'s digital identity',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafb',
    theme_color: '#402e32',
    orientation: "portrait",
    icons: [
      {
        src: "images/icons/android-chrome-192x192.png",
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'images/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'images/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}