import React from 'react';
import { LocationInput } from './LocationInput';
import Button from '../dashboard/Button';
import View from '../views/View';
import BodyText from '../dashboard/BodyText';
import BaseText from '../dashboard/BaseText';
import { useCloud } from '../cloud-core/KiteReact';
import useAsyncError from '../react-utils/useAsyncError';
import { Responsive } from '../dashboard/Responsive';
import Spinner from '../dashboard/Spinner';
import { useTheme } from '../dashboard/Theme'

function RequestCityForm({ breakpoints }) {
  const theme = useTheme();
  const [location, setLocation] = React.useState(null);
  const [isDone, setIsDone] = React.useState(false);
  const cloud = useCloud();
  const doc = cloud.get('RequestedLocations');
  const handleErrors = useAsyncError();
  const [loading, setLoading] = React.useState(false);

  function handleSubmit() {
    setLoading(true);
    handleErrors(
      doc.putTransactionValue({ type: 'LocationVote', location }).then(() => {
        setIsDone(true);
        setLoading(false);
      }),
    );
  }
  if (isDone) {
    return (
      <View>
        <BodyText bold>Thanks, your request is in!:</BodyText>
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
        <LocationInput
          // inputValue={"ar"}
          onSelectedResult={setLocation}
          style={{ flex: 1 }}
          breakpoints={breakpoints}
          responsiveStyle={{
            marginBottom: [16, 0],
            marginRight: [0, 16],
          }}
        />
        <Button
          breakpoints={breakpoints}
          onPress={handleSubmit}
          buttonStyle={{
            paddingVertical: 16,
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
              request city
            </BaseText>
          )}
        </Button>
      </View>
    </Responsive>
  );
}

export default RequestCityForm;
