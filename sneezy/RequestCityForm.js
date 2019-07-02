import React from 'react';
import { LocationInput } from './LocationInput';
import Button from '../dashboard/Button';
import View from '../views/View';
import BodyText from './BodyText';
import useCloud from '../cloud-core/useCloud';
import useAsyncError from '../react-utils/useAsyncError';
import { Responsive } from '../dashboard/Responsive';

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
    <Responsive
      style={{
        flexDirection: ['column', 'row'],
      }}
    >
      <View>
        <Responsive
          style={{
            marginBottom: [16, 0],
          }}
        >
          <LocationInput
            // inputValue={"ar"}
            onSelectedResult={setLocation}
            style={{ marginRight: 16, flex: 1 }}
          />
        </Responsive>
        <Button
          buttonStyle={{
            height: 73,
          }}
          titleStyle={{ fontSize: 24, lineHeight: 32 }}
          disabled={!location}
          title="request city"
          onPress={handleSubmit}
        />
      </View>
    </Responsive>
  );
}

export default RequestCityForm;
