import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import Container from '../Container';
import {
  Title,
  BodyText,
  VerticalToHorizontalLayout,
  VerticalToHorizontalLayoutChild,
} from '../Tokens';
import { Button } from '../Buttons';
import Schedule from '../Schedule';

function HomeSheduleSection() {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 104 }}>
      <Container>
        <VerticalToHorizontalLayout>
          <VerticalToHorizontalLayoutChild>
            <View
              style={{
                maxWidth: 412,
                marginBottom: 80,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <Title>Where are we today?</Title>
              <BodyText style={{ marginBottom: 40 }}>
                Ono Blends is based in LA, but we’re always on the move. Check
                out our schedule to find us today!
              </BodyText>
              <Button
                type="solid"
                text="Find us"
                routeName="FindUs"
                buttonStyle={{ width: 220 }}
              />
            </View>
          </VerticalToHorizontalLayoutChild>
          <VerticalToHorizontalLayoutChild
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <Title style={{ marginBottom: 20 }}>Today's Schedule</Title>
            <View
              style={{
                // backgroundColor: theme.colors.lightGrey,
                width: '100%',
                flex: 1,
              }}
            >
              <Schedule />
            </View>
          </VerticalToHorizontalLayoutChild>
        </VerticalToHorizontalLayout>
      </Container>
    </View>
  );
}

export default HomeSheduleSection;
