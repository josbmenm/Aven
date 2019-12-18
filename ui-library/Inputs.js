import React from 'react';
import { Text } from 'react-native';
import { Layout, Container, ComponentBlock } from './Layout';
import BlockFormInput from '../components/BlockFormInput';

export default function Inputs() {
  return (
    <ComponentBlock title="Input">
      <Text>WIP.</Text>
      <BlockFormInput value="hello world" />
    </ComponentBlock>
  );
}
