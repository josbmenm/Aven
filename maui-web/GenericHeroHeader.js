import React from 'react';
import View from '../views/View';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import { Responsive } from '../dashboard/Responsive';
import BodyText from '../dashboard/BodyText';

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
      <Container
        style={{ position: 'relative' }}
        responsiveStyle={{
          width: ['100% !important', '100%'],
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor,
            alignItems: 'center',
            paddingHorizontal: 16,
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
              {title && (
                <Heading
                  size="large"
                  style={{ textAlign: 'center' }}
                  responsiveStyle={{
                    marginBottom: [8, 16],
                  }}
                >
                  {title}
                </Heading>
              )}
              {bodyText && (
                <BodyText style={{ textAlign: 'center' }}>{bodyText}</BodyText>
              )}
            </View>
          </Responsive>
        </View>
        {children}
      </Container>
    </View>
  );
}
