import React, { memo } from 'react';

const DISALLOWED_PROPS = new Set([
  // 'transition',
  // 'transitions',
  // 'transitioningFromState',
  // 'transitioningToState',
  // 'transitionRouteKey',
  // 'transitionRef',
]);

export default function pageMemo(Component) {
  const InnerMemoized = memo(Component);
  function OuterMemo(props) {
    const filteredProps = {};
    Object.keys(props).forEach(propName => {
      if (!DISALLOWED_PROPS.has(propName)) {
        filteredProps[propName] = props[propName];
      }
    });
    return <InnerMemoized {...filteredProps} />;
  }
  OuterMemo.navigationOptions = Component.navigationOptions;
  return OuterMemo;
}
