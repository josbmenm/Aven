import React from 'react';
import View from '../views/View';
import FormInput from '../components/BlockFormInput';
import { monsterra80 } from '../components/Styles';

function SubscriptionForm({}) {
  const [email, setEmail] = React.useState('');
  return (
    <form
      action="https://onofood.us18.list-manage.com/subscribe/post?u=87f353e4bf17adebb83d8db1a&amp;id=cdd5752309"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      style={{ display: 'contents' }}
    >
      <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
        <FormInput
          type="email"
          label="your email"
          required
          name="EMAIL"
          value={email}
          onValue={setEmail}
          style={{}}
        />
        <input
          type="submit"
          value="get updates"
          name="subscribe"
          style={{
            display: 'flex',
            backgroundColor: monsterra80,
            borderRadius: 4,
            paddingTop: 12,
            paddingBottom: 14,
            paddingLeft: 16,
            paddingRight: 16,
            marginLeft: 8,
            marginRight: 8,
            color: 'white',
            fontFamily: 'Maax-Bold',
            fontSize: 24,
            border: 0,
            letterSpacing: 0.3,
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
      </View>
    </form>
  );
}

export default SubscriptionForm;
