export default function createTransactionDataSource(source) {
  async function TransactDoc({ domain, name, value }) {
    if (typeof value !== 'object' || value.type !== 'TransactionValue') {
      throw new Error('');
    }
    return await source.dispatch({
      type: 'PutDocValue',
      name: name,
      domain: domain,
      value: {
        type: 'TransactionValue',
        on: value.on,
        value: value.value,
      },
    });
  }

  async function dispatch(action) {
    if (action.type === 'TransactDoc') {
      return await TransactDoc(action);
    }
    const result = await source.dispatch(action);
    return result;
  }

  return {
    ...source,
    dispatch,
  };
}
