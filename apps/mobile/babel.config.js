module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@env': './src/lib/env.js',
            'convex/_generated': '../../node_modules/@crewsec/convex/convex/_generated',
            'better-auth/react':
              './node_modules/better-auth/dist/client/react/index.cjs',
            'better-auth/client/plugins':
              './node_modules/better-auth/dist/client/plugins/index.cjs',
            '@better-auth/expo/client':
              './node_modules/@better-auth/expo/dist/client.cjs',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
