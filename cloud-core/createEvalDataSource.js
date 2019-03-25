import createDispatcher from '../cloud-utils/createDispatcher';
import createCloudClient from './createCloudClient';

export default function createEvalSource({ source, domain, evalDocs = {} }) {
  const cloud = createCloudClient({ source, domain, evalDocs });

  Object.keys(evalDocs).map(async evalDocName => {
    const evalFunction = evalDocs[evalDocName];
    cloud.get(evalDocName).$setOverrideFunction(evalFunction);
  });

  return cloud;
}
