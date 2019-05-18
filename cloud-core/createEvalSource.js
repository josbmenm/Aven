import createDispatcher from '../cloud-utils/createDispatcher';
import createCloudClient from './createCloudClient';

export default function createEvalSource({
  source,
  domain,
  functions = [],
  session,
}) {
  const cloud = createCloudClient({ source, domain, initialSession: session });

  functions.map(async cloudFn => {
    if (cloudFn.type !== 'CloudFunction') {
      throw new Error(
        'Invalid CloudFunction provided to createEvalSource functions',
      );
    }

    cloud.get(cloudFn.name)._defineCloudFunction(cloudFn);
  });

  return cloud;
}
