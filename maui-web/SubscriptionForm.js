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
import { monsterra80 } from '../components/Styles';

function SubscriptionForm({ breakpoints }) {
  const [email, setEmail] = React.useState(null);
  const [isDone, setIsDone] = React.useState(false);

  if (isDone) {
    return (
      <View>
        <BodyText bold>
          thanks for subscribing! we will reach out soon.
        </BodyText>
      </View>
    );
  }
  return (
    <form
      action="https://onofood.us18.list-manage.com/subscribe/post?u=87f353e4bf17adebb83d8db1a&amp;id=cdd5752309"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      // target="_blank"
      style={{ display: 'block' }}
      // onSubmit={() => {
      //   setIsDone(true);
      // }}
    >
      <Responsive
        breakpoints={breakpoints}
        style={{
          flexDirection: ['column', 'row'],
        }}
      >
        <View>
          <FormInput
            type="email"
            label="your email"
            required
            name="EMAIL"
            value={email}
            onValue={setEmail}
            style={{
              marginTop: 4,
              marginLeft: 4,
            }}
          />
          <input
            type="submit"
            value="keep me updated"
            name="subscribe"
            id="mc-embedded-subscribe"
            style={{
              display: 'flex',
              backgroundColor: monsterra80,
              borderRadius: 4,
              paddingTop: 12,
              paddingBottom: 14,
              paddingLeft: 16,
              paddingRight: 16,
              marginLeft: 8,
              marginTop: 8,
              color: 'white',
              fontFamily: 'Maax-Bold',
              fontSize: 24,
              border: 0,
              textAlign: 'center',
            }}
          />
          <div style={{ position: 'absolute', left: -5000 }} aria-hidden="true">
            <input
              type="text"
              value=""
              onChange={() => {}}
              name="b_87f353e4bf17adebb83d8db1a_cdd5752309"
              tabIndex="-1"
              value=""
            />
          </div>

          {/* <Button
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
        </Button> */}
        </View>
      </Responsive>
    </form>
  );
}

export default SubscriptionForm;
