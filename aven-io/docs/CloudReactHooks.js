import React from 'react';
import { Title, Body, Page, Section, Snippet, Link } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Cloud React Hooks</Title>
      <Section title="useCloud()">
        <Body>
          Access the currently-scoped{' '}
          <Link routeName="API-createCloudClient">cloud client</Link> from the
          React context.
        </Body>
        <Snippet
          code={`function App() {
  const cloud = useCloud('msg');
  const msg = cloud.get('msg');
  useEffect(() => {
    msg.put('Hello, world!');
  });
      `}
        />
      </Section>
      <Section title="useCloudValue(docName)">
        <Body>
          Subscribe the component to a document or the value of a block.
          Re-render if the value ever changes.
        </Body>
        <Snippet
          code={`function DisplayMessage() {
  const message = useCloudValue('msg');
  return <Text>{message}</Text>;
}
      `}
        />
        <Body>
          In the above example, "message" will be undefined while the doc loads.
          Once loaded, it may say "hello world", as defined by the "msg" doc.
          When it changes, the component will re-render.
        </Body>
      </Section>
      <Section title="useCloudValue(doc)">
        <Body>
          If you have access to the{' '}
          <Link routeName="API-CloudDoc">client doc object</Link>, you can pass
          it directly:
        </Body>
        <Snippet
          code={`function DisplayMessage() {
  const cloud = useCloud();
  const messageDoc = cloud.get('msg');
  const message = useCloudValue(messageDoc);
  return <Text>{message}</Text>;
}
      `}
        />
      </Section>

      <Section title="useCloudValue(block)">
        <Body>
          You can also pass a{' '}
          <Link routeName="API-CloudBlock">client block</Link>, if you want to
          observe an immutable value. This is handy because a block value may
          not be loaded yet, and useCloudValue will trigger loading and cause
          your component to re-render once it loads.
        </Body>
        <Snippet
          code={`function DisplayMessage({ versionBlockId }) {
  const cloud = useCloud();
  const messageDoc = cloud.get('msg');
  const messageAtVersion = messageDoc.getBlock(versionBlockId);
  const message = useCloudValue(messageAtVersion);
  return <Text>{message}</Text>;
}
      `}
        />
      </Section>

      <Section title="useCloudState" id="useCloudState">
        <Body>
          Like React's "useState" hook, except the state is saved on the source.
        </Body>
        <Snippet
          code={`const [state, setState] = useCloudState('StateName', {});`}
        />
        <Body>Provide the doc name and initial state to `useCloudState`</Body>
      </Section>
      <Section title="useCloudReducer" id="useCloudReducer">
        <Body>
          Like React's "useReducer" hook, except the reducer may also run on the
          back-end.
        </Body>
        <Snippet
          code={`const [tasks, dispatch] = useCloudReducer(
  'TaskActions', // Name of the action chain doc
  'TaskReducer', // Name of the reducer (which should match on the server)
  TaskReducer, // regular reducer
  [] // initial state
);`}
        />
        <Body>
          To configure the server, you currently need to set up an eval source
          with the same reducer:
        </Body>
        <Snippet
          code={`
          const source = createEvalSource({
            source: storageSource,
            domain: 'todo.aven.io',
            evalDocs: {
              TaskReducer: createReducerLambda('TaskReducer', TaskReducer, []),
            },
          });`}
        />
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Cloud React Hooks',
};
DocPage.path = 'cloud-react-hooks';

export default DocPage;
