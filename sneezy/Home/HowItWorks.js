import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../ThemeContext';
import Container from '../Container';

function HowItWorks() {
  const theme = useTheme();
  return (
    <View style={{
      paddingVertical: 68
    }}>
      <Container style={{
        alignItems: 'center'
      }}>
        <Text style={theme.textStyles.heading}>How it works</Text>
      </Container>
    </View>
  )
}

export default HowItWorks;
