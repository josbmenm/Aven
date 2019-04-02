import React from 'react';
import Admin from '../aven-admin/Admin';
import createSwitchNavigator from '../navigation-core/navigators/createSwitchNavigator';
import AppRoutes from '../todo-app/AppRoutes';

let authority = '';
let useSSL = true;
if (global.window) {
  authority = global.window.location.host;
  useSSL = global.window.location.protocol.indexOf('s') !== -1;
}
function AdminScreen(props) {
  return (
    <Admin
      {...props}
      defaultSession={{
        authority,
        useSSL,
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
