import React from 'react';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import { ComponentBlock } from './Layout';
import BlockFormInput from '../components/BlockFormInput';

export default function MultiSelects() {
  return (
    <ComponentBlock title="Input">
      <CodeBlock>
        <CodeBlockTitle title="Default" />
        <CodeBlockExample>
          <BlockFormInput value="default input" />
        </CodeBlockExample>
      </CodeBlock>
    </ComponentBlock>
  );
}
