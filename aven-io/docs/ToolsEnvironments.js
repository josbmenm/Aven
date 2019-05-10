import React from 'react';
import {
  Title,
  Body,
  Page,
  List,
  ListItem,
  Section,
  SubSection,
  Snippet,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Tooling and Environments</Title>
      <Body>
        The Aven monorepo uses a bunch of half-baked tooling to develop against
        several platforms at once, managing deploys, and publishing to npm.{' '}
      </Body>
      <Body>
        We need a JS development environment that allows us to do the following
        *within one repo*:
      </Body>

      <List>
        <ListItem>
          Build apps that are packaged with different bundlers. Eg. Metro for
          React Native and Webpack/Razzle for Web/SSR, respectively.
        </ListItem>
        <ListItem>Publish sub-packages to NPM</ListItem>
        <ListItem>Configurable deployment for CI</ListItem>
        <ListItem>
          Enable private repos that extend the open source monorepo.
        </ListItem>
      </List>
      <Body>
        Aven Tools, like Aven itself, is unabashedly opinionated. But it needs
        significant improvements in order to meet its goals, and contributions
        are especially wanted in this area. This document attempts to describe
        the current state of the tooling, but we have a long way to go on
        quality and documentation. Please jump in the issues!
      </Body>
      <Body>Aven Tools is an incomplete attempt to accomplish these goals</Body>
      <Section title="Concepts">
        <SubSection title="Packages/Apps">
          <Body>
            All packages are folders that live in the top-level directory of the
            repo. Apps are a special type of package.
          </Body>
          <Body>
            Packages are configured with an "aven" field under the package.json.
          </Body>
          <Body>
            Currently, every package needs to explicitly refer to the
            dependencies on other packages in the repo (local packages), as well
            as the packages from the main package file.
          </Body>
        </SubSection>
        <SubSection title="Package Configuration">
          <Body>Every sub-package is required to have an "aven" field</Body>
        </SubSection>
        <SubSection title="Environment">
          <Body>
            An environment is a specification of a way to run an app. The
            following environments are currently in the repo:
          </Body>
          <List>
            <ListItem>
              web - Built upon Razzle, (built upon Webpack), enables web with
              SSR
            </ListItem>
            <ListItem>
              reactnative - React native environment with Metro
            </ListItem>
            <ListItem>
              expo - A react native environment with a bunch of addditional
              built-ins
            </ListItem>
            <ListItem>dom - A react-native-dom environment</ListItem>
          </List>
          <Body>
            Because AvenTools has suffered from a bit of neglect, there are two
            APIs for defining an environment, and two mechanisms which you can
            use to run one.
          </Body>
        </SubSection>
      </Section>
      <Section title="API">
        <SubSection title="Start">
          <Snippet code="yarn start app-name" />
          <Body>Will start the app in your repo named app-name</Body>
        </SubSection>
        <SubSection title="Build">
          <Snippet code="yarn build app-name" />
          <Body>Will build the app in your repo named app-name</Body>
        </SubSection>
        <SubSection title="Publish">
          <Snippet code="yarn publish package-name" />
          <Body>
            Will publish the package in your repo named package-name to npm
          </Body>
        </SubSection>
        <SubSection title="Deploy">
          <Snippet code="yarn start app-name" />
          <Body>Will run the deploy script of the environment</Body>
        </SubSection>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Aven Docs Home',
};
DocPage.path = '';

export default DocPage;
