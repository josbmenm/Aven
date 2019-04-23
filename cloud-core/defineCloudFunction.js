export default function defineCloudFunction(name, fn) {
  return {
    type: 'CloudFunction',
    name,
    fn,
  };
}
