import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormInput from '../components/BlockFormInput';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';
import useFocus from '../navigation-hooks/useFocus';
import { useNavigation } from '../navigation-hooks/Hooks';
import Spinner from './Spinner';
import FeedbackContext from './FeedbackContext';

const STAR_EMPTY = require('./assets/StarEmpty.png');
const STAR_FULL = require('./assets/StarFull.png');

export default function FeedbackRatingPage({
  onSubmit,
  hideBackButton,
  ...props
}) {
  const { navigate } = useNavigation();
  const [rating, setRating] = React.useState(0);
  const feedbackContext = React.useContext(FeedbackContext);
  const [isSpinning, setIsSpinning] = React.useState(false);
  function handleRating(r) {
    navigate('Feedback');

    // if (!feedbackContext || !feedbackContext.feedbackDoc) {
    //   return; // hope this never happens.. otherwise the stars will be unresponsive
    // }
    // setIsSpinning(true);
    // setRating(r);
    // feedbackContext.feedbackDoc
    //   .transact(f => ({ ...(f || {}), rating: r }))
    //   .then(() => {
    //     navigate('Feedback');
    //     setIsSpinning(false);
    //   }, 1500)
    //   .catch(e => {
    //     console.error(e);
    //     setIsSpinning(false);
    //   });
  }
  return (
    <ShortBlockFormPage hideBackButton={hideBackButton} {...props}>
      <BlockForm>
        <BlockFormMessage message="Tap Rating" />
        <BlockFormTitle message="free blend on the way" />
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {Array(5)
            .fill(1)
            .map((_, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handleRating(index + 1);
                  }}
                >
                  <Image
                    style={{
                      resizeMode: 'contain',
                      width: 155,
                      width: 155,
                      margin: 30,
                      tintColor: '#FF9B18',
                    }}
                    source={rating > index ? STAR_FULL : STAR_EMPTY}
                  />
                </TouchableOpacity>
              );
            })}
        </View>
        <Spinner isSpinning={isSpinning} />
      </BlockForm>
    </ShortBlockFormPage>
  );
}

FeedbackRatingPage.navigationOptions = ShortBlockFormPage.navigationOptions;
