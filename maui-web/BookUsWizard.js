import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import Heading from '../dashboard-ui-deprecated/Heading';
import BaseText from '../dashboard-ui-deprecated/BaseText';
import BlockForm from '../components/BlockForm';
import TextInput from '../dash-ui/TextInput';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import { useCloud } from '../cloud-core/KiteReact';
import { Button, Stack } from '../dash-ui';
import FormRow from './FormRow';
import BodyText from '../dashboard-ui-deprecated/BodyText';
import Spinner from '../dashboard-ui-deprecated/Spinner';
import useKeyPress from './useKeyPress';

const TOTAL_STEPS = 7;

const inputStyle = {
  marginHorizontal: 8,
  marginBottom: 16,
};

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
  const cloud = useCloud();
  const [loading, setLoading] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);
  const [error] = React.useState(null);
  const enterKeyPress = useKeyPress('Enter');
  const downKeyPress = useKeyPress('Down');
  const upKeyPress = useKeyPress('up');
  const [stepsState, stepsDispatch] = React.useReducer(stepsReducer, {
    current: 0,
    hasNext: true,
    hasPrev: false,
  });

  React.useEffect(() => {
    console.log('enter useEffect');
    if (enterKeyPress && !stepValidation[stepsState.current].disabled) {
      if (stepsState.current === TOTAL_STEPS) {
        console.log('stepsState.current === TOTAL_STEPS');
        onSubmit();
      } else {
        stepsDispatch({ type: 'GO_NEXT' });
      }
    }
  });

  React.useEffect(() => {
    if (upKeyPress || downKeyPress) {
      console.log('arrow keys pressed!');
    }
  });

  const firstNameRef = React.useRef(null);
  const lastNameRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const attendanceRef = React.useRef(null);
  const dateRef = React.useRef(null);
  const addressRef = React.createRef(null);
  const durationRef = React.useRef(null);
  const commentsRef = React.useRef(null);

  React.useEffect(() => {
    switch (stepsState.current) {
      case 1:
        firstNameRef.current.focus();
        break;
      case 2:
        emailRef.current.focus();
        break;
      case 3:
        attendanceRef.current.focus();
        break;
      case 4:
        dateRef.current.focus();
        break;
      case 5:
        durationRef.current.focus();
        break;
      case 6:
        addressRef.current.focus();
        break;
      case 7:
        commentsRef.current.focus();
        break;
      default:
        return;
    }
  }, [stepsState.current]);

  const [formState, formDispatch] = React.useReducer(formReducer, {
    fields: {
      firstName: '',
      lastName: '',
      email: '',
      attendance: '',
      date: '',
      duration: '',
      address: '',
      comments: '',
    },
  });

  const stepValidation = [
    {},
    {
      disabled:
        formState.fields.firstName === '' || formState.fields.lastName === '',
    },
    {
      disabled: formState.fields.email === '',
    },
    {
      disabled: formState.fields.attendance === '',
    },
    {
      disabled: formState.fields.date === '',
    },
    {
      disabled: formState.fields.duration === '',
    },
    {
      disabled: formState.fields.address === '',
    },
    {
      disabled: false,
    },
  ];

  function onSubmit() {
    setLoading(true);
    cloud
      .dispatch({ type: 'RequestBooking', request: formState.fields })
      .then(() => {
        setLoading(false);
        setIsDone(true);
      })
      .catch(e => {
        alert('oh no');
        setLoading(false);
      });

    // setTimeout(() => {
    //   setLoading(false);
    //   setIsDone(true);
    //   // setError({ message: 'ups, something went wrong. please try again later'});
    // }, 2000);
  }

  if (isDone) {
    return (
      <View style={{ paddingVertical: 40 }}>
        <BlockForm>
          <Step active={true}>
            <StepHeader
              style={{
                paddingHorizontal: 8,
                alignItems: 'center',
              }}
            >
              <Heading size="small" style={{ textAlign: 'center' }}>
                Thanks! You’ll be hearing from us soon.
              </Heading>
              <Image
                source={require('./public/img/hand_icon.png')}
                style={{
                  width: 80,
                  height: 80,
                  margin: 24,
                  alignSelf: 'center',
                }}
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
              Book with us, Los Angeles.
            </Heading>
            <BodyText style={{ textAlign: 'center' }}>
              Hosting an event, have smoothie lovers in the office, or simply
              want 20 blends for yourself (we’re not judging)? Start booking to
              bring our nutritious blends right to you.
            </BodyText>
          </StepHeader>
        </Step>
        <Step active={stepsState.current === 1}>
          <StepHeader>
            <Heading size="large">First thing’s first</Heading>
            <BodyText>We’d love to know who we are speaking to.</BodyText>
          </StepHeader>

          <FormRow direction="row">
            <TextInput
              label="first name"
              mode="name"
              ref={firstNameRef}
              value={formState.fields.firstName}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'firstName',
                  value,
                })
              }
              style={inputStyle}
            />
            <TextInput
              label="last name"
              mode="name"
              ref={lastNameRef}
              value={formState.fields.lastName}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'lastName',
                  value,
                })
              }
              style={inputStyle}
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 2}>
          <StepHeader>
            <Heading size="large">
              What’s the best email to get in contact with you?
            </Heading>
          </StepHeader>
          <FormRow>
            <TextInput
              mode="email"
              label="email"
              ref={emailRef}
              value={formState.fields.email}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'email',
                  value,
                })
              }
              style={inputStyle}
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 3}>
          <StepHeader>
            <Heading size="large">How many attendees?</Heading>
            <BodyText>Let us know so we can cater to your demands.</BodyText>
          </StepHeader>
          <FormRow>
            <TextInput
              mode="name"
              label="approximate attendance"
              ref={attendanceRef}
              value={formState.fields.attendance}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'attendance',
                  value,
                })
              }
              style={inputStyle}
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 4}>
          <StepHeader>
            <Heading size="large">When would you like us there?</Heading>
            <BodyText>Tell us your preferred dates.</BodyText>
          </StepHeader>
          <FormRow>
            <TextInput
              mode="name"
              label="event day(s)"
              ref={dateRef}
              value={formState.fields.date}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'date',
                  value,
                })
              }
              style={inputStyle}
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 5}>
          <StepHeader>
            <Heading size="large">And how long will this event be?</Heading>
            <BodyText>
              A time frame or estimated number of hours works just fine.
            </BodyText>
          </StepHeader>
          <FormRow>
            <TextInput
              mode="name"
              label="time frame, hours"
              ref={durationRef}
              value={formState.fields.duration}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'duration',
                  value,
                })
              }
              style={inputStyle}
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 6}>
          <StepHeader>
            <Heading size="large">Almost done…</Heading>
            <BodyText>What is your address?</BodyText>
          </StepHeader>
          <FormRow>
            <TextInput
              mode="name"
              label="event address"
              ref={addressRef}
              value={formState.fields.address}
              onValue={value =>
                formDispatch({
                  type: 'UPDATE_FIELD',
                  key: 'address',
                  value,
                })
              }
              style={inputStyle}
            />
          </FormRow>
        </Step>
        <Step active={stepsState.current === 7}>
          <StepHeader>
            <Heading size="large">Additional Comments</Heading>
            <BodyText>
              Do you have anything else you’d like us to know?
            </BodyText>
          </StepHeader>
          <FormRow>
            <TextInput
              value={formState.fields.comments}
              label="any additional comments?"
              mode="textarea"
              ref={commentsRef}
              onValue={value =>
                formDispatch({ type: 'UPDATE_FIELD', key: 'comments', value })
              }
              style={inputStyle}
            />
          </FormRow>
        </Step>
        <View style={{ flex: 1 }}>
          {stepsState.current !== 0 && (
            <FormRow>
              <ProgressBar step={stepsState.current} />
            </FormRow>
          )}
          <Stack horizontal>
            {stepsState.current === 0 && (
              <Button
                title="start booking"
                onPress={() => stepsDispatch({ type: 'GO_NEXT' })}
              />
            )}
            {stepsState.current !== 0 && (
              <Button
                tabIndex="-1"
                outline
                title="back"
                disabled={false}
                onPress={() => stepsDispatch({ type: 'GO_BACK' })}
              />
            )}
            {stepsState.hasPrev && stepsState.hasNext && (
              <Button
                disabled={stepValidation[stepsState.current].disabled}
                title="next"
                onPress={() => stepsDispatch({ type: 'GO_NEXT' })}
              />
            )}
            {stepsState.current === TOTAL_STEPS && (
              <SubmitButton
                disabled={loading}
                onPress={onSubmit}
                loading={loading}
              />
            )}
          </Stack>
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

function SubmitButton({ onPress, disabled = false, loading, buttonStyle }) {
  const theme = useTheme();
  return (
    <Button
      disabled={disabled || loading}
      onPress={onPress}
      buttonStyle={buttonStyle}
    >
      {loading ? (
        <Spinner />
      ) : (
        <BaseText
          style={{
            fontFamily: theme.fonts.bold,
            textAlign: 'center',
            fontSize: 20,
            letterSpacing: 0.3,
            lineHeight: 24,
            color: theme.colors.white,
          }}
        >
          submit
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
            width: `${(step / (TOTAL_STEPS + 1)) * 100}%`, // use step here
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
