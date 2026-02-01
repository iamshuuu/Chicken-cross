const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs', 'mjs');
config.resolver.assetExts.push('obj', 'png', 'jpg', 'mtl'); // Allow 3D files

module.exports = config;