import React from 'react';
import {
  useNavigationWillBlurEffect,
  useNavigationDidFocusEffect,
} from './Hooks';

export default function useFocus({ inputRenderers, onSubmit }) {
  const focused = React.useRef(null);
  const refs = React.useRef(inputRenderers.map(a => React.createRef()));
  useNavigationWillBlurEffect(() => {
    if (focused.current !== null) {
      const activeInputRef = refs.current[focused.current];
      activeInputRef && activeInputRef.current && activeInputRef.current.blur();
    }
  });
  useNavigationDidFocusEffect(() => {
    const firstInput = refs.current[0].current;
    firstInput && firstInput.focus();
  });

  function handleSubmit(index) {
    if (index === refs.length - 1) {
      const activeInputRef = refs.current[index];
      activeInputRef && activeInputRef.current.blur();
      onSubmit();
    } else {
      const nextInputRef = refs.current[index + 1];
      nextInputRef && nextInputRef.current.focus();
    }
  }
  return {
    inputs: inputRenderers.map((renderInput, index) => {
      const ref = refs.current[index];
      return renderInput({
        key: index,
        ref,
        onFocus: e => {
          focused.current = index;
        },
        onBlur: e => {
          if (focused.current === index) {
            focused.current = null;
          }
        },
        onSubmit: () => {
          handleSubmit(index);
        },
      });
    }),
  };
}
