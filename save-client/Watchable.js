import React from 'react';

export const connectComponent = DataComponent => {
  const dataComponentName = DataComponent.displayName || 'Component';
  class DataConnectedComponent extends React.Component {
    static displayName = `Connected(${dataComponentName})`;
    _subscriptions = {};
    _subscriptionUpdate = () => {
      this.forceUpdate();
    };
    _updateSubscription = async (propName, prop, lastProp) => {
      if (prop === lastProp) {
        return;
      }
      this._unsubscribe(propName);
      if (!prop || !prop.watch) {
        return;
      }
      this._subscriptions[propName] = prop.watch(this._subscriptionUpdate);
    };
    _unsubscribe = propName => {
      const subscriptions = this._subscriptions;
      if (subscriptions[propName]) {
        subscriptions[propName].close();
        subscriptions[propName] = null;
      }
    };
    componentDidMount() {
      Object.keys(this.props).forEach(propName => {
        const prop = this.props[propName];
        this._updateSubscription(propName, prop)
          .then(() => {})
          .catch(err => {
            console.error('Error subscribing to "' + propName + '":', err);
          });
      });
    }
    componentDidUpdate(lastProps) {
      const allPropNames = new Set();
      Object.keys(this.props).forEach(propName => allPropNames.add(propName));
      Object.keys(lastProps).forEach(propName => allPropNames.add(propName));
      allPropNames.forEach(propName => {
        const prop = this.props[propName];
        const lastProp = lastProps[propName];
        this._updateSubscription(propName, prop, lastProp)
          .then(() => {})
          .catch(err => {
            console.error('Error subscribing to "' + propName + '":');
            console.error(err);
          });
      });
    }
    componentWillUnmount() {
      Object.keys(this._subscriptions).forEach(subName =>
        this._unsubscribe(subName),
      );
    }
    render() {
      return <DataComponent {...this.props} />;
    }
  }
  return DataConnectedComponent;
};

export const getWatchable = initialData => {
  const watchers = new Set();
  const watch = handler => {
    watchers.add(handler);
    const close = () => {
      watchers.delete(handler);
    };
    return { close };
  };
  let value = initialData;
  const watchable = {
    getValue: () => value,
    watch,
  };
  const update = newVal => {
    if (newVal !== value) {
      value = newVal;
    }
    watchers.forEach(watcher => watcher());
  };
  const getSubscriberCount = () => watchers.size;
  return { update, watchable, getSubscriberCount };
};
