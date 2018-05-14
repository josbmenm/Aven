import React from 'react';

import AppNavigator from '../App';
import { createNavigationContainer } from '../react-navigation-native-container';

const AppContainer = createNavigationContainer(AppNavigator);

const App = () => <AppContainer />;

export default App;
