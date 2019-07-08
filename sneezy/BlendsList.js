import React from 'react';
import { View, ScrollView } from 'react-native';
import Container from './Container';
import Title from '../dashboard/Title';
import BodyText from './BodyText';
import Tag from './Tag';
import FunctionalLink from '../navigation-web/Link';
import { useTheme } from '../dashboard/Theme';
import { useMenu } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { getMenuItemSlug } from '../logic/configLogic';
import { Responsive } from '../dashboard/Responsive';

function BlendsListItem({ blend, style }) {
  const theme = useTheme();
  return (
    <View
      key={blend.id}
      style={[
        {
          margin: 12,
          padding: 20,
          width: '100%',
          maxWidth: 296,
          height: 448,
          backgroundColor: 'white',
          overflow: 'hidden',
          borderRadius: 8,
          ...theme.shadows.large,
        },
        style,
      ]}
    >
      <FunctionalLink
        routeName="Blend"
        params={{ slug: getMenuItemSlug(blend) }}
        overrideATagCSS={{ display: 'flex', flexDirection: 'column' }}
      >
        <AirtableImage
          image={blend.Recipe['Recipe Image']}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: -1,
            transform: [
              { translateX: -36 },
              { translateY: 40 },
              { scale: 1.1 },
            ],
          }}
          resizeMode="cover"
        />
        <Title
          style={{ textAlign: 'right' }}
          responsiveStyle={{
            lineHeight: [28, 28],
            marginBottom: [4, 8],
          }}
        >
          {blend['Display Name']}
        </Title>
        <Tag
          title={blend.DefaultBenefitName}
          style={{ alignSelf: 'flex-end' }}
        />
      </FunctionalLink>
    </View>
  );
}

export function BlendsList() {
  const menu = useMenu();
  return (
    <Responsive
      style={{
        marginBottom: [60, 80],
      }}
    >
      <View>
        <Container>
          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {menu ? (
              menu.blends.map((item, i) => (
                <BlendsListItem key={i} blend={item} />
              ))
            ) : (
              <BodyText>Loading...</BodyText>
            )}
          </View>
        </Container>
      </View>
    </Responsive>
  );
}

function BlendsCarouselItem({ blend }) {
  const theme = useTheme();
  const slug = getMenuItemSlug(blend);
  return (
    <View
      key={blend.id}
      style={{
        margin: 12,
        padding: 20,
        width: 200,
        height: 295,
        backgroundColor: 'white',
        overflow: 'hidden',
        borderRadius: 8,
        ...theme.shadows.medium,
      }}
    >
      <FunctionalLink
        routeName="Blend"
        params={{ slug }}
        routeKey={`blend-${slug}`}
        overrideATagCSS={{ display: 'flex', flexDirection: 'column' }}
      >
        <AirtableImage
          image={blend.Recipe['Recipe Image']}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: -1,
            transform: [
              //   { translateX: -36 },
              { translateY: 40 },
              //   { scale: 1.1 },
            ],
          }}
          resizeMode="cover"
        />
        <Title
          style={{
            textAlign: 'center',
            fontSize: 13,
            lineHeight: 20,
            textTransform: 'uppercase',
          }}
        >
          {blend['Display Name']}
        </Title>
        {/* <Tag
          title={blend.DefaultBenefitName}
          style={{ alignSelf: 'flex-end' }}
        /> */}
      </FunctionalLink>
    </View>
  );
}

export function BlendsCarousel() {
  const menu = useMenu();
  return menu ? (
    <ScrollView horizontal>
      {menu.blends.map((item, i) => (
        <BlendsCarouselItem key={i} blend={item} />
      ))}
    </ScrollView>
  ) : (
    <BodyText>Loading...</BodyText>
  );
}
