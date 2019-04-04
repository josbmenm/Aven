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
      <Title>Spec - Source</Title>
      <Body>
        Sources are used as a generic interface for reading, observing, and
        saving data. It is usually backed by a database like PostgreSQL or the
        file system. Sources are often made from other Sources- for example the
        client will use a network Source which connects to a Source on the
        server.
      </Body>
      <Section title="Source Properties/Methods">
        <Body>A Source is any object with the following properties:</Body>
        <List>
          <ListItem>
            <Bold>isConnected</Bold> - an{' '}
            <Link routeName="ObservableUsage">observable behavior subject</Link>{' '}
            of a boolean that represents connectivity to the upstream Source.
            May falter due to network issues, may be false during startup, and
            should be false after closing.
          </ListItem>
          <ListItem>
            <Bold>close</Bold> - function for you to call when done using the
            source. It will release resources such as network connections or
            memory.
          </ListItem>
          <ListItem>
            <Bold>observeDoc</Bold> - function that returns an{' '}
            <Link routeName="ObservableUsage">observable behavior subject</Link>{' '}
            of a doc.
          </ListItem>
          <ListItem>
            <Bold>observeDocChildren</Bold> - function that returns an{' '}
            <Link routeName="ObservableUsage">observable subject</Link> of
            add/remove events to the list of children.
          </ListItem>
          <ListItem>
            <Bold>dispatch</Bold> - async function where actions can be passed,
            and a JSON response will be returned
          </ListItem>
          <ListItem>
            <Bold>id</Bold> - source id string
          </ListItem>
        </List>
      </Section>
      <Section title="Concept - Docs and Blocks" id="DocsBlocks">
        <Body>
          <Bold>Blocks</Bold> are immutable chunks of JSON data. All data is
          saved in blocks, which are identified by a checksum so that any party
          holding the data can be sure they agree, without transmiting the
          actual data.
        </Body>
        <Body>
          Blocks can contain references to other blocks by their id. There is a
          special "BlockReference" format for this. Blocks can be uploaded in
          bulk by providing values alongside the references. The source is
          responsible for recursively finding references, uploading their
          values, and embedding the Block id in the BlockReference object
          instead of the value.
        </Body>
        <Body>
          <Bold>Docs</Bold> are named, lightweight references to Blocks. They
          can be created with a name via PutDoc(Value), and they can be created
          with an automatically unique name via PostDoc. They can renamed/moved
          with MoveDoc, and deleted with DestroyDoc.
        </Body>
        <Body>
          No Blocks are ever renamed or destroyed when working with Docs. They
          will be cleaned up with a garbage collection process, which is still a
          work in progress..
        </Body>
      </Section>
      <Section title="Concept - Domains">
        <Body>
          A Domain is a container for a set of Docs, (and, by reference, Blocks)
        </Body>
        <Body>All Doc actions should be provided by a domain.</Body>
      </Section>
      <Section title="Concept - Doc Heirarchy">
        <Body>
          Docs are all saved under the context of a domain, but each doc can
          have children. A Doc named "person/profilePhoto", has a local name of
          "profilePhoto" and a parent Doc named "person".
        </Body>
      </Section>

      <Section title="Concept - Doc Listing">
        <Body>
          To know all the current Docs in a domain, the process is a bit
          intricate:
        </Body>
        <List>
          <ListItem>
            Start by subscribing to the list of docs via observeDocChildren
          </ListItem>
          <ListItem>Call ListDocs to see the names of child docs.</ListItem>
          <ListItem>
            If ListDocs returns hasMore, repeatedly call ListDocs again with
            afterName to get the full list.
          </ListItem>
          <ListItem>
            Add or remove any listed Docs according to the events from
            observeDocChildren
          </ListItem>
          <ListItem>
            At this point, you may know the full list of top-level Docs for a
            given Domain, but there might be children Docs. You can recursively
            repeat the above process to see the entire doc heirarchy of a
            Domain.
          </ListItem>
        </List>
      </Section>

      <Section title="API - Dispatch Actions">
        <Body>
          The following actions can all be dispatched asyncronously with the
          `source.dispatch` function.
        </Body>
        <Snippet
          code={`
const result = await source.dispatch({
  type: 'GetStatus',
});
// result may be { isConnected: true }
`}
        />
        <SubSection title="PutDoc">
          <Body>
            Set a Doc's current Block id reference. The specified Block must
            already be known by the Source for PutDoc to succeed
          </Body>
          <Snippet
            code={`
const result = await source.dispatch({
  type: 'PutDoc',
  domain: 'main',
  name: 'TodoEvents',
  id: 'xyz', 
});
// no return value. If the action succeeds, the ID of "main" has been set.
`}
          />
          <Body>
            This is a low-level API for setting the reference of a doc. If you
            want transaction safety, use PutDocValue or PutTransactionValue
            instead.
          </Body>
        </SubSection>
        <SubSection title="PutBlock">
          <Body>Create a new Block, saving a chunk of JSON in the Source.</Body>
          <Body>
            This is a low-level API for saving data to the Source. It is
            disallowed in a Protected Source because the ownership of all data
            should known. Generally you should use PutDocValue to write data.
          </Body>
          <Body>
            A block is a chunk of data that is not necessarily associated with
            any single domain or doc. As such, a garbage collection mechanism
            should be deleting unreferenced blocks beyond a certain age. So, you
            should generally not expect a block to stick around inside a source
            unless you quickly refer a doc to it.
          </Body>
          <Snippet
            code={`
const result = await source.dispatch({
  type: 'PutBlock',
  value: { foo: 'bar' }
});
// returns { id: 'abc' }, where abc is the id(checksum) of the saved Block
`}
          />
        </SubSection>
        <SubSection title="PutDocValue">
          <Body>
            This is a primary mechanism for writing data to the Source.
            Effectively it performs a PutBlock for a chunk of data, then does a
            PutDoc to refer to the new Block.
          </Body>
          <Body>
            You can also upload embedded blocks that will be de-referenced by
            the source and uploaded seperately:
          </Body>
          <Snippet
            code={`
const result = await source.dispatch({
  type: 'PutDocValue',
  domain: 'main',
  name: 'People',
  value: {
    personA: { type: 'BlockReference', value: { firstName: 'A' }},
    personB: { type: 'BlockReference', value: { firstName: 'B' }},
  }
});

// The following blocks will now be uploaded:
// Block#A = { firstName: 'A' }
// Block#B = { firstName: 'B' }
// Block#C = {
//   personA: { type: 'BlockReference', id: 'Block#A' },
//   personB: { type: 'BlockReference', id: 'Block#B' },
// }

// And, the "People" doc has been updated to point to Block#C 
          `}
          />
          <Body>
            PutDocValue is also able to enforce the order of doc writes, by
            uploading a special block that refers to the doc's currently active
            block:
          </Body>
          <Snippet
            code={`
const result = await source.dispatch({
  type: 'PutDocValue',
  domain: 'main',
  name: 'Message',
  value: {
    type: 'TransactionValue',
    on: { type: 'BlockReference', id: '#lastBlockId' },
    value: "NewValue",
  }
});

// The above will only succeed if the "Message" doc currently refers to the #lastBlockId block
          `}
          />
        </SubSection>
        <SubSection title="PutTransactionValue">
          <Body>
            This action is similar to PutDocValue, because it saves a new Block
            and changes a Doc to refer to it as the current value. But in this
            case, the actual saved value is a "TransactionValue", whose ID
            refers to the previous active block.
          </Body>
          <Snippet
            code={`
// Pretend the 'TodoEvents' doc currently refers to the #lastAction block..

const result = await source.dispatch({
  type: 'PutTransactionValue',
  domain: 'main',
  name: 'TodoEvents',
  value: { type: 'TaskCompleted', id: 2 }
});

// A block like this will be uploaded and referred to by "TodoEvents":
// Block#newAction = {
//   type: 'TransactionValue',
//   on: { type: 'BlockReference', id: '#lastAction' },
//   value: { type: 'TaskCompleted', id: 2 }
// }

// The result may be { id: '#newAction' }
`}
          />
          <Body>
            This action is reccomended for clients who want to defer transaction
            merge to the server. Clients who want to perform manual merges on
            the data can write "TransactionValue" objects to "PutDocValue"
          </Body>
        </SubSection>
        <SubSection title="PostDoc">
          <Body>Create a child doc with a new unique name</Body>
        </SubSection>
        <SubSection title="GetBlock">
          <Body>Get a chunk of data</Body>
        </SubSection>
        <SubSection title="GetDoc">
          <Body>
            Get the current ID of the doc. This is a lightweight and low-level
            API that allows you to check the value of a Doc without bothering to
            get the value.
          </Body>
        </SubSection>
        <SubSection title="GetDocValue">
          <Body>
            Get the current id of a Doc, and fetches the corresponding Block
            value as well.
          </Body>
        </SubSection>
        <SubSection title="GetStatus">
          <Body>
            Get an object describing the connection status and public
            configuration of a source.
          </Body>
        </SubSection>
        <SubSection title="ListDomains">
          <Body>List the available domains</Body>
        </SubSection>
        <SubSection title="ListDocs">
          <Body>
            List doc names, or specify a parent name to list children doc names.
            There is no recursive listing.
          </Body>
        </SubSection>
        <SubSection title="DestroyDoc">
          <Body>Destroy a doc and any children docs</Body>
        </SubSection>
        <SubSection title="DestroyBlock">
          <Body>Request the Source to forget about a Block.</Body>
        </SubSection>

        <SubSection title="MoveDoc">
          <Body>
            Rename a doc and children docs, retaining all values. Destination
            name must be available
          </Body>
          <Body>
            Children of a moved doc will follow. If "a" moves to "x/y", then
            "a/b" would get moved to "x/y/b".
          </Body>
          <Body>
            Note: Complex deep moves like a>a/b/c should ideally be supported,
            but is not covered in tests yet, and is probably broken.
          </Body>
        </SubSection>
        <SubSection title="CollectGarbage">
          <Body>Clean up unreferenced blocks? Not yet implemented..</Body>
        </SubSection>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - Source',
};
DocPage.path = 'spec-source';

export default DocPage;
