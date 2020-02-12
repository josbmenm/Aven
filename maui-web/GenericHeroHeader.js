import React from 'react';
import View from '../views/View';
import Container from '../dashboard-ui-deprecated/Container';
import Heading from '../dashboard-ui-deprecated/Heading';
import { Responsive } from '../dashboard-ui-deprecated/Responsive';
import BodyText from '../dashboard-ui-deprecated/BodyText';

export default function GenericHeroHeader({
  title,
  bodyText,
  backgroundColor,
  children,
  className,
  responsiveStyle = {
    paddingTop: [80, 168],
    paddingBottom: [112, 168],
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
            paddingHorizontal: 20,
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
                    marginBottom: [16, 24],
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
