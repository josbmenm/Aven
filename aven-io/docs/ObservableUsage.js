import React from 'react';
import {
  Title,
  Body,
  Page,
  Link,
  Section,
  SubSection,
  Snippet,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Observables with Cloud and React</Title>
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
        observe the required data from the Source, until the subscription is
        removed.
      </Body>
      <SubSection title="Subjects">
        <Body>
          A Subject is a stream of events/updates that you can subscribe to.
          Unlike a bare observable, several subscribers can share the same
          stream of events.
        </Body>
        <Snippet
          code={`const message = new Subject();
message.subscribe(m => console.log(\`Hello \${m}\`));
message.subscribe(m => console.log(\`Goodbye \${m}\`));

message.next('World');

// Will log:
Hello World
Goodbye World
        `}
        />
      </SubSection>
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
        <Body>
          Every observable has a "subscribe" function that you can use to get
          updated values, and to trigger the initial fetch. It retuns a
          subscriber which you can use for unsubscription.
        </Body>
        <Body>
          In this case we are using "observeValue", as defined on the{' '}
          <Link routeName="API-CloudDoc">client doc</Link>.
        </Body>
        <Snippet
          code={`const fooDoc = cloud.get('foo');
const subscription = fooDoc.observeValue.subscribe(
  newFoo => {
    console.log('We now know that foo is:');
    console.log(JSON.stringify(foo));
  }
);
// when ready to stop getting updates for foo:
subscription.unsubscribe();
        `}
        />
      </Section>
      <Section title="React HOC">
        <Body>
          To create a component that automatically subscribes to incoming
          observable props, try{' '}
          <Link url="https://github.com/Nozbe/withObservables">
            withObservables
          </Link>
          .
        </Body>
      </Section>
      <Section title="React Render Prop Component">
        <Body>Not yet implemented.</Body>
      </Section>
      <Section title="React useObservable hook">
        <Body>
          Cloud-React comes with a hook for watching an observable or behavior
          subject.
        </Body>
        <Snippet
          code={`function DisplayFoo() {
  const cloud = useCloud();
  const fooDoc = cloud.get('foo');
  const fooValue = useObservable(fooDoc.observeValue);
  return <Text>Current value: {JSON.stringify(fooValue)}</Text>;
}
  `}
        />
        <Body>
          Also see{' '}
          <Link routeName="CloudReactHooks">the cloud react hooks</Link>, which
          offer higher-level functionality than useObservable.
        </Body>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Observables',
};
DocPage.path = 'observable-usage';

export default DocPage;
