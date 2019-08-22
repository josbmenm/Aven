import React from 'react';
import { Text } from 'react-native';
import codePush from 'react-native-code-push';

export default function AppInfoText() {
  let [updateMetadata, setUpdateMetadata] = React.useState(null);
  React.useEffect(() => {
    codePush
      .getUpdateMetadata()
      .then(m => {
        setUpdateMetadata(m);
      })
      .catch(err => {
        alert(err);
      });
    return () => {};
  }, []);
  return (
    (updateMetadata || null) && (
      <Text>{`Native v${updateMetadata.appVersion} App ${
        updateMetadata.label
      }`}</Text>
    )
  );
}
