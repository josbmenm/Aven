import React from 'react';
import { Text, View } from 'react-native';
import Link from '../navigation-web/Link';
import AirtableImage from '../components/AirtableImage';
import { useTheme } from '../dashboard/Theme';
import Container from './Container';
import { ColumnToRow, ColumnToRowChild } from './Responsive';
import { Responsive } from '../dashboard/Responsive';

function BodyLink({ children, url }) {
  return (
    <Link url={url}>
      <Text style={{ fontWeight: 'bold' }}>{children}</Text>
    </Link>
  );
}
function Body({ children }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        ...theme.textStyles.body,
      }}
    >
      {children}
    </Text>
  );
}

function BenefitDescription({ name }) {
  switch (name) {
    case 'Skin & Body':
      return (
        <Body>
          We use marine collagen, which can help promote youthful skin, and is
          great for healthier hair, and joint and bone health. You can read more
          research on marine collagen{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4745978/">
            here
          </BodyLink>
          .
        </Body>
      );
    case 'Digestion':
      return (
        <Body>
          Probiotics are one of the most lauded supplements on the market for
          digestive support. We use 5,000 CFUS of plant-based probiotics
          clinically proven to aid in digestion, tame inflammation and boost
          your immunity. You can read research on them{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pubmed/19369530">
            here
          </BodyLink>
          .
        </Body>
      );
    case 'Immunity':
      return (
        <Body>
          Immunity: Our immunity benefit includes Astragalus, Goji Berries, and
          Elderberries to support your immune system. Studies have shown that
          elderberry can help for immune health, which you can read{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pubmed/27023596">
            here
          </BodyLink>
          . Astragalus helps in similar ways with studies showing that it can
          help protect against heart, brain, kidney, and intestine diseases. You
          can read more about that{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pubmed/26343107">
            here
          </BodyLink>
          . Lastly, goji berries are packed full of antioxidants, which help
          with immunity. More can be read{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pubmed/18447631">
            here
          </BodyLink>
          .
        </Body>
      );
    case 'Fitness':
      return (
        <Body>
          Our fitness benefit is comprised of plant protein and amino acids,
          which is great for muscle growth and recovery. Most people know this,
          but it’s also a great way to make a meal more filling, and is a
          building block of any healthy diet.
        </Body>
      );
    case 'Focus':
      return (
        <Body>
          A blend of Lion’s Mane Mushroom, Rhodiola, and Cordyceps. Research has
          shown that these ingredients can support attention, focus, and mental
          energy. All of these ingredients are natural and well researched, you
          can read some of the research on Rhodiola{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pubmed/10839209">
            here
          </BodyLink>
          , Lion’s Mane Mushroom{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pubmed/24266378">
            here
          </BodyLink>
          , and Cordyceps{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3909570/">
            here
          </BodyLink>
          .
        </Body>
      );
    default:
      return null;
  }
}

export default function BenefitDetails({ benefit }) {
  const theme = useTheme();
  return (
    <View>
      <Container
        style={{
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Responsive
          style={{
            marginBottom: [30, 60],
            marginTop: [30, 60],
          }}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.fontSizes[0],
              textAlign: 'center',
              ...theme.textStyles.title,
            }}
          >
            this blend is designed for..
          </Text>
        </Responsive>
        <ColumnToRow>
          <ColumnToRowChild>
            <AirtableImage
              image={benefit.Icon}
              style={{ width: 150, height: 150, alignSelf: 'center' }}
              tintColor={theme.colors.primary}
            />
          </ColumnToRowChild>
          <ColumnToRowChild>
            <Text
              style={{
                color: theme.colors.primary,
                ...theme.textStyles.title,
                fontSize: theme.fontSizes[2],
              }}
            >
              {benefit.Name.toUpperCase()}
            </Text>
            <BenefitDescription name={benefit.Name} />
          </ColumnToRowChild>
        </ColumnToRow>
      </Container>
    </View>
  );
}
