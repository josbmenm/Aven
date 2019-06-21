import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Title, BodyText } from './Tokens';
import Container from './Container';
import BlockForm from '../components/Form';
import FormSection from '../components/FormSection';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { useTheme } from './ThemeContext';

function BookUsWizard() {
  const theme = useTheme();
  const [step, setStep] = React.useState(0);

  return (
    <View style={{ paddingVertical: 100 }}>
      <BlockForm>
        <Step active={step === 0}>
          <StepSection style={{ paddingHorizontal: 8 }}>
            <Title>Book with us</Title>
            <BodyText>
              Are you interested in having Ono Blends cater for an event? We’d
              love to! All we need from you are a few details about your event,
              so we can provide you with the best experience possible.
            </BodyText>
            <View />
          </StepSection>
          <StepSection>
            <Button
              disabled={false}
              title="Start booking"
              onPress={() => setStep(1)}
            />
          </StepSection>
        </Step>

        <Step active={step === 1}>
          <StepSection style={{ paddingHorizontal: 8 }}>
            <Title>First thing’s first</Title>
            <BodyText>We’d love to know who we are speaking to.</BodyText>
            <View />
          </StepSection>
          <StepSection>
            <FormSection direction="row">
              <FormInput label="first name" />
              <FormInput label="last name" />
            </FormSection>
          </StepSection>
          <StepSection>
            <FormSection direction="row">
              <Button
                style={{ flex: 1 }}
                type="outline"
                title="back"
                onPress={() => setStep(0)}
              />
              <Button
                style={{ flex: 2 }}
                disabled={true}
                title="Start booking"
                onPress={() => setStep(2)}
              />
            </FormSection>
          </StepSection>
        </Step>
      </BlockForm>
    </View>
  );
}

function Step({ title, subtitle, children, active, style, ...rest }) {
  if (!active) return null;
  return (
    <View style={[{ paddingVertical: 40 }, style]} {...rest}>
      {children}
    </View>
  );
}

function StepSection({ children, style, ...rest }) {
  return (
    <View style={[{ paddingBottom: 40 }, style]} {...rest}>
      {children}
    </View>
  );
}

export default BookUsWizard;
