import React from 'react';
import { View } from 'react-native';
import Button from './Button';
import useOrderInfoPopover from './useOrderInfoPopover';
import useBlendPickPopover from './useBlendPickPopover';
import { useCloud } from '../cloud-core/KiteReact';
import Row from './Row';
import TaskInfo from './TaskInfo';
import FillList from './FillList';
import cuid from 'cuid';

function usePutTransactionValue(docName) {
  const cloud = useCloud();
  const doc = cloud.get(docName);
  return doc.putTransactionValue;
}

export default function BlendTasker() {
  const [orderName, setOrderName] = React.useState('Friend');
  const [blendId, setBlendId] = React.useState(null);
  const [blendName, setBlendName] = React.useState(null);
  const [blendFills, setBlendFills] = React.useState(null);

  const openBlendChooser = useBlendPickPopover({
    blendId,
    setBlendId,
    setBlendName,
    setBlendFills,
  });

  const openOrderInfo = useOrderInfoPopover({
    hideBlendName: true,
    orderName,
    onOrderInfo: ({ orderName }) => setOrderName(orderName),
  });
  const restaurantDispatch = usePutTransactionValue('RestaurantActions');

  return (
    <Row title="free blend">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, justifyContent: 'flex-start' }}>
            <TaskInfo task={{ name: orderName, blendName }} />
            <Button
              title="set order info"
              type="outline"
              onPress={openOrderInfo}
            />
            <Button
              title="choose blend"
              type="outline"
              onPress={openBlendChooser}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FillList fills={blendFills} onFillsChange={null} />
            {/* <Button
              title="customize"
              type="outline"
              onPress={openBlendChooser}
            /> */}
          </View>
        </View>

        <Button
          title="queue task"
          disabled={blendId === null}
          onPress={() => {
            restaurantDispatch({
              type: 'QueueTasks',
              tasks: [
                {
                  id: cuid(),
                  name: orderName,
                  blendName,
                  skipBlend: false,
                  deliveryMode: 'deliver',
                  fills: blendFills,
                },
              ],
            })
              .then(() => {
                console.log('order placed!');
              })
              .catch(console.error);
          }}
        />
      </View>
    </Row>
  );
}
