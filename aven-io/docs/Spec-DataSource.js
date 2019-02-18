import React from 'react';
import {
  Title,
  Body,
  Page,
  Section,
  SubSection,
  List,
  ListItem,
  Snippet,
  Bold,
  Link,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Spec - DataSource</Title>
      <Body>
        Data Sources are used as a generic interface for reading, observing, and
        saving data. It is usually backed by a database like PostgreSQL or the
        file system. Data sources are often made from other Data Sources- for
        example the client will use a network Data Source which connects to a
        Data Source on the server.
      </Body>
      <Section title="Data Source Properties/Methods">
        <Body>A data source is any object with the following properties:</Body>
        <List>
          <ListItem>
            <Bold>isConnected</Bold> - an{' '}
            <Link routeName="ObservableUsage">observable behavior subject</Link>{' '}
            of a boolean that represents connectivity to the upstream data
            source. May falter due to network issues, may be false during
            startup, and should be false after closing.
          </ListItem>
          <ListItem>
            <Bold>close</Bold> - function for you to call when done using the
            data source. It will release resources such as network connections
            or memory.
          </ListItem>
          <ListItem>
            <Bold>observeDoc</Bold> - function that returns an{' '}
            <Link routeName="ObservableUsage">observable behavior subject</Link>{' '}
            of a doc.
          </ListItem>
          <ListItem>
            <Bold>dispatch</Bold> - async function where actions can be passed,
            and a JSON response will be returned
          </ListItem>
          <ListItem>
            <Bold>id</Bold> - data source id string
          </ListItem>
        </List>
      </Section>
      <Section title="Dispatch Actions">
        <Body>
          The following actions can all be dispatched asyncronously with the
          `dataSource.dispatch` function.
        </Body>
        <Snippet
          code={`
const result = await dataSource.dispatch({
  type: 'GetStatus',
});
// result may be { isConnected: true }
`}
        />
        <SubSection title="PutDoc">
          <Body>Set a doc's ID</Body>
          <Snippet
            code={`
const result = await dataSource.dispatch({
  type: 'GetStatus',
});
// result may be { isConnected: true }
`}
          />
        </SubSection>
        <SubSection title="PutDocValue">
          <Body>Upload a block and set a doc to the new block ID</Body>
        </SubSection>
        <SubSection title="PutTransactionValue">
          <Body>
            Put a new block that refers to the ID of the previous value.
          </Body>
        </SubSection>
        <SubSection title="PostDoc">
          <Body>Create a child doc with new name</Body>
        </SubSection>
        <SubSection title="GetBlock">
          <Body>Get a chunk of data</Body>
        </SubSection>
        <SubSection title="GetDoc">
          <Body>Get the current ID of the doc</Body>
        </SubSection>
        <SubSection title="GetDocValue">
          <Body>Get the value of the current block of a doc</Body>
        </SubSection>
        <SubSection title="GetStatus">
          <Body>
            Get an object describing the connection status and public
            configuration of a data source.
          </Body>
        </SubSection>
        <SubSection title="ListDomains">
          <Body>List the available domains</Body>
        </SubSection>
        <SubSection title="ListDocs">
          <Body>
            List doc names, or specify a parent name to list children doc names
          </Body>
        </SubSection>
        <SubSection title="DestroyDoc">
          <Body>Destroy a doc and children docs</Body>
        </SubSection>
        <SubSection title="CollectGarbage">
          <Body>Clean up unreferenced blocks. Not yet implemented</Body>
        </SubSection>
        <SubSection title="MoveDoc">
          <Body>
            Rename a doc and children docs, retaining all values. Destination
            name must be available
          </Body>
          <Body>
            Complex deep moves like a>a/b/c should be supported, but is not
            covered in tests yet
          </Body>
        </SubSection>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - DataSource',
};
DocPage.path = 'spec-data-source';

export default DocPage;
