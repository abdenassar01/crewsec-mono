/* eslint-disable no-undef */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enableSymlinks = true;
config.watcher.additionalExts.push('cjs');

module.exports = withNativewind(config);
