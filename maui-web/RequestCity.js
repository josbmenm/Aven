import React from 'react';
import { Image } from 'react-native';
import { aspectRatio43 } from '../components/Styles';
import {
  ColumnToRow,
  ColumnToRowChild,
} from '../dashboard-ui-deprecated/Responsive';
import { Responsive } from '../dashboard-ui-deprecated/Responsive';
import Container from '../dashboard-ui-deprecated/Container';
import Heading from '../dashboard-ui-deprecated/Heading';
import BodyText from '../dashboard-ui-deprecated/BodyText';

const breakpoints = [1024, 1400];

export default function RequestCity({ style }) {
  return (
    <Container style={style}>
      <ColumnToRow breakpoints={breakpoints}>
        <Responsive
          breakpoints={breakpoints}
          style={{ display: ['none', 'flex'] }}
        >
          <ColumnToRowChild style={{ flex: 2, paddingRight: 60 }}>
            <Image
              style={{
                ...aspectRatio43,
              }}
              source={require('./public/img/map.jpg')}
            />
          </ColumnToRowChild>
        </Responsive>
        <ColumnToRowChild style={{ flex: 3, justifyContent: 'center' }}>
          <Heading
            size="small"
            breakpoints={breakpoints}
            responsiveStyle={{
              textAlign: ['center', 'left'],
              alignSelf: ['center', 'flex-start'],
            }}
          >
            Don’t see us in your city?
          </Heading>
          <BodyText
            style={{ maxWidth: 412 }}
            breakpoints={breakpoints}
            responsiveStyle={{
              textAlign: ['center', 'left'],
              alignSelf: ['center', 'flex-start'],
              marginBottom: [60, 40],
            }}
          >
            Ono Blends is always looking to grow. Request your city and we’ll
            try to make it happen.
          </BodyText>
        </ColumnToRowChild>
      </ColumnToRow>
    </Container>
  );
}
