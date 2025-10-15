import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore problematic files for server-side rendering
      config.externals.push('bcrypt');
      config.externals.push('@mapbox/node-pre-gyp');
    } else {
      // Pour le client, ne pas essayer de bundler bcrypt et modules Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
        path: false,
        os: false,
        util: false,
        stream: false,
        buffer: false,
        events: false,
      };

      // Ignorer complètement bcrypt côté client
      config.externals = {
        ...config.externals,
        bcrypt: 'bcrypt',
        '@mapbox/node-pre-gyp': '@mapbox/node-pre-gyp',
      };
    }
    
    // Ignore SQL and HTML files in node_modules
    config.module.rules.push({
      test: /\.(html|sql)$/,
      use: 'ignore-loader',
    });

    // Ignorer complètement le dossier @mapbox/node-pre-gyp
    config.module.rules.push({
      test: /node_modules\/@mapbox\/node-pre-gyp/,
      use: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;
