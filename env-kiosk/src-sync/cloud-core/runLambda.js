export default function runLambda(
  pureDataFn,
  argumentValue,
  argumentId,
  argumentDoc,
  cloudClient
) {
  const dependencies = new Set();
  async function loadDependencies() {
    await Promise.all(
      [...dependencies].map(async dep => {
        await dep.fetchValue();
      })
    );
  }
  function useValue(cloudValue) {
    dependencies.add(cloudValue);
    return cloudValue.getValue();
  }
  function computeResult() {
    return pureDataFn(
      { value: argumentValue, id: argumentId },
      argumentDoc,
      cloudClient,
      useValue
    );
  }
  return {
    getIsConnected: () => ![...dependencies].find(dep => !dep.getIsConnected()),
    dependencies,
    loadDependencies,
    result: computeResult(),
    reComputeResult: computeResult,
  };
}
