const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for sql and wasm files if needed
config.resolver.sourceExts.push('sql');

module.exports = config;
