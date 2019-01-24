import React, { useState } from 'react';
import { useNavigation } from '../../navigation-hooks/Hooks';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormTitle from './BlockFormTitle';
import BlockFormRow from './BlockFormRow';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import ShortBlockFormPage from './ShortBlockFormPage';

// function FocusProvider() {

// }

// function useFocus() {
//   return {}
// }

export default function CollectNamePage({ onSubmit, backBehavior, ...props }) {
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);

  function handleSubmit() {
    onSubmit({ firstName, lastName });
  }
  // const {getChildFocus} = useFocus()
  const i1 = React.createRef();
  const i2 = React.createRef();
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm>
        <BlockFormMessage message="You're almost ready to go..." />
        <BlockFormTitle title="what's the name for the order?" />
        <BlockFormRow>
          <BlockFormInput
            label="firstname"
            onValue={setFirstName}
            value={firstName}
            ref={i1}
            onSubmit={() => {
              // todo, focus management..
              i2.current.focus();
            }}
          />
          <BlockFormInput
            label="lastname"
            onValue={setLastName}
            value={lastName}
            onSubmit={handleSubmit}
            ref={i2}
          />
        </BlockFormRow>
        <BlockFormRow>
          <BlockFormButton title="pay now" onPress={handleSubmit} />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

CollectNamePage.navigationOptions = ShortBlockFormPage.navigationOptions;
