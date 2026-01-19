/**
 * @format
 */

// Polyfill URL and URLSearchParams for React Native (must be imported first)
import 'react-native-url-polyfill/auto';

// Polyfill Symbol.asyncIterator for React Native (required for async iterables/streams)
import '@azure/core-asynciterator-polyfill';

// Polyfill TextEncoder and TextDecoder for React Native
import { TextEncoder, TextDecoder } from 'text-encoding';
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.TextEncoder === 'undefined') {
    globalThis.TextEncoder = TextEncoder;
  }
  if (typeof globalThis.TextDecoder === 'undefined') {
    globalThis.TextDecoder = TextDecoder;
  }
}

// Polyfill structuredClone for React Native
if (typeof global.structuredClone === 'undefined') {
  const structuredClonePolyfill = (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      // Fallback for circular references or non-serializable values
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          return obj.map(item => structuredClonePolyfill(item));
        }
        const cloned = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = structuredClonePolyfill(obj[key]);
          }
        }
        return cloned;
      }
      return obj;
    }
  };
  
  global.structuredClone = structuredClonePolyfill;
  if (typeof globalThis !== 'undefined') {
    globalThis.structuredClone = structuredClonePolyfill;
  }
}

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

const Root = () => (
    <Provider store={store}>
        <App />
    </Provider>

)

AppRegistry.registerComponent(appName, () =>Root);
