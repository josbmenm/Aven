import React from 'react';
import View from '../views/View';
import Container from './Container';
import Heading from './Heading';
import BodyText from './BodyText';
import { Responsive } from '../dashboard/Responsive';

export default function GenericHeroHeader({
  title,
  bodyText,
  backgroundColor,
  children,
  className,
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
          <Responsive style={{
            paddingTop: [80, 128],
            paddingBottom: [112, 128]
          }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                // paddingHorizontal: 80,
                maxWidth: 720,
              }}
            >
              <Heading
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
