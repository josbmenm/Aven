import React from 'react';
import { Animated, Image } from 'react-native';
import View from '../views/View';
import Heading from '../dashboard/Heading';
import BaseText from '../dashboard/BaseText';
import BlockForm from '../components/BlockForm';
import Input from '../components/BlockFormInput';
import Button from '../dashboard/Button';
import { useTheme } from '../dashboard/Theme';
import { LocationInput } from './LocationInput';
import { Responsive } from '../dashboard/Responsive';
import FormRow from './FormRow';
import BodyText from '../dashboard/BodyText';
import Spinner from '../dashboard/Spinner';

const TOTAL_STEPS = 6;

const FormInput = ({ style, ...rest }) => (
  <Input
    style={{ marginHorizontal: 8, marginBottom: 16, ...style }}
    {...rest}
  />
);

function StepHeader({ children }) {
  return (
    <FormRow style={{ marginBottom: 40, paddingHorizontal: 8 }}>
      {children}
    </FormRow>
  );
}

function stepsReducer(state, action) {
  let newStep;
  switch (action.type) {
    case 'GO_NEXT':
      newStep = state.current + 1;
      return {
        current: newStep,
        totalSteps: TOTAL_STEPS,
        hasNext: newStep < TOTAL_STEPS,
        hasPrev: true,
      };
    case 'GO_BACK':
      newStep = state.current - 1;
      return {
        current: newStep,
        totalSteps: TOTAL_STEPS,
        hasNext: true,
        hasPrev: newStep > 0,
      };
    default:
      return state;
  }
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
  const [loading, setLoading] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);
  const [error] = React.useState(null);
  const [stepsState, stepsDispatch] = React.useReducer(stepsReducer, {
    current: 0,
    hasNext: true,
    hasPrev: false,
  });

  const [formState, formDispatch] = React.useReducer(formReducer, {
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

  function onSubmit() {
    setLoading(true);
    console.log('TCL: onSubmit -> ', formState);
    setTimeout(() => {
      setLoading(false);
      setIsDone(true);
      // setError({ message: 'ups, something went wrong. please try again later'});
    }, 2000);
  }

  if (isDone) {
    return (
      <View style={{ paddingVertical: 40 }}>
        <BlockForm>
          <Step active={true}>
            <StepHeader style={{ paddingHorizontal: 8, alignItems: 'center' }}>
              <Heading size="small" style={{ textAlign: 'center' }}>
                Thanks! You’ll be hearing from us soon.
              </Heading>
              <Image
                source={require('./public/img/hand_icon.png')}
                style={{ width: 80, height: 80, margin: 24 }}
                resizeMode="contain"
              />
            </StepHeader>
          </Step>
        </BlockForm>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 40 }}>
      <BlockForm>
        <Step active={stepsState.current === 0}>
          <StepHeader>
            <Heading size="large" style={{ textAlign: 'center' }}>
              Book with us
            </Heading>
            <BodyText style={{ textAlign: 'center' }}>
              Are you interested in having Ono Blends cater for an event? We’d
              love to! All we need from you are a few details about your event,
              so we can provide you with the best experience possible.
            </BodyText>
          </StepHeader>
        </Step>
        <Step active={stepsState.current === 1}>
          <StepHeader>
            <Heading size="large">First thing’s first</Heading>
            <BodyText>We’d love to know who we are speaking to.</BodyText>
          </StepHeader>
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
                  formDispatch({
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
                  formDispatch({
                    type: 'UPDATE_FIELD',
                    key: 'lastName',
                    value,
                  })
                }
              />
            </FormRow>
          </Responsive>
        </Step>
        <Step active={stepsState.current === 2}>
          <StepHeader>
            <Heading size="large">How do we contact you?</Heading>
            <BodyText>
              Please let us know a good email to follow up with you.
            </BodyText>
          </StepHeader>
          <FormRow>
            <FormInput
              mode="email"
              label="email"
              value={formState.fields.email}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'email',
                  value,
                })
              }
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 3}>
          <StepHeader>
            <Heading size="large">What sort of event is this?</Heading>
            <BodyText>Let us know so we can best cater to it.</BodyText>
          </StepHeader>
          <FormRow>
            <FormInput
              mode="name"
              label="select an event type"
              value={formState.fields.eventType}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'eventType',
                  value,
                })
              }
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 4}>
          <StepHeader>
            <Heading size="large">When would you like us there?</Heading>
            <BodyText>Just let us know to when would be best.</BodyText>
          </StepHeader>
          <FormRow>
            <FormInput
              mode="name"
              label="event date"
              value={formState.fields.date}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'date',
                  value,
                })
              }
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 5}>
          <StepHeader>
            <Heading size="large">Almost done…..</Heading>
            <BodyText>Where would you like us to be?</BodyText>
          </StepHeader>
          <FormRow>
            {/* mapbox autocomplete */}
            <LocationInput
              inputValue={formState.fields.address.place_name_en}
              onSelectedResult={value => {
                formDispatch({ type: 'UPDATE_FIELD', key: 'address', value });
              }}
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 6}>
          <StepHeader>
            <Heading size="large">Additional Comments</Heading>
            <BodyText>
              Do you have anything else you’d like us to know?
            </BodyText>
          </StepHeader>
          <FormRow>
            <FormInput
              value={formState.fields.comments}
              label="any additional comments?"
              mode="textarea"
              onValue={value =>
                formDispatch({ type: 'UPDATE_FIELD', key: 'comments', value })
              }
            />
          </FormRow>
        </Step>
        <View style={{ flex: 1 }}>
          {stepsState.current !== 0 && (
            <FormRow>
              <ProgressBar step={stepsState.current} />
            </FormRow>
          )}

          <FormRow direction="row">
            {stepsState.current !== 0 && (
              <Button
                style={{
                  flex: 1,
                  marginBottom: 16,
                  marginHorizontal: 8,
                }}
                buttonStyle={{ paddingVertical: 15 }}
                type="outline"
                title="back"
                disabled={false}
                onPress={() => stepsDispatch({ type: 'GO_BACK' })}
              />
            )}
            {stepsState.current === 0 && (
              <Button
                style={{ flex: 1 }}
                buttonStyle={{ paddingVertical: 15 }}
                title="Start booking"
                onPress={() => stepsDispatch({ type: 'GO_NEXT' })}
              />
            )}
            {stepsState.hasPrev && stepsState.hasNext && (
              <Button
                style={{
                  flex: 2,
                  marginBottom: 16,
                  marginHorizontal: 8,
                }}
                buttonStyle={{ paddingVertical: 15 }}
                disabled={false}
                title="next"
                onPress={() => stepsDispatch({ type: 'GO_NEXT' })}
              />
            )}
            {stepsState.current === TOTAL_STEPS && (
              <SubmitButton
                buttonStyle={{ paddingVertical: 15 }}
                disabled={loading}
                onPress={onSubmit}
                loading={loading}
              />
            )}
          </FormRow>
          {/* { ? (

          ) : null} */}
          {/* { ? (
          ) : null} */}

          <FormRow style={{ height: 24, marginHorizontal: 8 }}>
            {error ? (
              <BaseText style={{ fontFamily: 'Maax-Bold' }}>
                {error.message}
              </BaseText>
            ) : null}
          </FormRow>
        </View>
      </BlockForm>
    </View>
  );
}

function SubmitButton({ onPress, disabled = false, loading }) {
  const theme = useTheme();
  return (
    <Button
      style={{ flex: 2, marginBottom: 16, marginHorizontal: 8 }}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <Spinner />
      ) : (
        <BaseText
          style={{
            fontFamily: theme.fonts.bold,
            textAlign: 'center',
            fontSize: 24,
            letterSpacing: 0.3,
            lineHeight: 28,
            color: theme.colors.white,
          }}
        >
          Submit
        </BaseText>
      )}
    </Button>
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
            width: `${(step / TOTAL_STEPS) * 100}%`, // use step here
            height: 4,
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </View>
      <BaseText bold style={{ fontSize: 12, fontFamily: theme.fonts.bold }}>
        {step} / {TOTAL_STEPS}
      </BaseText>
    </View>
  );
}

export default BookUsWizard;
