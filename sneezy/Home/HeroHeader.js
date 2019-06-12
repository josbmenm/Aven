import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { fontLarge } from '../../components/Styles';
import Container from '../Container'

export default function HeroHeader() {
  return (
    <View style={{ height: '100%', backgroundColor: 'green' }}>
      <Container style={{height: '100%'}}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row-reverse',
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              ...StyleSheet.absoluteFill,
            }}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: '#F8F8F8',
              padding: 24,
            }}
          >
            <Text style={{ ...fontLarge }}>
              We’re making healthy food accessible to everyone.
            </Text>
            <Text>
              Using organic fruits and vegetables, we create blends that focus
              on the best ingredients for you. All of our blends are
              customizable and designed with your best self in mind.
            </Text>
            <Button onPress={() => {}} style={{ margin: 0 }} title="find us" />
          </View>
        </View>
      </Container>
    </View>
  );
}
