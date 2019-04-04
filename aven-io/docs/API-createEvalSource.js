import React from 'react';
import { Title, Body, Page, Link, SubSection, Snippet } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - createEvalSource</Title>
      <Body>
        A client that will be used on the server side to evaluate functions
        against the database.
      </Body>
      <Snippet
        code={`
import createEvalSource from "@aven-cloud/cloud/createEvalSource";

const source = createEvalSource({
  source: storageSource,
  domain: 'todo.aven.io',
  evalDocs: {
    TaskReducer: createReducerLambda('TaskReducer', TaskReducer, []),
  },
});`}
      />
      <Body>
        The resulting source conforms to{' '}
        <Link routeName="Spec-Source">the source API</Link>.
      </Body>
      <SubSection title="Evaluated Docs">
        <Body>
          Now you can access special docs that only exist downstream from the
          eval source. In this example, we want to pass the 'TodoActions' doc as
          the argument of our new 'TodoReducer' cloud function.
        </Body>
        <Snippet
          code={`

const result = await source.dispatch({
  type: 'GetDocValue',
  domain: 'todo.aven.io',
  name: 'TodoActions^TodoReducer'
})

`}
        />
        <Body>
          You can also subscribe to the results from the client by accessing
          `cloud.get('TodoActions^TodoReducer')`
        </Body>
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - createEvalSource',
};
DocPage.path = 'api-create-eval-source';

export default DocPage;
