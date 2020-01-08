import React from 'react';
import View from '../views/View';
import Link from '../navigation-web/Link';
import AirtableImage from '../components/AirtableImage';
import { useTheme } from '../dashboard/Theme';
import Heading from '../dashboard/Heading';
import Container from '../dashboard/Container';
import { ColumnToRow, ColumnToRowChild } from '../dashboard/Responsive';
import BodyText from '../dashboard/BodyText';
import { Responsive } from '../dashboard/Responsive';

function BodyLink({ children, url }) {
  return (
    <Link url={url}>
      <BodyText style={{ fontWeight: 'bold' }}>{children}</BodyText>
    </Link>
  );
}

function BenefitDescription({ name }) {
  switch (name) {
    case 'Skin & Body':
      return (
        <BodyText
          responsiveStyle={{ textAlign: ['center', 'left'] }}
          style={{ maxWidth: 630 }}
        >
          We use marine collagen, which can help promote youthful skin, and is
          great for healthier hair, and joint and bone health. You can read more
          research on marine collagen{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4745978/">
            here
          </BodyLink>
          .
        </BodyText>
      );
    case 'Digestion':
      return (
        <BodyText
          responsiveStyle={{ textAlign: ['center', 'left'] }}
          style={{ maxWidth: 630 }}
        >
          Probiotics are one of the most lauded supplements on the market for
          digestive support. We use 5,000 CFUS of plant-based probiotics
          clinically proven to aid in digestion, tame inflammation and boost
          your immunity. You can read research on them{' '}
          <BodyLink url="https://www.ncbi.nlm.nih.gov/pubmed/19369530">
            here
          </BodyLink>
          .
        </BodyText>
      );
    case 'Immunity':
      return (
        <BodyText
          responsiveStyle={{ textAlign: ['center', 'left'] }}
          style={{ maxWidth: 630 }}
        >
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
        </BodyText>
      );
    case 'Fitness':
      return (
        <BodyText
          responsiveStyle={{ textAlign: ['center', 'left'] }}
          style={{ maxWidth: 630 }}
        >
          Our fitness benefit is comprised of plant protein and amino acids,
          which is great for muscle growth and recovery. Most people know this,
          but it’s also a great way to make a meal more filling, and is a
          building block of any healthy diet.
        </BodyText>
      );
    case 'Focus':
      return (
        <BodyText
          responsiveStyle={{ textAlign: ['center', 'left'] }}
          style={{ maxWidth: 630 }}
        >
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
        </BodyText>
      );
    default:
      return null;
  }
}

export default function BenefitDetails({ benefit }) {
  const theme = useTheme();
  if (!benefit) return null;
  return (
    <View>
      <Container
        style={{
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
        responsiveStyle={{
          marginBottom: [40, 100],
          paddingBottom: [40, 100],
        }}
      >
        <Heading
          size="medium"
          style={{ textAlign: 'center' }}
          responsiveStyle={{
            marginBottom: [0, 24],
            fontSize: [24, 36],
            lineHeight: [32, 44],
          }}
        >
          this blend is designed for
        </Heading>
        <ColumnToRow style={{ alignSelf: 'center' }}>
          <ColumnToRowChild
            style={{
              flex: null,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AirtableImage
              image={benefit.icon}
              style={{ alignSelf: 'center', width: 120, height: 120 }}
              tintColor={theme.colors.primaryBg}
            />
          </ColumnToRowChild>
          <Responsive
            style={{
              flex: ['1', '2 !important'],
            }}
          >
            <ColumnToRowChild>
              <Heading
                responsiveStyle={{
                  textAlign: ['center', 'left'],
                }}
                style={{
                  fontSize: 16,
                  lineHeight: 28,
                  textTransform: 'uppercase',
                }}
              >
                {benefit.name.toLowerCase()}
              </Heading>
              <BenefitDescription name={benefit.name} />
            </ColumnToRowChild>
          </Responsive>
        </ColumnToRow>
      </Container>
    </View>
  );
}
