import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import Container from '../Container';
import { Title, BodyText } from '../Tokens';
import { Button } from '../Buttons';

function HomeSheduleSection() {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 104 }}>
      <Container>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              flex: 1,
              flexBasis: 0,
            }}
          >
            <View
              style={{
                maxWidth: 412,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start'
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
                onPress={() => {}}
                buttonStyle={{ width: 220 }}
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              flexBasis: 0,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <Title>Today's Schedule</Title>
            <View
              style={{
                backgroundColor: theme.colors.lightGrey,
                height: 433,
                flex: 1,
              }}
            />
          </View>
        </View>
      </Container>
    </View>
  );
}

export default HomeSheduleSection;