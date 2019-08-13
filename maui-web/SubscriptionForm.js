import React from 'react';
import Button from '../dashboard/Button';
import View from '../views/View';
import BodyText from '../dashboard/BodyText';
import BaseText from '../dashboard/BaseText';
import { useCloud } from '../cloud-core/KiteReact';
import useAsyncError from '../react-utils/useAsyncError';
import { Responsive } from '../dashboard/Responsive';
import Spinner from '../dashboard/Spinner';
import { useTheme } from '../dashboard/Theme';
import FormInput from '../components/BlockFormInput';

function SubscriptionForm({ breakpoints }) {
  const theme = useTheme();
  const [email, setEmail] = React.useState(null);
  const [isDone, setIsDone] = React.useState(false);
  const cloud = useCloud();
  const handleErrors = useAsyncError();
  const [loading, setLoading] = React.useState(false);

  function handleSubmit() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsDone(true);
    }, 500);
  }
  if (isDone) {
    return (
      <View>
        <BodyText bold>Thanks, you are subscribed!</BodyText>
      </View>
    );
  }
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        flexDirection: ['column', 'row'],
      }}
    >
      <View>
        <FormInput
          value={email}
          onValue={setEmail}
          type="email"
          label="your email"
        />
        <Button
          breakpoints={breakpoints}
          onPress={handleSubmit}
          buttonStyle={{
            paddingVertical: 13,
            marginLeft: 8,
          }}
          disabled={loading}
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
              keep me updated
            </BaseText>
          )}
        </Button>
      </View>
    </Responsive>
  );
}

export default SubscriptionForm;
