import DataClient from '../aven-data-client/DataClient';
import { Buffer } from 'buffer';

const IS_DEV = process.env.NODE_ENV !== 'production';

const DEV_HOST = {
  useSSL: false,
  authority: 'localhost:3000',
};
const PROD_HOST = {
  authority: 'api.onofood.co',
};

const HOST = PROD_HOST;
// const HOST = IS_DEV ? DEV_HOST : PROD_HOST;

export const Client = new DataClient({
  host: HOST,
  domain: 'onofood.co',
});

export const dispatch = Client.dispatch;
