import React from 'react';
import { Animated, Image } from 'react-native';
import View from '../views/View';
import Text from '../views/Text';
import Title from '../dashboard/Title';
import BodyText from '../dashboard/BodyText';
import SmallText from '../dashboard/SmallText';
import BlockForm from '../components/BlockForm';
import Input from '../components/BlockFormInput';
import Button from '../dashboard/Button';
import { useTheme } from '../dashboard/Theme';
import { LocationInput } from './LocationInput';
import { Responsive } from '../dashboard/Responsive';
import FormRow from './FormRow';

const TOTAL_STEPS = 6;

const FormInput = ({ style, ...rest }) => <Input style={{ marginHorizontal: 8, ...style}} {...rest} />

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
  const [error, setError] = React.useState(null);
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
            <FormRow style={{ paddingHorizontal: 8, alignItems: 'center' }}>
              <Title style={{ textAlign: 'center' }}>
                Thanks! You’ll be hearing from us soon.
              </Title>
              <Image
                source={require('./public/img/hand_icon.png')}
                style={{ width: 80, height: 80, margin: 24 }}
                resizeMode="contain"
              />
            </FormRow>
          </Step>
        </BlockForm>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 40 }}>
      <BlockForm>
        <Step active={stepsState.current === 0}>
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title style={{ textAlign: 'center' }}>Book with us</Title>
            <BodyText style={{ textAlign: 'center' }}>
              Are you interested in having Ono Blends cater for an event? We’d
              love to! All we need from you are a few details about your event,
              so we can provide you with the best experience possible.
            </BodyText>
          </FormRow>
        </Step>
        <Step active={stepsState.current === 1}>
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
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>What sort of event is this?</Title>
            <BodyText>Let us know so we can best cater to it.</BodyText>
          </FormRow>
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
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>When would you like us there?</Title>
            <BodyText>Just let us know to when would be best.</BodyText>
          </FormRow>
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
          <FormRow style={{ paddingHorizontal: 8 }}>
            <Title>Almost done…..</Title>
            <BodyText>Where would you like us to be?</BodyText>
          </FormRow>
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
                formDispatch({ type: 'UPDATE_FIELD', key: 'comments', value })
              }
            />
          </FormRow>
        </Step>
        <View style={{ flex: 1 }}>
          {stepsState.current === 0 ? (
            <FormRow direction="row" style={{ alignItems: 'center' }}>
              <Button
                style={{ flex: 1 }}
                title="Start booking"
                onPress={() => stepsDispatch({ type: 'GO_NEXT' })}
              />
            </FormRow>
          ) : (
            <FormRow>
              <ProgressBar step={stepsState.current} />
            </FormRow>
          )}
          {stepsState.hasPrev && stepsState.hasNext ? (
            <FormRow direction="row">
              <Button
                style={{ flex: 1, marginBottom: 16, marginHorizontal: 8 }}
                type="outline"
                title="back"
                disabled={false}
                onPress={() => stepsDispatch({ type: 'GO_BACK' })}
              />
              <Button
                style={{ flex: 2, marginBottom: 16, marginHorizontal: 8 }}
                disabled={false}
                title="next"
                onPress={() => stepsDispatch({ type: 'GO_NEXT' })}
              />
            </FormRow>
          ) : null}
          {stepsState.current === TOTAL_STEPS ? (
            <FormRow direction="row" style={{ marginBottom: 0 }}>
              <Button
                style={{ flex: 1, marginBottom: 16, marginHorizontal: 8 }}
                type="outline"
                title="back"
                disabled={loading}
                onPress={() => stepsDispatch({ type: 'GO_BACK' })}
              />
              <SubmitButton
                disabled={loading}
                onPress={onSubmit}
                loading={loading}
              />
            </FormRow>
          ) : null}

          <FormRow style={{ height: 24, marginHorizontal: 8 }}>
            {error ? <Title style={{ fontSize: 14 }}>{error.message}</Title> : null}
          </FormRow>
        </View>
      </BlockForm>
    </View>
  );
}

function spinIndefinitely(position) {
  Animated.timing(position, {
    toValue: 1,
    duration: 1000
  }).start(evt => {
    if (evt.finished) {
      position.setValue(0);
      Animated.timing(position, {
        toValue: 1,
        duration: 1000,
      }).start(evt => {
        if (evt.finished) {
          position.setValue(0);
          spinIndefinitely(position);
        }
      });
    }
  });
}

function Spinner({ loading }) {
  const [position] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(position, {
      toValue: 1,
      duration: 1000,
    }).start(evt => {
      if (evt.finished) {
        position.setValue(0);
        spinIndefinitely(position);
      }
    });
  }, [])

  let rotate = position.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "359deg"]
  })

  return (
    <Animated.View style={{ padding: 5, alignItems: 'center', transform: [{ rotate }] }}>
      <svg width={18} height={17}>
        <path
          d="M13.026-.052a9 9 0 1 1-8.052 0l.895 1.79a7 7 0 1 0 6.262 0l.895-1.79z"
          fill="#FFF"
        />
      </svg>
    </Animated.View>
  );
}

function SubmitButton({ onPress, disabled = false, loading }) {
  const theme = useTheme();
  return (
    <Button
    style={{ flex: 2, marginBottom: 16, marginHorizontal: 8 }}
      disabled={disabled}
      onPress={onPress}
    >
      {loading ? (
        <Spinner />
      ) : (
        <Text
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
        </Text>
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
            backgroundColor: theme.colors.monsterra,
            borderRadius: 2,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </View>
      <SmallText bold>
        {step} / {TOTAL_STEPS}
      </SmallText>
    </View>
  );
}

export default BookUsWizard;
