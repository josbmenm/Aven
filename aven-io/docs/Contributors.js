import React from 'react';
import { Title, Body, Page, SubSection, Snippet, Link } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Contributors</Title>
      <Body>
        There are a lot of ways to help! To get started, jump in the issues and
        attempt to fix something, or respond to people who have questions.
      </Body>
      <Body>
        You are also encouraged to create additional projects to compliment or
        compete with Aven Cloud components.
      </Body>
      <Body>
        Contributors are invited to read and take part in the philosophies{' '}
        <Link routeName="About">described in the About page</Link>
      </Body>

      <SubSection title="Discussion">
        <Body>
          Feel free to use{' '}
          <Link url="https://github.com/AvenCloud/Aven/issues">
            the GitHub issues
          </Link>{' '}
          as a discussion board for any aspect of the project. We may close
          inactive and unproductive discussions.
        </Body>
      </SubSection>
      <SubSection title="Filing Bugs">
        <Body>
          The best way to submit a bug issue is to write a failing test that
          demonstrates what behavior you expect to see. This will help clairify
          what you "expect()", and will be useful for us to debug the problem
          and prevent future regressions.
        </Body>
      </SubSection>
      <SubSection title="Getting Started - Run Docs">
        <Snippet
          code={`git clone Aven
cd Aven
yarn
yarn start aven-io`}
        />
      </SubSection>
      <SubSection title="Getting Started - Run Todo app">
        <Body>First, start the web version</Body>
        <Snippet
          code={`git clone Aven
cd Aven
yarn
yarn start todo-web`}
        />
        <Body>Simultaneously, start up the react native app..</Body>
        <Snippet
          code={`
yarn start todo-native`}
        />
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Contributors',
};
DocPage.path = 'contributors';

export default DocPage;
