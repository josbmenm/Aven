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
      <Title>About Aven</Title>
      <Body>
        <Bold>Aven</Bold> is an emerging framework for building apps on every
        platform. It includes React Native technologies for the views and
        environments, React Navigation as the cross-platform navigation library,
        and Aven Cloud as the data handling framework.
      </Body>
      <Body>
        <Bold>Aven Cloud</Bold> is a data-handling framework for web and mobile
        JavaScript applications. It helps keep data up to date across the client
        and server as it changes over time, handles authentication, enforces
        permissions, and computes changes on top of the data.
      </Body>
      <Section title="Development Philosophies and Strategies">
        <Body>
          A few strategies we have for building infrastructure that lasts:
        </Body>
        <SubSection title="Open and Committed">
          <Body>
            Aven is liberally open source under the <Bold>Apache 2.0</Bold>{' '}
            license. We believe that a liberal license is vital for widespread
            adoption of the framework, resulting in the longevity of our
            infrastructure.
          </Body>
          <Body>
            Criticism, competition, and forks may sting, but they are the best
            way to learn, and are fantastic for the health of our community. We
            want as many people to share this technology as possible. As a team,
            we can build robust tools that survive long into the future.
          </Body>
          <Body>
            Documentation, examples and video will be critical for onboarding
            people to the ecosystem. We aim to make all educational materials
            publicly available.
          </Body>
          <Body>
            We pledge to never give up on maintaining this infrastructure, and
            we hope to see your support in return.
          </Body>
        </SubSection>
        <SubSection title="Diversity and Inclusion">
          <Body>
            We can only thrive by including people of all ethnicities, genders,
            orientations, abilities, class, religions, and programming
            backgrounds! When we do, we enjoy a diverse field of feedback and
            contribution that will inevitably lead to better results.
          </Body>
          <Body>
            Our priority should be on mentoring and encouraging women, black,
            and latinx coders. These are the most egregious areas of
            under-representation, but we should also support the impoverished
            and people without access to big city jobs.
          </Body>
        </SubSection>
        <SubSection title="Iteration">
          <Body>
            We have a philosophy of making slow and iterative improvements to
            our existing technologies in order to fix our problems. Rather than
            recklessly discarding inferior abstractions, we can build
            long-lasting systems by providing graceful upgrade paths to new
            technologies.
          </Body>
          <Body>
            One technique is <Bold>low coupling, high cohension.</Bold> The Aven
            framework intends to be a set of independent, loosly coupled
            technologies. This allows people to gradually opt in to the
            framework as it matures.
          </Body>
        </SubSection>
        <SubSection title="Deployability">
          <Body>
            We aim to make our technology immenently useful in production. We
            cut corners when necessary to get products out the door.
          </Body>
          <Body>
            To mitigate against shortcomings in our abstractions, we install{' '}
            <Bold>escape hatches</Bold> that give us access to underlying APIs,
            which can be used when coming across.
          </Body>
        </SubSection>
        <SubSection title="Universality">
          <Body>
            Every use-case is valid. We aim to support developers saying "yes"
            to every product need. We hope to always say yes to questions like
            "Can you build an iOS app with Push Notifications?", or "Can you
            program a robot?"
          </Body>
          <Body>
            When possible, we share technologies across different environments
            to achieve the same thing. Where possible, we only use one
            programming language. One view framework. One navigation system.
          </Body>
          <Body>
            <Bold>Aim to minimize conceptual overlaps.</Bold> By focusing on a
            small set of tools, we can make our skills more portable on
            different environments. Where possible, we avoid tools that lock us
            down to a single environment.
          </Body>
        </SubSection>
      </Section>

      <SubSection title="Who">
        <Body>
          Aven is being launched by{' '}
          <Link url="https://twitter.com/EricVicenti">Eric Vicenti</Link>, and
          is open to community contribution. The "we" in this document refers to
          Eric and any other dreamers on this path to brilliant software.
        </Body>
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'About Aven',
};
DocPage.path = 'about';

export default DocPage;
