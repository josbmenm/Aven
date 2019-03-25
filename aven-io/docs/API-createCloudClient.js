import React from 'react';
import {
  Title,
  Body,
  Page,
  Snippet,
  SubSection,
  Link,
  List,
  ListItem,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - createCloudClient</Title>
      <Body>
        The cloud client is responsible for authentication/sessions, observing
        data from a Source, and optimistically updating it.
      </Body>
      <Body>Example usage:</Body>

      <Snippet
        code={`import createCloudClient from "@aven-cloud/cloud/createCloudClient";

const cloud = createCloudClient({
  source,
  domain: 'mydomain',
}); `}
      />
      <SubSection title="Options">
        <List>
          <ListItem>
            domain - the access domain of the data on the source
          </ListItem>
          <ListItem>
            source - the upstream <Link routeName="Spec-Source">Source</Link> to
            access data from
          </ListItem>
          <ListItem>
            initialSession - an auth session object that the client should start
            up with
          </ListItem>
          <ListItem>
            onSession - callback to be notified of session changes, so that it
            can be stored.
          </ListItem>
        </List>
      </SubSection>
      <SubSection title="Example with Session Saving">
        <Body>
          You may want to save the session if your client refreshes, so you
          won't need to log in every time. You'd do something like the
          following:
        </Body>
        <Snippet
          code={`
const initialSession = await getSession();
const cloud = createCloudClient({
  source,
  domain: 'mydomain',
  initialSession,
  onSession: session => saveSession(session)
}); `}
        />
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - createCloudClient',
};
DocPage.path = 'api-create-cloud-client';

export default DocPage;
