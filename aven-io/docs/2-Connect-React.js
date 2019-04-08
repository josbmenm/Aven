import React from 'react';
import { Title, Body, Page, Snippet, SubSection } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Tutorial 2 - Connect Cloud to React</Title>
      <Body>
        Now that we have a source set up, we can start to wire up our React app.
      </Body>
      <SubSection title="Client Provider">
        <Body>
          You can use the following utility container to connect a network
          source, create a client, and provide the client as CloudContext:
        </Body>
        <Snippet
          code={`<NetworkCloudProvider
  authority="localhost:3000"
  useSSL={false}
  domain="todo.aven.io"
>
  <App />
</NetworkCloudProvider>
`}
        />
        <Body>
          Within your app, you can use the Cloud context with the following
          hook:
        </Body>
        <Snippet
          code={`const cloud = useCloud();
// Is the same as:
const cloud = React.useContext(CloudContext);
`}
        />
        <Body>Now, you can use the cloud client to write data:</Body>
        <Snippet
          code={`const messageDoc = cloud.get('Message');
await messageDoc.put('Hello World');`}
        />
      </SubSection>
      <SubSection title="useCloudValue hook">
        <Body>To read a doc, you can `useCloudValue`</Body>
        <Snippet
          code={`function MessageView() {
  const currentMessage = useCloudValue('Message');
  return <Text>{currentMessage}</Text>;
}`}
        />
        <Body>The above is a shortcut for the following:</Body>
        <Snippet
          code={`function MessageView() {
  const cloud = useCloud();
  const messageDoc = cloud.get('Message');
  const currentMessage = useCloudValue(messageDoc);
  return <Text>{currentMessage}</Text>;
}`}
        />
        <Body>Which in turn, is a shortcut for:</Body>
        <Snippet
          code={`// useCloud grabs the provided cloud client from context.
// The provider had created the client as such:
const cloud = createCloudClient({...});

function MessageView() {
  const messageDoc = cloud.get('Message');
  const currentMessage = useObservable(messageDoc.observeValue);
  return <Text>{currentMessage}</Text>;
}
`}
        />
        <Body>
          Blocks can also be accessed with `getCloudValue`. This is a chunk of
          data associated with the "message" doc. ("messageBlockId" is actually
          a checksum)
        </Body>
        <Snippet
          code={`function MyMessage() {
  const currentMessage = useCloudValue('Message#messageBlockId');
  return <Text>{currentMessage}</Text>;
}
// The above is a shortcut for the following:
function MyMessage() {
  const cloud = useCloud();
  const messageDoc = cloud.get('message');
  const messageBlock = messageDoc.getBlock('messageBlockId')
  const currentMessage = useCloudValue(messageBlock);
  return <Text>{currentMessage}</Text>;
}
`}
        />
      </SubSection>

      <SubSection title="useCloudState hook">
        <Body>
          Much like React's `useState` hook, you can `useCloudState` to save and
          retrieve state from the client.
        </Body>
        <Snippet
          code={`function MyMessage() {
  const [message, setMessage] = useCloudState('Message');
  return <Text>{currentMessage}</Text>;
}
// The above is a shortcut for the following:
function MyMessage() {
  const cloud = useCloud();
  const messageDoc = cloud.get('message');
  const messageBlock = messageDoc.getBlock('messageBlockId')
  const currentMessage = useCloudValue(messageBlock);
  return <Text>{currentMessage}</Text>;
}
`}
        />
      </SubSection>
      <SubSection title="useCloudReducer hook">
        <Body>
          Inspired by the API of React's `useReducer` hook, `useCloudReducer`
          allows you to run a local reducer and also defer the reducing to the
          server for the initial load.
        </Body>
        <Snippet
          code={`useCloudReducer(
    'TaskActions', // name of the state doc, which refers to the block chain of actions
    'TaskReducer', // name of the reducer, for delegation to the server
    (state, action) => { return newState }, // reducer function
    [] // initial state
  );`}
        />
        <Body>
          Note! This API may change, because it currently is somewhat clumsy.
          There is also a mechanism to upload a lambda function (such as a
          reducer) as a doc, such that the server can handle this functionality
          without static configuration.
        </Body>
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: '2: Connect to React',
};
DocPage.path = 'intro-connect-react';

export default DocPage;
