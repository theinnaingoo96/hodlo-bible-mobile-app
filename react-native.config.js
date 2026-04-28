// react-native.config.js
module.exports = {
    project: {
        ios: {},
        android: {}
    },
    assets: [
        './src/assets/fonts/',
        './src/assets/audio/',
        './node_modules/react-native-vector-icons/Fonts'
    ],
    dependencies: {
        '@react-navigation/bottom-tabs': {
            platforms: {
                android: null, // disable Android platform auto linking
            },
        },
        '@react-navigation/native': {
            platforms: {
                android: null, // disable Android platform auto linking
            },
        },
        '@react-navigation/stack': {
            platforms: {
                android: null, // disable Android platform auto linking
            },
        },
    },
}