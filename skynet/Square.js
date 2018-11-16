import { getSecretConfig } from '../aven-web/config';
const {
  MobileAuthorizationApi,
  CustomersApi,
  TransactionsApi,
  CreateMobileAuthorizationCodeRequest,
  ApiClient,
} = require('square-connect');

const oauth2 = ApiClient.instance.authentications.oauth2;
const TOKEN = getSecretConfig('SQUARE_TOKEN');
const LOCATION = getSecretConfig('SQUARE_LOCATION_ID');
oauth2.accessToken = TOKEN;

const apiInstance = new MobileAuthorizationApi();

export const getMobileAuthToken = async action => {
  const requestBody = new CreateMobileAuthorizationCodeRequest.constructFromObject(
    {
      location_id: LOCATION,
    },
  );

  const result = await apiInstance.createMobileAuthorizationCode(requestBody);

  return { result };
};

// var transactions = new TransactionsApi();

// export const listTransactions = async action => {
//   const result = await transactions.listTransactions(LOCATION, {});

//   return { result };
// };
