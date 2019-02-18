import React from 'react';
import { Title, Body, Page, Link, Section, SubSection } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Observables</Title>
      <Body>
        Aven Cloud uses RxJS under the hood, and enables you to use a standard
        pattern for observing data in your database.
      </Body>
      <Body>
        Cloud values expose data through{' '}
        <Link url="http://reactivex.io/rxjs/manual/overview.html#behaviorsubject">
          RxJS Observables
        </Link>{' '}
        such as .observeValue. These are special because they cause the doc to
        fetch and observe the required data, until the subscription is removed.
      </Body>
      <SubSection title="Behavior Subjects">
        <Body>
          Behavior subjects are RxJS observables that also have the current
          value available by calling `getValue()` on it.
        </Body>
        <Body>
          For example, to see if a current doc is syncronized, you can check if
          `doc.isConnected.getValue()` is true.
        </Body>
        <Body>
          Because behavior subjects are observables, you can subscribe manually
          via `.subscribe(`
        </Body>
      </SubSection>
      <Section title="Manual Subscription">
        <Body>Coming Soon..</Body>
      </Section>
      <Section title="React HOC">
        <Body>Coming Soon..</Body>
      </Section>
      <Section title="React Render Prop Component">
        <Body>Coming Soon..</Body>
      </Section>
      <Section title="React useObservable hook">
        <Body>Coming Soon..</Body>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Observables',
};
DocPage.path = 'observable-usage';

export default DocPage;
