import React from 'react';
import { LocationInput } from './LocationInput';
import Button from '../dashboard/Button';
import View from '../views/View';
import BodyText from './BodyText';
import useCloud from '../cloud-core/useCloud';
import useAsyncError from '../react-utils/useAsyncError';

function RequestCityForm() {
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
    <View
      style={{
        flexDirection: 'row',
      }}
    >
      <LocationInput
        // inputValue={"ar"}
        onSelectedResult={setLocation}
        style={{ marginRight: 16 }}
      />
      <Button disabled={!location} title="Submit" onPress={handleSubmit} />
    </View>
  );
}

export default RequestCityForm;
