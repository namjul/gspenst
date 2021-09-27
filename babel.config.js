module.exports = {
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
  babelrcRoots: [
    // Keep the root as a root
    '.',

    // Also consider monorepo packages "root" and load their .babelrc.json files.
    './packages/*',
  ],
}
