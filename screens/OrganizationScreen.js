import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Alert,
  ScrollView,
  AlertIOS,
} from 'react-native';
import JSONView from '../components/JSONView';
import { useCloud, useStream } from '../cloud-core/KiteReact';
import useObservable from '../cloud-core/useObservable';
import RowSection from '../components/RowSection';
import TextRow from '../components/TextRow';
import Row from '../components/Row';
import BitRow from '../components/BitRow';
import { rowStyle, rowTitleStyle } from '../components/Styles';
import SimplePage from '../components/SimplePage';
import { Button, MultiSelect } from '../dash-ui/MultiSelect';
import useKeyboardPopover from '../components/useKeyboardPopover';
import { useNavigation } from '../navigation-hooks/Hooks';
import LinkRow from '../components/LinkRow';

function useNewThingPopover() {
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <View style={{ padding: 8 }}>
      <Button title="ok" onPress={onClose} />
    </View>
  ));
  return onPopover;
}

function useNewTypePopover() {
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <View style={{ padding: 8 }}>
      <Button title="ok" onPress={onClose} />
    </View>
  ));
  return onPopover;
}

// const typeMachine = {}
// function addType(typeName)

// ObjectType
//
// UnionType
//  children: array(TypeType)
// LiteralType
//  value: string/number/boolean
// TypeType

const StringType = 'StringType';

const ObjectType = {};

const TypeType = {
  type: 'UnionType',
  children: [ObjectType],
};

const CORE_TYPES = {
  TypeType,
  ObjectType,
};

function GenericEditor({ state, onValue, schema }) {
  return (
    <RowSection title="value">
      <TextRow text={JSON.stringify(state)} />
    </RowSection>
  );
}
export default function OrganizationScreen(props) {
  const { getParam, push } = useNavigation();
  const path = getParam('path');
  const cloud = useCloud();
  let valueStream = undefined;
  let childrenStream = cloud.docs.all;
  let doc = null;
  if (path) {
    doc = cloud.get(path);
    valueStream = doc.idAndValue.stream;
    childrenStream = doc.children.all;
  }
  const docValue = useStream(valueStream);
  const children = useStream(childrenStream);
  const openNewThingPopover = useNewThingPopover();
  const openNewTypePopover = useNewTypePopover();
  const schema = null;

  console.log(children);
  return (
    <SimplePage title={path || 'Organization'} icon="🎄" {...props}>
      <RowSection>
        <Button title="New.." onPress={openNewThingPopover} />
      </RowSection>

      {doc && (
        <GenericEditor
          state={docValue}
          onValue={value => {
            doc.putValue(value);
          }}
          schema={schema}
        />
      )}
      <RowSection title="children">
        {children &&
          Object.entries(children).map(([childName, typeDoc]) => (
            <LinkRow
              title={childName}
              onPress={() => {
                push('Organization', {
                  path: path ? `${path}/${childName}` : childName,
                });
              }}
            />
          ))}
        <Button title="New Type.." onPress={openNewTypePopover} />

        <MultiSelect
          value={true}
          onValue={() => {}}
          options={[
            { name: 'Live Mode', value: true },
            { name: 'Test Mode', value: false },
          ]}
        />
      </RowSection>
    </SimplePage>
  );
}

OrganizationScreen.navigationOptions = SimplePage.navigationOptions;
