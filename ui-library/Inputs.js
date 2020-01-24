import React from 'react';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import { ComponentBlock } from './Layout';
import TextInput from '../dash-ui/TextInput';

export default function MultiSelects() {
  return (
    <ComponentBlock title="Input">
      <CodeBlock>
        <CodeBlockTitle title="Default" />
        <CodeBlockExample>
          <TextInput value="default input" />
        </CodeBlockExample>
      </CodeBlock>
    </ComponentBlock>
  );
}
