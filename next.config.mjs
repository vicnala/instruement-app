import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@mdxeditor/editor'],
    webpack: (config) => {
      config.experiments = { ...config.experiments, topLevelAwait: true }
      return config
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'instruement.com',
          port: '',
          pathname: '/wp-content/**',
          search: '',
        },
        {
          protocol: 'https',
          hostname: '*.instruement.com',
          port: '',
          pathname: '/web/**',
          search: '',
        },
        {
          protocol: 'https',
          hostname: '*.ipfscdn.io',
          port: '',
          pathname: '/ipfs/**',
          search: '',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3000',
          pathname: '/images/**',
          search: '',
        },
      ],
    },
};
  

export default withNextIntl(nextConfig);