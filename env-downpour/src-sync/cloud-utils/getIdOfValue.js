import SHA256 from 'crypto-js/sha256';

const stringify = require('json-stable-stringify');

export default function getIdOfValue(value) {
  const blockData = stringify(value);
  const id = SHA256(blockData).toString();
  const size = blockData.length;
  return { id, size, blockData };
}
