import React from 'react';
import TextRow from './TextRow';
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
      <TextRow
        text={`Native v${updateMetadata.appVersion} App ${
          updateMetadata.label
        }`}
      />
    )
  );
}
