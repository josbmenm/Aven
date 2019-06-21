import React from 'react';
import { View } from 'react-native';
import { Title, BodyText, Button } from './Tokens';
import Container from './Container';
import { ColumnToRow, ColumnToRowChild, Responsive } from './Responsive';
import { aspectRatio43 } from '../components/Styles';
import { useTheme } from '../dashboard/Theme'

function TheTeam() {
  const theme = useTheme();
  return (
    <View
      style={{
        marginBottom: 80,
      }}
    >
      <Container>
        <ColumnToRow rowReverse>
          <Responsive
            style={{
              alignItems: ['center !important', 'flex-start !important'],
              paddingRight: [0, 40],
            }}
          >
            <ColumnToRowChild
              style={{ justifyContent: 'center', paddingVertical: 40 }}
            >
              <Title>The team</Title>
              <Responsive
                style={{
                  textAlign: ['center', 'left'],
                }}
              >
                <BodyText>
                  We’re a team of foragers, foodies and builders with
                  backgrounds in robotics, automation, logistics, and culinary
                  fine dining. Regardless of the discipline, design and
                  hospitality are at the core of everything we do.
                </BodyText>
              </Responsive>
              <Button
                type="solid"
                title="Find us"
                routeName="Schedule"
                buttonStyle={{ width: 220, marginVertical: 20 }}
              />
            </ColumnToRowChild>
          </Responsive>
          <Responsive
            style={{
              paddingRight: [0, 60],
            }}
          >
            <ColumnToRowChild>
              <View
                style={{
                  maxWidth: 430,
                  ...aspectRatio43,
                  backgroundColor: theme.colors.lightGrey,
                  marginRight: 40,
                }}
              />
            </ColumnToRowChild>
          </Responsive>
        </ColumnToRow>
      </Container>
    </View>
  );
}

export default TheTeam;
