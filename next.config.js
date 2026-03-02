const path = require('path')

module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  optimizeFonts: false,
  experimental: {
    // https://nextjs.org/docs/messages/swc-disabled
    forceSwcTransforms: true,
    scrollRestoration: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'css/')],
  },
};
