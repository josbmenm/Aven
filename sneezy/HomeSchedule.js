import React from 'react';
import { View } from 'react-native';
import { useTheme } from './ThemeContext';
import Container from './Container';
import { Button, Title, BodyText } from './Tokens';
import { ColumnToRow, ColumnToRowChild } from './Responsive';
import Schedule from './Schedule';

function HomeShedule() {
  return (
    <View style={{ marginBottom: 104 }}>
      <Container>
        <ColumnToRow>
          <ColumnToRowChild>
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
                routeName="Schedule"
                buttonStyle={{ width: 220 }}
              />
            </View>
          </ColumnToRowChild>
          <ColumnToRowChild
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
          </ColumnToRowChild>
        </ColumnToRow>
      </Container>
    </View>
  );
}

export default HomeShedule;
