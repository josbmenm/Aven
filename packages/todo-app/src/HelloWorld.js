import React from 'react';

import Screen from './components/Screen';
import Title from './components/Title';
import TextInput from './components/TextInput';

import useCloud from '../cloud-core/useCloud';
import useCloudValue from '../cloud-core/useCloudValue';

function SetMessageRow({ messageDoc }) {
  const [title, setTitle] = React.useState('');
  return (
    <TextInput
      value={title}
      onChangeText={setTitle}
      placeholder="Set message.."
      onSubmitEditing={() => {
        messageDoc.put(title);
        setTitle('');
      }}
    />
  );
}

function MessageTitle({ messageDoc }) {
  const message = useCloudValue(messageDoc);
  if (message === undefined) {
    return <Title>...</Title>;
  }
  return <Title>{message}</Title>;
}

export default function HelloWorld() {
  const cloud = useCloud();
  const messageDoc = cloud.get('Message');
  return (
    <Screen>
      <MessageTitle messageDoc={messageDoc} />
      <SetMessageRow messageDoc={messageDoc} />
    </Screen>
  );
}
