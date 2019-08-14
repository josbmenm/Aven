import React from 'react';
import { ScrollView } from 'react-native';
import View from '../views/View';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import { Responsive } from '../dashboard/Responsive';
import Tag from '../dashboard/Tag';
import FunctionalLink from '../navigation-web/Link';
import { useTheme } from '../dashboard/Theme';
import { useMenu } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { getMenuItemSlug } from '../logic/configLogic';
import BodyText from '../dashboard/BodyText';

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
        routeKey={`Blend-${getMenuItemSlug(blend)}`}
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
              { translateY: 20 },
              { scale: 1.1 },
            ],
          }}
          resizeMode="cover"
        />
        <Heading
          size="small"
          style={{ textAlign: 'right' }}
          responsiveStyle={{
            fontSize: [18, 24],
            lineHeight: [28, 28],
            letterSpacing: [0, 0],
            marginBottom: [8, 12],
          }}
        >
          {blend['Display Name']}
        </Heading>
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

function BlendsCarouselItem({ blend, active }) {
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
        borderWidth: 3,
        borderColor: active ? theme.colors.monsterras : 'transparent',
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
        <Heading
          style={{
            textAlign: 'center',
            fontSize: 13,
            lineHeight: 20,
            textTransform: 'uppercase',
          }}
        >
          {blend['Display Name']}
        </Heading>
        {/* <Tag
          title={blend.DefaultBenefitName}
          style={{ alignSelf: 'flex-end' }}
        /> */}
      </FunctionalLink>
    </View>
  );
}

export function BlendsCarousel({ activeBlendSlug }) {
  const menu = useMenu();
  const theme = useTheme();
  const [visibleIndex, setVisibleIndex] = React.useState(-1);

  function handleScroll({ nativeEvent }) {
    // console.log("TCL: handleScroll -> nativeEvent", nativeEvent)
    const { layoutMeasurement, contentOffset } = nativeEvent;
    const scrollValue = contentOffset.x + layoutMeasurement.width / 2;
    // console.log('TCL: handleScroll -> scrollValue', scrollValue);
    setVisibleIndex(Math.round(scrollValue / 200) - 1);
  }

  return menu ? (
    <Responsive
      style={{
        paddingBottom: [20, 40],
      }}
    >
      <View>
        <ScrollView
          horizontal
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ paddingBottom: 80 }}
        >
          {menu.blends.map((item, i) => (
            <BlendsCarouselItem
              active={activeBlendSlug === getMenuItemSlug(item)}
              key={i}
              blend={item}
            />
          ))}
        </ScrollView>
        <Responsive
          style={{
            display: ['flex', 'none'],
          }}
        >
          <View
            style={{
              position: 'absolute',
              bottom: 60,
              left: '50%',
              transform: [{ translateX: '-50%' }],
              height: 8,
              flexDirection: 'row',
            }}
          >
            {menu.blends.map((item, i) => (
              <View
                key={item.id}
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor:
                    visibleIndex === i
                      ? theme.colors.monsterras[2]
                      : theme.colors.monsterras[4],
                  borderRadius: 5,
                  marginRight: i === menu.blends.length - 1 ? 0 : 12,
                }}
              />
            ))}
          </View>
        </Responsive>
      </View>
    </Responsive>
  ) : (
    <BodyText>Loading...</BodyText>
  );
}
