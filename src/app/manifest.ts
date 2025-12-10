import type { MetadataRoute } from 'next'

type ExtendedManifest = MetadataRoute.Manifest & {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  orientation: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
  screenshots?: Array<{
    src: string;
    type?: string;
    sizes?: string;
    form_factor?: 'narrow' | 'wide';
  }>;
};

export default function manifest(): ExtendedManifest {
  return {
    id: 'instruement',
    name: 'Instruement',
    short_name: 'Instruement',
    description: 'Tell the true story about your musical instrument',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafb',
    theme_color: '#171412',
    orientation: "portrait",
    prefer_related_applications: false,
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
    screenshots: [
      {
        src: 'images/screenshots/narrow-home-user.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: 'images/screenshots/narrow-account-user.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
      }
    ],
  }
}