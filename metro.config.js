const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    debug: {
    // Set the debugger type to React DevTools
    type: 'chrome',
    // Specify the name of the debugger
    name: 'React DevTools',
  },

};


module.exports = mergeConfig(getDefaultConfig(__dirname), config);
