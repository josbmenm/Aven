import createAppContainer from '../navigation-native/createAppContainer';
import createStackNavigator from '../navigation-stack/navigators/createStackNavigator';
import AppRoutes from '../todo-app/AppRoutes';

const AppNavigator = createStackNavigator(
  { ...AppRoutes },
  { headerMode: 'none' }
);

const AppNav = createAppContainer(AppNavigator);

export default AppNav;
