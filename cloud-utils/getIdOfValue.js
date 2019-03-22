import SHA1 from 'crypto-js/sha1';

const stringify = require('json-stable-stringify');

export default function getIdOfValue(value) {
  const blockData = stringify(value);
  const id = SHA1(blockData).toString();
  return id;
}
