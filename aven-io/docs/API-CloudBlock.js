import React from 'react';
import {
  Title,
  Body,
  Page,
  Section,
  SubSection,
  Link,
  Snippet,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - Cloud Block</Title>
      <Body>
        Cloud blocks represent immutable values in the database. The value
        cannot be changed, but a cloud block may exist in the client before the
        data has been loaded. Blocks may also exist in the client before they
        have been published to the data source.
      </Body>
      <Section title="Usage">
        <Body>
          Client-side blocks should always be retrieved from a{' '}
          <Link routeName="API-CloudDoc">cloud doc</Link>, which in turn are
          retrieved by the <Link routeName="API-CloudClient">cloud client</Link>
          . For example:
        </Body>
        <Snippet
          code={`
import createCloudClient from "@aven-cloud/cloud/createCloudClient";

const cloud = createCloudClient({ source });
const doc = cloud.get("MyDocName");

const block = doc.getBlock(); // gets the current block referenced by the doc
`}
        />
        <Body>From a doc, there are multiple ways to access a block:</Body>
        <Snippet
          code={`
// gets the current block referenced by the doc
const block = doc.getBlock();

// gets a block from the doc, identified by id 
const block = doc.getBlock('somedatachecksum');

// gets the a block with a reference object
const blockRef = { type: 'BlockReference', id: 'somedatachecksum' };
const block = doc.getBlock(blockRef);
`}
        />
      </Section>
      <Section title="Properties/methods">
        <SubSection title="isConnected">
          <Body>
            A <Link routeName="ObservableUsage">behavior subject</Link> of a
            boolean regarding the connectivity of the block. Will be true if the
            block's value is now available, otherwise false.
          </Body>
        </SubSection>
        <SubSection title="observe">
          <Body>
            A <Link routeName="ObservableUsage">behavior subject</Link> of the
            block's state, including the fetch time, publish time, and currently
            known value.
          </Body>
        </SubSection>
        <SubSection title="observeValue">
          <Body>
            A <Link routeName="ObservableUsage">behavior subject</Link> of the
            block's value, or undefined until the value is known.
          </Body>
        </SubSection>
        <SubSection title="getId">
          <Body>
            Returns the unchangable id string of this block. A checksum of the
            JSON data.
          </Body>
        </SubSection>
        <SubSection title="getValue()">
          <Body>
            Retrieve the value of the block, or `undefined` if the block hasn't
            been loaded yet.
          </Body>
        </SubSection>
        <SubSection title="async fetch()">
          <Body>
            Command a fetch of the value of the block from the data source, if
            it has not already been fetched.
          </Body>
        </SubSection>
        <SubSection title="async fetchValue()">
          <Body>Same as `fetch()` for blocks.</Body>
        </SubSection>
        <SubSection title="async publish()">
          <Body>
            Todo! This method does not exist yet, but it should publish the doc
            to the data source if it has not already been published.
          </Body>
        </SubSection>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - Cloud Block',
};
DocPage.path = 'api-cloud-block';

export default DocPage;
