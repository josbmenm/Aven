import React from 'react';
import CollectNamePage from '../components/CollectNamePage';
import { useOrder } from '../ono-cloud/OrderContext';
import { useNavigation } from '../navigation-hooks/Hooks';
import useEmptyOrderEscape from './useEmptyOrderEscape';
import { error } from '../logger/logger';
import { Alert, Text, View } from 'react-native';
import GenericPage from '../components/GenericPage';
import { Button } from '../dash-ui';
import BlockFormInput from '../components/BlockFormInput';
import useKeyboardPopover from '../components/useKeyboardPopover';
import { TouchableOpacity } from 'react-native-gesture-handler';
import useFocus from '../navigation-hooks/useFocus';
import { useCloud, useStream } from '../cloud-core/KiteReact';

const BUILT_IN_TYPES = {
  String: {
    name: 'String',
    primitiveType: 'string',
  },
  Number: {
    name: 'Number',
    primitiveType: 'number',
  },
  Object: {
    name: 'Object',
    primitiveType: 'object',
  },
  List: {
    name: 'List',
    primitiveType: 'list',
  },
};

function TypeNameForm({ onTypeName }) {
  const [typeName, setTypeName] = React.useState('');

  function handleSubmit() {
    onTypeName(typeName);
  }

  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <BlockFormInput
            {...inputProps}
            label="Type Name"
            onValue={setTypeName}
            value={typeName}
          />
        </View>
      ),
    ],
  });

  return (
    <React.Fragment>
      {inputs}
      <Button onPress={handleSubmit} title="save" />
    </React.Fragment>
  );
}

function TypeOptionList({ onSelectType }) {
  return Object.entries(BUILT_IN_TYPES).map(([typeId, typeConfig]) => {
    return (
      <TouchableOpacity
        key={typeId}
        onPress={() => {
          onSelectType({ ...typeConfig, typeId });
        }}
      >
        <Text>{typeConfig.name}</Text>
      </TouchableOpacity>
    );
  });
}

function ConfirmNewType({ typeName, typeId, onConfirm }) {
  return (
    <View>
      <Text>New type "{typeName}"</Text>
      <Text>{typeId}</Text>
      <Button title="confirm" onPress={onConfirm} />
    </View>
  );
}

function NewTypeForm({ onClose }) {
  const cloud = useCloud();
  const [typeSpec, setTypeSpec] = React.useState(null);
  const [typeName, setTypeName] = React.useState(null);
  return (
    <View>
      {!typeSpec && (
        <TypeOptionList
          onSelectType={selectedTypeSpec => {
            setTypeSpec(selectedTypeSpec);
          }}
        />
      )}
      {!typeName && !!typeSpec && (
        <TypeNameForm
          onTypeName={newTypeName => {
            setTypeName(newTypeName);
          }}
        />
      )}
      {typeName && typeSpec && (
        <ConfirmNewType
          typeName={typeName}
          typeId={typeSpec.typeId}
          onConfirm={() => {
            cloud
              .get('Types')
              .children.get(typeName)
              .putValue(typeSpec);
            onClose();
          }}
        />
      )}
    </View>
  );
}

function useNewTypeAction() {
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <NewTypeForm onClose={onClose} />
  ));
  function handleNewType() {
    onPopover();
  }
  return handleNewType;
}

function TypeRow({ type }) {
  const typeValue = useStream(type.value.stream);
  return (
    <Text>
      {type.getLocalName()}: {JSON.stringify(typeValue)}
    </Text>
  );
}

function TypeList() {
  const cloud = useCloud();
  const typesStream = cloud && cloud.get('Types').children.all;
  const types = useStream(typesStream);
  if (!types) return null;
  return Object.values(types).map(t => <TypeRow type={t} />);
}

export default function ConfiguratorScreen(props) {
  const handleNewType = useNewTypeAction();
  return (
    <GenericPage hideBackButton={true}>
      <TypeList />
      <Button title="New Type.." onPress={handleNewType} />
    </GenericPage>
  );
}

ConfiguratorScreen.navigationOptions = GenericPage.navigationOptions;
