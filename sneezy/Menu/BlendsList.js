import React from 'react';
import { View, StyleSheet } from 'react-native';
import Container from '../Container';
import { Title, FootNote, BodyText } from '../Tokens';
import { useTheme } from '../ThemeContext';
import { useMenu, useCompanyConfig } from '../../ono-cloud/OnoKitchen';
import AirtableImage from '../../components/AirtableImage';

function BlendItem(props) {
  const theme = useTheme();
  return (
    <View
      key={props.id}
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
      <Title style={{ textAlign: 'right', fontSize: 24 }}>
        {props['Display Name']}
      </Title>
      <FootNote
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
          letterSpacing: 3
        }}
        bold
      >
        {props.DefaultBenefitName}
      </FootNote>
      <AirtableImage
        image={props.Recipe['Recipe Image']}
        style={{
          ...StyleSheet.absoluteFill,
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
        }}
      />
    </View>
  );
}

/*
background: #FFFFFF;
box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
border-radius: 8px;

opacity: 0.3;
background-image: radial-gradient(50% 100%, #FFFFFF 50%, rgba(255,255,255,0.00) 100%);

font-family: Maax-Bold;
font-size: 24px;
color: #005151;
text-align: right;
line-height: 28px;
 */

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
          {menu ? menu.blends.map(BlendItem) : <BodyText>Loading...</BodyText>}
        </View>
      </Container>
    </View>
  );
}

export default BlendsList;
