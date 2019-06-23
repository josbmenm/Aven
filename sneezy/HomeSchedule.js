import React from 'react';
import { View } from 'react-native';
import Container from './Container';
import { Title, BodyText } from './Tokens';
import ButtonLink from './ButtonLink';
import { ColumnToRow, ColumnToRowChild, Responsive } from './Responsive';
import Schedule from './Schedule';

function HomeShedule() {
  return (
    <View style={{ marginBottom: 104 }}>
      <Container>
        <ColumnToRow>

            <ColumnToRowChild>
            <Responsive
            style={{
              alignItems: ['center !important', 'flex-start !important'],
              // paddingRight: [0, 40],
              marginBottom: [80, 0],
              maxWidth: ["100%", 412]
            }}
          >
              <View
                style={{
                  flexDirection: 'column',
                }}
              >
                <Title>Where are we today?</Title>
                <Responsive
                  style={{
                    textAlign: ['center', 'left'],
                  }}
                >
                  <BodyText style={{ marginBottom: 40 }}>
                    Ono Blends is based in LA, but we’re always on the move.
                    Check out our schedule to find us today!
                  </BodyText>
                </Responsive>
                <ButtonLink
                  type="solid"
                  title="Find us"
                  routeName="Schedule"
                  buttonStyle={{ width: 220 }}
                />
              </View>
          </Responsive>
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
