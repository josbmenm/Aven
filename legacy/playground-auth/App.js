import React from 'react';

import Admin from '../admin/Admin';

function App({ navigation }) {
  return (
    <Admin
      navigation={navigation}
      defaultSession={{
        authority: 'localhost:3000',
        domain: 'example.aven.cloud',
      }}
    />
  );
}

App.router = Admin.router;

export default App;
