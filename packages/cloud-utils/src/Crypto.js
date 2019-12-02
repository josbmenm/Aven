import cuid from 'cuid';
import { hash, compare } from 'bcrypt';

const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);

export function checksum(input) {
  const shasum = crypto.createHash('sha256');
  shasum.update(input);
  return shasum.digest('hex');
}

export async function genAuthCode(length = 6) {
  const randBuf = await randomBytes(48);
  const hex = randBuf.toString('hex');
  const int = parseInt(hex, 16);
  const intStr = String(int);
  return intStr.substr(3, length);
}

export async function genKey() {
  const randBuf = await randomBytes(48);
  const hex = randBuf.toString('hex');
  return hex;
}

export function uuid() {
  return cuid();
}

export async function hashSecureString(secretInput) {
  return await hash(secretInput, 10);
}

export async function compareSecureString(testSecretInput, hash) {
  return await compare(testSecretInput, hash);
}
