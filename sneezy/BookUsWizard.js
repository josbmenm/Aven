import React from 'react';
import { View } from 'react-native';
import { Title } from './Tokens';
import BodyText from './BodyText';
import FootNote from './FootNote';
import BlockForm from '../components/BlockForm';
import FormInput from '../components/BlockFormInput';
import Button from '../dashboard/Button';
import { useTheme } from '../dashboard/Theme';
import { LocationInput } from './LocationInput';
import { Responsive } from './Responsive';
import FormRow from './FormRow';

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
      return {
        ...state,
        fields: { ...state.fields, [action.key]: action.value },
      };
    default:
      return state;
  }
}

function BookUsWizard() {
  const { step, setStep, totalSteps } = useSteps(0);
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
  });

  function goNext() {
    const nextStep = step === totalSteps ? totalSteps : step + 1;
    setStep(nextStep);
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
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title style={{ textAlign: 'center' }}>Book with us</Title>
            <BodyText>
              Are you interested in having Ono Blends cater for an event? We’d
              love to! All we need from you are a few details about your event,
              so we can provide you with the best experience possible.
            </BodyText>
          </FormRow>
          <FormRow direction="row" style={{ alignItems: 'center' }}>
            <Button
              style={{ flex: 1 }}
              title="Start booking"
              onPress={goNext}
            />
          </FormRow>
        </Step>

        <Step active={step === 1}>
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>First thing’s first</Title>
            <BodyText>We’d love to know who we are speaking to.</BodyText>
          </FormRow>
          <Responsive
            style={{
              flexDirection: ['column', 'row'],
            }}
          >
            <FormRow direction="row">
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
            </FormRow>
          </Responsive>
        </Step>

        <Step active={step === 2}>
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>How do we contact you?</Title>
            <BodyText>
              Please let us know a good email to follow up with you.
            </BodyText>
          </FormRow>
          <FormRow>
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
          </FormRow>
        </Step>

        <Step active={step === 3}>
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>What sort of event is this?</Title>
            <BodyText>Let us know so we can best cater to it.</BodyText>
          </FormRow>
          <FormRow>
            <FormInput label="select an event type" />
          </FormRow>
        </Step>

        <Step active={step === 4}>
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>When would you like us there?</Title>
            <BodyText>Just let us know to when would be best.</BodyText>
          </FormRow>
          <FormRow>
            <FormInput label="event date" type="date" />
          </FormRow>
        </Step>

        <Step active={step === 5}>
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>Almost done…..</Title>
            <BodyText>Where would you like us to be?</BodyText>
          </FormRow>
          <FormRow>
            {/* mapbox autocomplete */}
            <LocationInput
              inputValue={formState.fields.address.place_name_en}
              onSelectedResult={value => {
                dispatch({ type: 'UPDATE_FIELD', key: 'address', value });
              }}
            />
          </FormRow>
        </Step>

        <Step active={step === 6}>
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>Additional Comments</Title>
            <BodyText>
              Do you have anything else you’d like us to know?
            </BodyText>
          </FormRow>
          <FormRow>
            <FormInput
              value={formState.fields.comments}
              label="any additional comments?"
              mode="textarea"
              onValue={value =>
                dispatch({ type: 'UPDATE_FIELD', key: 'comments', value })
              }
            />
          </FormRow>
        </Step>
        {step >= 1 ? (
          <View style={{ flex: 1 }}>
            <FormRow>
              <ProgressBar step={step} />
            </FormRow>
            <FormRow direction="row">
              <Button
                style={{ flex: 1, marginBottom: 16, marginHorizontal: 8 }}
                type="outline"
                title="back"
                onPress={goBack}
              />
              <Button
                style={{ flex: 2, marginBottom: 16, marginHorizontal: 8 }}
                disabled={false}
                title="next"
                onPress={goNext}
              />
              {step === totalSteps ? (
                <Button
                  style={{ flex: 2, marginBottom: 16, marginHorizontal: 8 }}
                  disabled={false}
                  title="submit"
                  onPress={onSubmit}
                />
              ) : null}
            </FormRow>
          </View>
        ) : null}
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
