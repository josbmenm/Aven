import React from 'react';
import { Text, View } from 'react-native';
import Link from '../navigation-web/Link';
import AirtableImage from '../components/AirtableImage';

function BenefitDescription({ name }) {
  switch (name) {
    case 'Skin & Body':
      return (
        <Text>
          We use marine collagen, which can help promote youthful skin, and is
          great for healthier hair, and joint and bone health. You can read more
          research on marine collagen{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4745978/">
            here
          </Link>
          .
        </Text>
      );
    case 'Digestion':
      return (
        <Text>
          Probiotics are one of the most lauded supplements on the market for
          digestive support. We use 5,000 CFUS of plant-based probiotics
          clinically proven to aid in digestion, tame inflammation and boost
          your immunity. You can read research on them{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pubmed/19369530">here</Link>.
        </Text>
      );
    case 'Immunity':
      return (
        <Text>
          Immunity: Our immunity benefit includes Astragalus, Goji Berries, and
          Elderberries to support your immune system. Studies have shown that
          elderberry can help for immune health, which you can read{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pubmed/27023596">here</Link>.
          Astragalus helps in similar ways with studies showing that it can help
          protect against heart, brain, kidney, and intestine diseases. You can
          read more about that{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pubmed/26343107">here</Link>.
          Lastly, goji berries are packed full of antioxidants, which help with
          immunity. More can be read{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pubmed/18447631">here</Link>.
        </Text>
      );
    case 'Fitness':
      return (
        <Text>
          Our fitness benefit is comprised of plant protein and amino acids,
          which is great for muscle growth and recovery. Most people know this,
          but it’s also a great way to make a meal more filling, and is a
          building block of any healthy diet.
        </Text>
      );
    case 'Focus':
      return (
        <Text>
          A blend of Lion’s Mane Mushroom, Rhodiola, and Cordyceps. Research has
          shown that these ingredients can support attention, focus, and mental
          energy. All of these ingredients are natural and well researched, you
          can read some of the research on Rhodiola{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pubmed/10839209">here</Link>,
          Lion’s Mane Mushroom{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pubmed/24266378">here</Link>,
          and Cordyceps{' '}
          <Link url="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3909570/">
            here
          </Link>
          .
        </Text>
      );
    default:
      return null;
  }
}

export default function BenefitDetails({ benefit }) {
  return (
    <View>
      <Text>this blend is for..</Text>
      <Text>{benefit.Name}</Text>
      <AirtableImage image={benefit.Icon} style={{ width: 50, height: 50 }} />
      <BenefitDescription name={benefit.Name} />
    </View>
  );
}
