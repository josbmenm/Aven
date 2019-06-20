import React from 'react';
import { View } from 'react-native';
import Container from './Container';
import { Title, FootNote, BodyText } from './Tokens';
import FunctionalLink from '../navigation-web/Link';
import { useTheme } from './ThemeContext';
import { useMenu } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';

function BlendItem({ blend }) {
  const theme = useTheme();
  return (
    <View
      key={blend.id}
      style={{
        margin: 12,
        padding: 20,
        width: '100%',
        maxWidth: 296,
        height: 448,
        backgroundColor: 'white',
        overflow: 'hidden',
        borderRadius: 8,
        ...theme.shadows.large,
      }}
    >
      <FunctionalLink
        routeName="Blend"
        params={{ id: 123 }}
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
        <Title style={{ textAlign: 'right', fontSize: 24 }}>
          {blend['Display Name']}
        </Title>
        {/* TODO: DESIGN: can this be 70% opacity as a whole or just the bg color? */}
        <FootNote
          bold
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            alignSelf: 'flex-end',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.primary,
            color: theme.colors.white,
            minWidth: 120,
            textAlign: 'center',
            letterSpacing: 3,
            opacity: 0.7,
          }}
        >
          {blend.DefaultBenefitName}
        </FootNote>
      </FunctionalLink>
    </View>
  );
}

function BlendsList() {
  const menu = useMenu();
  return (
    <View>
      <Container style={{ paddingVertical: 100 }}>
        <View
          style={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {menu ? (
            menu.blends.map((item, i) => <BlendItem key={i} blend={item} />)
          ) : (
            <BodyText>Loading...</BodyText>
          )}
        </View>
      </Container>
    </View>
  );
}

export default BlendsList;
