/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

if (!__DEV__) {
    console.log = () => { };
    console.info = () => { };
    console.warn = () => { };
    console.error = () => { };
}

const Root = () => (
    <Provider store={store}>
        <App />
    </Provider>

)

AppRegistry.registerComponent(appName, () =>Root);
