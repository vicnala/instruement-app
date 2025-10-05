import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Instruement',
    short_name: 'Instruement',
    description: 'Stay connected to your musical instrument',
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
        src: 'images/icons/apple-touch-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}