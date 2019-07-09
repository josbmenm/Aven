import React from 'react';
import { LocationInput } from './LocationInput';
import Button from '../dashboard/Button';
import View from '../views/View';
import BodyText from '../dashboard/BodyText';
import { useCloud } from '../cloud-core/KiteReact';
import useAsyncError from '../react-utils/useAsyncError';
import { Responsive } from '../dashboard/Responsive';

function RequestCityForm({ breakpoint }) {
  const [location, setLocation] = React.useState(null);
  const [isDone, setIsDone] = React.useState(false);
  const cloud = useCloud();
  const doc = cloud.get('RequestedLocations');
  const handleErrors = useAsyncError();
  function handleSubmit() {
    handleErrors(
      doc.putTransaction({ type: 'LocationVote', location }).then(() => {
        setIsDone(true);
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
      breakpoint={breakpoint}
      style={{
        flexDirection: ['column', 'row'],
      }}
    >
      <View>
        <LocationInput
          // inputValue={"ar"}
          onSelectedResult={setLocation}
          style={{ flex: 1 }}
          breakpoint={breakpoint}
          responsiveStyle={{
            marginBottom: [16, 0],
            marginRight: [0, 16],
          }}
        />
        <Button
          breakpoint={breakpoint}
          disabled={!location}
          title="request city"
          onPress={handleSubmit}
        />
      </View>
    </Responsive>
  );
}

export default RequestCityForm;
