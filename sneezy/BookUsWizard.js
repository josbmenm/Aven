import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Title, BodyText, FootNote } from './Tokens';
import Container from './Container';
import BlockForm from '../components/BlockForm';
import FormInput from '../components/BlockFormInput';
import Button from '../components/Button';
import { useTheme } from './ThemeContext';
import { LocationInput } from './LocationInput';
import { Responsive } from './Responsive';

function useSteps(initialValue) {
  const [step, setStep] = React.useState(initialValue);
  return {
    step,
    setStep,
    totalSteps: 7, //TODO: HARDCODED VALUE WARNING!!!
  };
}

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      // validate values here
      let errors;
      return {
        ...state,
        fields: { ...state.fields, [action.key]: action.value },
        errors,
      };
    default:
      return state;
  }
}

function BookUsWizard() {
  const theme = useTheme();
  const [formState, dispatch] = React.useReducer(formReducer, {
    fields: {
      firstName: '',
      lastName: '',
      email: '',
      eventType: '',
      date: '',
      address: {
        place_name_en: '',
      },
      comments: '',
    },
    errors: null,
  });
  const { step, setStep, totalSteps } = useSteps(0);

  function goNext() {
    setStep(step + 1);
  }

  function goBack() {
    let backStep = step === 0 ? 0 : step - 1;
    setStep(backStep);
  }

  function onSubmit() {
    console.log('TCL: onSubmit -> ', formState);
  }

  return (
    <View style={{ paddingVertical: 40 }}>
      <BlockForm>
        <Step active={step === 0}>
          <Row style={{ paddingHorizontal: 8 }}>
            <Title>Book with us</Title>
            <BodyText>
              Are you interested in having Ono Blends cater for an event? We’d
              love to! All we need from you are a few details about your event,
              so we can provide you with the best experience possible.
            </BodyText>
            <View />
          </Row>
          <Row direction="row" style={{ alignItems: 'center'}}>
            <Button style={{ flex: 1 }} title="Start booking" onPress={goNext} />
          </Row>
        </Step>

        <Step active={step === 1}>
          <Row style={{ paddingHorizontal: 8 }}>
            <Title>First thing’s first</Title>
            <BodyText>We’d love to know who we are speaking to.</BodyText>
            <View />
          </Row>
          <Responsive
            style={{
              flexDirection: ['column', 'row'],
            }}
          >
            <Row direction="row">
              <FormInput
                label="first name"
                mode="name"
                value={formState.fields.firstName}
                onValue={value =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    key: 'firstName',
                    value,
                  })
                }
              />
              <FormInput
                label="last name"
                mode="name"
                value={formState.fields.lastName}
                onValue={value =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    key: 'lastName',
                    value,
                  })
                }
              />
            </Row>
          </Responsive>
          <Row>
            <ProgressBar step={step} />
          </Row>
          <Row direction="row">
            <Button
              style={{ flex: 1, marginBottom: 16 }}
              type="outline"
              title="back"
              onPress={goBack}
            />
            <Button
              style={{ flex: 2, marginBottom: 16 }}
              disabled={
                !formState.fields.firstName || !formState.fields.lastName
              }
              title="next"
              onPress={goNext}
            />
          </Row>
        </Step>

        <Step active={step === 2}>
          <Row style={{ paddingHorizontal: 8 }}>
            <Title>How do we contact you?</Title>
            <BodyText>
              Please let us know a good email to follow up with you.
            </BodyText>
            <View />
          </Row>
          <Row>
            <FormInput
              mode="email"
              label="email"
              value={formState.fields.email}
              onValue={value =>
                dispatch({
                  type: 'UPDATE_FIELD',
                  key: 'email',
                  value,
                })
              }
            />
          </Row>
          <Row>
            <ProgressBar step={step} />
          </Row>
          <Row direction="row">
            <Button
              style={{ flex: 1, marginBottom: 16 }}
              type="outline"
              title="back"
              onPress={goBack}
            />
            <Button
              style={{ flex: 2, marginBottom: 16 }}
              disabled={
                !formState.fields.email ||
                (formState.errors && formState.errors.email)
              }
              title="next"
              onPress={goNext}
            />
          </Row>
        </Step>

        <Step active={step === 3}>
          <Row style={{ paddingHorizontal: 8 }}>
            <Title>What sort of event is this?</Title>
            <BodyText>Let us know so we can best cater to it.</BodyText>
            <View />
          </Row>
          <Row>
            <FormInput label="select an event type" />
          </Row>
          <Row>
            <ProgressBar step={step} />
          </Row>
          <Row direction="row">
            <Button
              style={{ flex: 1, marginBottom: 16 }}
              type="outline"
              title="back"
              onPress={goBack}
            />
            <Button
              style={{ flex: 2, marginBottom: 16 }}
              disabled={false}
              title="next"
              onPress={goNext}
            />
          </Row>
        </Step>

        <Step active={step === 4}>
          <Row style={{ paddingHorizontal: 8 }}>
            <Title>When would you like us there?</Title>
            <BodyText>Just let us know to when would be best.</BodyText>
            <View />
          </Row>
          <Row>
            <FormInput label="event date" type="date" />
          </Row>
          <Row>
            <ProgressBar step={step} />
          </Row>
          <Row direction="row">
            <Button
              style={{ flex: 1, marginBottom: 16 }}
              type="outline"
              title="back"
              onPress={goBack}
            />
            <Button
              style={{ flex: 2, marginBottom: 16 }}
              disabled={false}
              title="next"
              onPress={goNext}
            />
          </Row>
        </Step>

        <Step active={step === 5}>
          <Row style={{ paddingHorizontal: 8 }}>
            <Title>Almost done…..</Title>
            <BodyText>Where would you like us to be?</BodyText>
            <View />
          </Row>
          <Row>
            {/* mapbox autocomplete */}
            <LocationInput
              inputValue={formState.fields.address.place_name_en}
              onSelectedResult={value => {
                console.log('TCL: BookUsWizard -> value', value);
                dispatch({ type: 'UPDATE_FIELD', key: 'address', value });
              }}
            />
          </Row>
          <Row>
            <ProgressBar step={step} />
          </Row>
          <Row direction="row">
            <Button
              style={{ flex: 1, marginBottom: 16 }}
              type="outline"
              title="back"
              onPress={goBack}
            />
            <Button
              style={{ flex: 2, marginBottom: 16 }}
              disabled={!formState.fields.address.id}
              title="next"
              onPress={goNext}
            />
          </Row>
        </Step>

        <Step active={step === 6}>
          <Row style={{ paddingHorizontal: 8 }}>
            <Title>Additional Comments</Title>
            <BodyText>
              Do you have anything else you’d like us to know?
            </BodyText>
            <View />
          </Row>
          <Row>
            <FormInput
              value={formState.fields.comments}
              label="any additional comments?"
              mode="textarea"
              onValue={value =>
                dispatch({ type: 'UPDATE_FIELD', key: 'comments', value })
              }
            />
          </Row>
          <Row>
            <ProgressBar step={step} />
          </Row>
          <Row direction="row">
            <Button
              style={{ flex: 1, marginBottom: 16 }}
              type="outline"
              title="back"
              onPress={goBack}
            />
            <Button
              style={{ flex: 2, marginBottom: 16 }}
              disabled={!formState.fields.comments}
              title="book now"
              onPress={onSubmit}
            />
          </Row>
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

function Row({ children, style, direction = 'column', ...rest }) {
  return (
    <Responsive
      style={{
        flexDirection: ['column', direction],
      }}
    >
      <View style={[{ paddingBottom: 36 }, style]} {...rest}>
        {children}
      </View>
    </Responsive>
  );
}

function ProgressBar({ step, ...rest }) {
  const theme = useTheme();
  const { totalSteps } = useSteps();
  return (
    <View
      style={{
        marginHorizontal: 8,
      }}
    >
      <View
        style={{
          marginBottom: 8,
          height: 4,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.colors.lighterGrey,
        }}
      >
        <View
          style={{
            width: `${(step / totalSteps) * 100}%`, // use step here
            height: 4,
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </View>
      <FootNote bold>
        {step} / {totalSteps}
      </FootNote>
    </View>
  );
}

export default BookUsWizard;
