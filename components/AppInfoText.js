import React from 'react';
import { Text } from 'react-native';
import codePush from 'react-native-code-push';

export function useAppInfoText() {
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
  if (!updateMetadata) {
    return null;
  }
  return `Native v${updateMetadata.appVersion} App ${updateMetadata.label}`;
}

export default function AppInfoText() {
  const appInfoText = useAppInfoText();
  return appInfoText && <Text>{appInfoText}</Text>;
}
