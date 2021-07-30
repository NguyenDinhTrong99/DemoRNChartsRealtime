/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import CandleScreen from './CandleScreen'
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => CandleScreen);
