import React from 'react';

import Admin from '../aven-admin/Admin';

function App({ navigation }) {
  return (
    <Admin
      navigation={navigation}
      defaultSession={{
        authority: 'localhost:8830',
        domain: 'onofood.co',
      }}
    />
  );
}

App.router = Admin.router;

export default App;
