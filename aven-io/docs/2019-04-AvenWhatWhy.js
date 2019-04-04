import React from 'react';
import {
  Title,
  Body,
  Page,
  Section,
  SubSection,
  Bold,
  Link,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Aven: What? Why?</Title>
      <Body>
        Today's launch is incredibly important to me. My mission, and Aven's
        mission, is to empower the world to build great apps and websites.
      </Body>
      <Body>
        If we can lower the barrier of building software, we can inspire more
        people to build great things. To lower the barrier, we need to provide
        new developers with a complete solution for building apps- even if it's
        not perfect.
      </Body>
      <Body>
        In the world of software development, React has changed the game. As an
        overwhelmingly-popular web library, it allowed a massive community to
        flourish, with a broad set of published components and accompanying
        tools.
      </Body>
      <Body>
        But the mobile app-store platforms have taken the world by storm, and
        the lurking champion here is React Native. It is the strongest
        community-led framework that allows developers to simultaneously build
        for the web, Android, and iOS.
      </Body>
      <Body>
        Yet, React Native is known to be a highly incomplete solution. Every app
        still needs a solution for navigation. Every app needs to connect the
        React views to a source of data.
      </Body>
      <Body>
        We need a framework that embraces cross-platform React and attempts to
        provide the rest of the framework. It won't be perfect, and it won't be
        complete, but it will allow us to address the full complexity that
        modern app developers are faced with.
      </Body>
      <SubSection title="Aven : A Full-Stack App Framework">
        <Body>
          Encompassing several projects, Aven is a framework for building apps
          on every platform, starting with Web+iOS+Android. It is built upon
          React Native and React Native Web to provide the envronments and
          view/styling layer.
        </Body>
        <Body>
          The framework needs a navigation system that works on React Native and
          the web. As far as I know, that leaves React Navigation. (Of course I
          am biased, as one of the original authors of the project.)
        </Body>
        <Body>
          For the data handling and DB syncronization problem, of course we will
          go with the modular and widely-adopted community solution- wait...
          Actually, the React community has struggled for years to reach
          consensus on a data handling solution. Redux has been very popular,
          MobX still is. Nowadays GraphQL solutions like Apollo have gained in
          popularity. None of the solutions actually seem to help with the core
          problem of syncronizing state to a remote database.
        </Body>
        <Body>
          Many beginners would be smart to start out on Firebase or AWS AppSync.
          It allows them to get started in a matter of minutes, without writing
          a complicated GraphQL backend. But as a long-term solution,
          proprietary and expensive services from Google and Amazon are
          untenable.
        </Body>
        <Body>
          I wanted a data handling framework that was modular, flexible, and
          would allow easy re-use of logic from client to server. But I couldn't
          find what I was looking for, so I embarked on a sub-project for the
          Aven framework.
        </Body>
      </SubSection>
      <SubSection title="Aven Cloud : A Full-Stack Database Framework">
        <Body>
          Aven Cloud is a set of loosly-coupled modules that enable you to save
          data to an arbitrary database, and observe changes to the data. It
          includes a user-friendly client that allows your app to automatically
          observe the values in the database. The client supports authentication
          and offline writes, to ease the complexity for offline-friendly apps.
        </Body>
        <Body>
          Stay tuned to this blog for more detailed content on Aven Cloud in the
          coming weeks.
        </Body>
        <Body>
          This project was inspired in part by talks like "Turning the Database
          Inside Out" by Martin Kleppmann, and "The Mess We're In" by Joe
          Armstrong. It was also inspired in part by projects at Facebook such
          as TAO and the reactive programming language, "Skip".
        </Body>
        <Body>
          Hopefully this explains why today's launch of Aven Cloud is so
          meaningful to me. To get more people building great apps, we need a
          simple and complete framework- that's Aven. Today we sketch out a big
          missing chunk of that framework, to store and syncronize data- that's
          Aven Cloud.
        </Body>
      </SubSection>
      <Body>Sincerely,</Body>
      <Body>Eric Vicenti</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Aven, what? Why?',
};
DocPage.path = '2019-04-AvenWhatWhy';

export default DocPage;
