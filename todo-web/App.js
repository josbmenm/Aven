import React from 'react';
import Admin from '../aven-admin/Admin';
import createSwitchNavigator from '../navigation-core/navigators/createSwitchNavigator';
import AppRoutes from '../todo-app/AppRoutes';

function AdminScreen(props) {
  return (
    <Admin
      {...props}
      defaultSession={{
        authority: 'localhost:3000',
        useSSL: false,
        domain: 'todo.aven.io',
      }}
    />
  );
}
AdminScreen.navigationOptions = Admin.navigationOptions;
AdminScreen.router = Admin.router;

const App = createSwitchNavigator({
  ...AppRoutes,
  Admin: AdminScreen,
});

export default App;
