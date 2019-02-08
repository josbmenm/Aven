import createDispatcher from '../aven-cloud-utils/createDispatcher';
import createCloudClient from './createCloudClient';

export default function createInterpretedDataSource({ dataSource, domain }) {
  function onDocMiss(name) {
    // example names:
    // - foo/bar/baz
    // - foo/bar^baz
    // - foo/bar^baz/boo
    // - foo/bar#123^baz/boo
    // - foo#123^baz
    // example expanded names
    // - foo#123
    // - foo/bar#123^baz/boo#456
    console.log('DOC NAME MISS!', name);
    throw new Error('coming soon');
  }
  const cloud = createCloudClient({ dataSource, domain, onDocMiss });

  // async function GetDocValue({ domain, name }) {
  //   console.log('GetDocValue', name);
  //   const pathParts = name.split('/');
  //   // const indexOfLastByPart = pathParts.lastIndexOf('_by');
  //   if (indexOfLastByPart === -1) {
  //     return await dataSource.dispatch({ type: 'GetDocValue', domain, name });
  //   }
  //   const functionName = pathParts.slice(indexOfLastByPart + 1).join('/');
  //   const argumentName = pathParts.slice(0, indexOfLastByPart).join('/');
  //   const functionResult = await GetDocValue({
  //     type: 'GetDocValue',
  //     domain,
  //     name: functionName,
  //   });
  //   if (functionResult.value.type !== 'LambdaFunction') {
  //     throw new Error(
  //       `Cannot interpret "${functionName}" because type is not LambdaFunction`
  //     );
  //   }
  //   // const argumentResult = await GetDocValue({
  //   //   type: 'GetDocValue',
  //   //   domain,
  //   //   name: argumentName,
  //   // });
  //   const argumentDoc = cloud.get(argumentName);
  //   await argumentDoc.fetchValue();
  //   const evalCode = `({useValue}) => {
  //     // console.log = () => {};
  //     return ${functionResult.value.code};
  //   }`;

  //   const lambdaContext = eval(evalCode, argumentDoc, cloud);
  //   const deps = new Set();
  //   function useValue(cloudValue) {
  //     console.log('using value', cloudValue.getReference());
  //     deps.add(cloudValue);
  //     return cloudValue.getValue();
  //   }
  //   const lambda = lambdaContext({ useValue });

  //   // run once to fill dependencies
  //   lambda(argumentDoc.getValue(), argumentDoc, cloud, { isScanPass: true });

  //   await Promise.all(
  //     [...deps].map(async dep => {
  //       console.log('ddd', dep.getReference());
  //       await dep.fetchValue();
  //     })
  //   );
  //   // throw new Error('please stop running');

  //   // run again after dependencies have been fetched
  //   const value = lambda(argumentDoc.getValue(), argumentDoc, cloud, {
  //     isScanPass: false,
  //   });

  //   return value;

  //   // console.log('returning', id, value);
  //   // throw new Error('please stop running');
  //   // return { id, value };
  // }

  // const interpretedDataSource = {
  //   ...dataSource,
  //   dispatch: createDispatcher(
  //     {
  //       GetDocValue,
  //       GetDoc,
  //       GetBlock,
  //     },
  //     dataSource.dispatch,
  //     dataSourceDomain,
  //   ),
  // };

  // return interpretedDataSource;
  return cloud;
}
