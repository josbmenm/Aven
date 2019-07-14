import React from 'react';
import View from '../views/View';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import { Responsive } from '../dashboard/Responsive';

export default function GenericHeroHeader({
  title,
  bodyText,
  backgroundColor,
  children,
  className,
  responsiveStyle = {
    paddingTop: [80, 128],
    paddingBottom: [112, 128],
  },
}) {
  return (
    <View className={className}>
      <Container style={{ position: 'relative' }}>
        <View
          style={{
            flex: 1,
            backgroundColor,
            alignItems: 'center',
          }}
        >
          <Responsive style={responsiveStyle}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: 720,
              }}
            >
              <Heading
                size="large"
                style={{ textAlign: 'center' }}
                responsiveStyle={{
                  marginBottom: [8, 16],
                }}
              >
                {title}
              </Heading>
              <BodyText style={{ textAlign: 'center' }}>{bodyText}</BodyText>
            </View>
          </Responsive>
        </View>
        {children}
      </Container>
    </View>
  );
}
