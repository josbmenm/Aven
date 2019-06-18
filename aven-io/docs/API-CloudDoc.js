import React from 'react';
import {
  Title,
  Body,
  Page,
  Section,
  Link,
  SubSection,
  Snippet,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - Cloud Doc</Title>

      <Body>
        Cloud docs are named client-side references to data. They support
        transactions and provide high-level functionality for observing and
        mutating data on the client, which will by syncronized to the upstream{' '}
        <Link routeName="Spec-Source">source</Link>. Each doc lives in the
        domain specified by the cloud client.
      </Body>
      <Section title="Usage">
        <Body>
          Client-side docs are retrieved from the{' '}
          <Link routeName="API-CloudClient">cloud client</Link>. For example:
        </Body>
        <Snippet
          code={`
import createCloudClient from "@aven-cloud/cloud/createCloudClient";

const cloud = createCloudClient({ source });
const doc = cloud.get("MyDoc");
`}
        />
        <Body>From there, data can be saved:</Body>
        <Snippet
          code={`
await doc.put({ my: 'data' });

// now the new data will be available with doc.getValue()
`}
        />
        <Body>
          Those observing the same doc can see the data as it changes:
        </Body>
        <Snippet
          code={`
doc.observeValue.subscribe({
  next: value => {
    console.log("value here will be {my: 'data'}");
  }
});
`}
        />
        <SubSection title="Doc Children">
          <Body>
            Docs can have children which are accessed with a slash in the name,
            or by calling ".get" on the parent doc:
          </Body>
          <Snippet
            code={`
const parent = cloud.get('MyDoc');

const child = cloud.get('MyDoc/Details');

// which is equivalent to:
const child = parent.get('Details');
`}
          />
          <Body>
            Children documents are deleted when the parent is deleted.
            Permissions applied to the parent affect the child as well. Of
            course children can be arbitrarily deep.
          </Body>
        </SubSection>
      </Section>

      <Section title="Properties/methods">
        <SubSection title="isConnected">
          <Body>
            A <Link routeName="ObservableUsage">behavior subject</Link> of a
            boolean regarding the connectivity of the doc. Will be true if the
            current doc's value is syncronized to the data source, otherwise
            false.
          </Body>
        </SubSection>
        <SubSection title="observe">
          <Body>
            A <Link routeName="ObservableUsage">behavior subject</Link> of the
            local doc's state, including the fetch time, most recent put time,
            and current id.
          </Body>
        </SubSection>
        <SubSection title="observeValue">
          <Body>
            A <Link routeName="ObservableUsage">behavior subject</Link> of the
            doc's value, or undefined until the value is known. This observed
            value will be the same as `doc.getBlock().getValue()` or
            `doc.getValue()`
          </Body>
        </SubSection>
        <SubSection title="getId">
          <Body>
            Returns the id string of the current block of data. Should be
            undefined if the id is not yet known and null if the id is known to
            be empty.
          </Body>
        </SubSection>
        <SubSection title="getValue()">
          <Body>
            Syncronously retrieve the current value of the doc, or `undefined`
            if not loaded.
          </Body>
        </SubSection>
        <SubSection title="async fetch()">
          <Body>
            Command a fetch of the value of the doc from the data source,
            ensuring the id is up to date (although the value may not be
            fetched)
          </Body>
        </SubSection>
        <SubSection title="async loadValue()">
          <Body>
            Will make sure the current ID is fetched and the value of the
            corresponding block has been fetched. If the id is not known, the
            value and the ID will be fetched from the data source
            simultaneously.
          </Body>
          <Body>
            {`Returns an object with { value, id } of the current block`}
          </Body>
        </SubSection>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - Cloud Doc',
};
DocPage.path = 'api-cloud-doc';

export default DocPage;
