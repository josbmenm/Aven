import React from 'react';
import { View } from 'react-native';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import ButtonLink from './ButtonLink';
import Container from '../dashboard/Container';
import { ColumnToRow, ColumnToRowChild } from './Responsive';
import { Responsive } from '../dashboard/Responsive';
import { aspectRatio43 } from '../components/Styles';
import { useTheme } from '../dashboard/Theme';

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
              <Heading size="small">The team</Heading>
              <BodyText responsiveStyle={{ textAlign: ['center', 'left'] }}>
                We’re a team of foragers, foodies and builders with backgrounds
                in robotics, automation, logistics, and culinary fine dining.
                Regardless of the discipline, design and hospitality are at the
                core of everything we do.
              </BodyText>
              <ButtonLink
                type="solid"
                title="find us"
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
              <Responsive
                style={{
                  maxWidth: ['100%', 522],
                }}
              >
                <View
                  style={{
                    ...aspectRatio43,
                    backgroundColor: theme.colors.lightGrey,
                    marginRight: 40,
                  }}
                />
              </Responsive>
            </ColumnToRowChild>
          </Responsive>
        </ColumnToRow>
      </Container>
    </View>
  );
}

export default TheTeam;
