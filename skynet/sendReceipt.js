import React from 'react';
import {
  render,
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage,
  MjmlText,
} from 'mjml-react';
import formatCurrency from '../utils/formatCurrency';
import { log, error } from '../logger/logger';

function Header({ title, metaTitle }) {
  return (
    <MjmlHead>
      <mj-font
        name="MaaxBold"
        href="http://onofood.co/fonts/Maax%20-%20Bold-205TF/Maax%20-%20Bold-205TF.woff2"
      />
      <MjmlTitle>{title}</MjmlTitle>
      <MjmlPreview>{metaTitle}</MjmlPreview>
    </MjmlHead>
  );
}

// {
//   "isConfirmed": true,
//   "confirmedTime": 1558402036695,
//   "subTotal": 1240,
//   "tax": 111,
//   "total": 1351,
//   "discountTotal": 0,
//   "totalBeforeDiscount": 1351,
//   "taxRate": 0.09,
//   "id": "cjvx4acry0008k5raeuyodnx1",
//   "stripeIntentId": "pi_1EcMkuCrrthmKDAgOnw8KMaJ",
//   "isOrderValid": true,
//   "orderName": {
//     "firstName": "Eric",
//     "lastName": "V"
//   },
//   "items": [
//     {
//       "itemPrice": 645,
//       "recipeBasePrice": 595,
//       "sellPrice": 645,
//       "quantity": 1,
//       "id": "cjvx4ad1g0003ramepzrbqqia",
//       "type": "blend",
//       "menuItemId": "rec3SzrHfP2zJnoaO",
//       "customizationSummary": [
//         "add fitness ($.50)",
//         "add cacao nibs",
//         "remove papaya",
//         "add mango"
//       ],
//       "customization": {
//         "enhancements": [
//           "recFlyZ68FePHBGbI",
//           "recSFSa4PUFyryQ3L"
//         ],
//         "ingredients": {
//           "Boost": [
//             "recGOJ1oby67xemtp",
//             "recQeOwgATMJMs69w"
//           ],
//           "Frozen": [
//             "rec17gjOSmacPTVTk",
//             "recS107K858dvPtBx",
//             "rec1dE86v90OECGMV",
//             "recJtf3Ud5TBpIG3h",
//             "recXmmTN2saDHFK4t",
//             "recXmmTN2saDHFK4t",
//             "recQkaEbJ9gAfRG1m"
//           ]
//         }
//       }
//     },
//     {
//       "itemPrice": 595,
//       "recipeBasePrice": 595,
//       "sellPrice": 595,
//       "quantity": 1,
//       "id": "cjvx4bk8a0004rame4s8q1qno",
//       "type": "blend",
//       "menuItemId": "rec3XPx4e4JgMim9Q",
//       "customization": null,
//       "customizationSummary": []
//     }
//   ],
//   "stripeIntent": {
//     "id": "pi_1EcMkuCrrthmKDAgOnw8KMaJ",
//     "object": "payment_intent",
//     "amount": 1351,
//     "amount_capturable": 0,
//     "amount_received": 1351,
//     "application": null,
//     "application_fee_amount": null,
//     "canceled_at": null,
//     "cancellation_reason": null,
//     "capture_method": "manual",
//     "client_secret": "pi_1EcMkuCrrthmKDAgOnw8KMaJ_secret_dm7usH1l5scBxIWG3kWlLkJd1",
//     "confirmation_method": "automatic",
//     "created": 1558402024,
//     "currency": "usd",
//     "customer": null,
//     "description": null,
//     "invoice": null,
//     "last_payment_error": null,
//     "livemode": false,
//     "next_action": null,
//     "next_source_action": null,
//     "on_behalf_of": null,
//     "payment_method": null,
//     "receipt_email": null,
//     "review": null,
//     "shipping": null,
//     "statement_descriptor": null,
//     "status": "succeeded",
//     "transfer_data": null,
//     "transfer_group": null,
//     "sourceId": "src_1EcMl4CrrthmKDAgBtrkzoLL",
//     "metadata": {},
//     "allowed_source_types": [
//       "card_present"
//     ],
//     "payment_method_types": [
//       "card_present"
//     ],
//     "source": {
//       "id": "src_1EcMl4CrrthmKDAgBtrkzoLL",
//       "object": "source",
//       "amount": null,
//       "client_secret": "src_client_secret_F6ZuoRI2eWHl3yAavwD6U5WS",
//       "created": 1558402034,
//       "currency": "usd",
//       "flow": "none",
//       "livemode": false,
//       "statement_descriptor": null,
//       "status": "consumed",
//       "type": "card_present",
//       "usage": "single_use",
//       "metadata": {},
//       "card_present": {
//         "read_method": "contact_emv",
//         "reader": "rdr_1DiylZCrrthmKDAgjMqRTnKk",
//         "exp_month": 12,
//         "exp_year": 2022,
//         "last4": "9969",
//         "country": "US",
//         "brand": "Visa",
//         "funding": "credit",
//         "fingerprint": "YB4E5o91CKdoG15D",
//         "emv_auth_data": "8A023030",
//         "dedicated_file_name": "A0000000031010",
//         "authorization_response_code": "5A33",
//         "terminal_verification_results": "8080008000",
//         "transaction_status_information": "6800",
//         "application_preferred_name": "Stripe Credit",
//         "application_cryptogram": "FD23DE9A53706C39",
//         "pos_entry_mode": "contact_emv",
//         "cvm_type": "signature",
//         "authorization_code": null,
//         "data_type": null,
//         "evidence_customer_signature": null,
//         "evidence_transaction_certificate": null,
//         "pos_device_id": null
//       },
//       "owner": {
//         "address": null,
//         "email": null,
//         "name": null,
//         "phone": null,
//         "verified_address": null,
//         "verified_email": null,
//         "verified_name": null,
//         "verified_phone": null
//       }
//     },
//     "charges": {
//       "object": "list",
//       "has_more": false,
//       "total_count": 1,
//       "url": "/v1/charges?payment_intent=pi_1EcMkuCrrthmKDAgOnw8KMaJ",
//       "data": [
//         {
//           "id": "ch_1EcMl4CrrthmKDAgDx21atgl",
//           "object": "charge",
//           "amount": 1351,
//           "amount_refunded": 0,
//           "application": null,
//           "application_fee": null,
//           "application_fee_amount": null,
//           "authorization_code": "123456",
//           "balance_transaction": "txn_1EcMl5CrrthmKDAgNY2KO2b6",
//           "captured": true,
//           "created": 1558402034,
//           "currency": "usd",
//           "customer": null,
//           "description": null,
//           "destination": null,
//           "dispute": null,
//           "failure_code": null,
//           "failure_message": null,
//           "invoice": null,
//           "livemode": false,
//           "on_behalf_of": null,
//           "order": null,
//           "paid": true,
//           "payment_intent": "pi_1EcMkuCrrthmKDAgOnw8KMaJ",
//           "payment_method": "src_1EcMl4CrrthmKDAgBtrkzoLL",
//           "receipt_email": null,
//           "receipt_number": null,
//           "receipt_url": "https://pay.stripe.com/receipts/acct_1De4xuCrrthmKDAg/ch_1EcMl4CrrthmKDAgDx21atgl/rcpt_F6ZuliVctuIfeibIAQmqi2vDecpHuvb",
//           "refunded": false,
//           "review": null,
//           "shipping": null,
//           "source_transfer": null,
//           "statement_descriptor": null,
//           "status": "succeeded",
//           "transfer_data": null,
//           "transfer_group": null,
//           "fraud_details": {},
//           "metadata": {},
//           "outcome": {
//             "network_status": "approved_by_network",
//             "reason": null,
//             "risk_level": "normal",
//             "risk_score": 7,
//             "seller_message": "Payment complete.",
//             "type": "authorized"
//           },
//           "refunds": {
//             "object": "list",
//             "has_more": false,
//             "total_count": 0,
//             "url": "/v1/charges/ch_1EcMl4CrrthmKDAgDx21atgl/refunds",
//             "data": []
//           },
//           "billing_details": {
//             "email": null,
//             "name": null,
//             "phone": null,
//             "address": {
//               "city": null,
//               "country": null,
//               "line1": null,
//               "line2": null,
//               "postal_code": null,
//               "state": null
//             }
//           },
//           "source": {
//             "id": "src_1EcMl4CrrthmKDAgBtrkzoLL",
//             "object": "source",
//             "amount": null,
//             "client_secret": "src_client_secret_F6ZuoRI2eWHl3yAavwD6U5WS",
//             "created": 1558402034,
//             "currency": "usd",
//             "flow": "none",
//             "livemode": false,
//             "statement_descriptor": null,
//             "status": "consumed",
//             "type": "card_present",
//             "usage": "single_use",
//             "metadata": {},
//             "card_present": {
//               "read_method": "contact_emv",
//               "reader": "rdr_1DiylZCrrthmKDAgjMqRTnKk",
//               "exp_month": 12,
//               "exp_year": 2022,
//               "last4": "9969",
//               "country": "US",
//               "brand": "Visa",
//               "funding": "credit",
//               "fingerprint": "YB4E5o91CKdoG15D",
//               "emv_auth_data": "8A023030",
//               "dedicated_file_name": "A0000000031010",
//               "authorization_response_code": "5A33",
//               "terminal_verification_results": "8080008000",
//               "transaction_status_information": "6800",
//               "application_preferred_name": "Stripe Credit",
//               "application_cryptogram": "FD23DE9A53706C39",
//               "pos_entry_mode": "contact_emv",
//               "cvm_type": "signature",
//               "authorization_code": null,
//               "data_type": null,
//               "evidence_customer_signature": null,
//               "evidence_transaction_certificate": null,
//               "pos_device_id": null
//             },
//             "owner": {
//               "address": null,
//               "email": null,
//               "name": null,
//               "phone": null,
//               "verified_address": null,
//               "verified_email": null,
//               "verified_name": null,
//               "verified_phone": null
//             }
//           },
//           "payment_method_details": {
//             "type": "card_present",
//             "card_present": {
//               "brand": "visa",
//               "country": "US",
//               "emv_auth_data": "8A023030",
//               "exp_month": 12,
//               "exp_year": 2022,
//               "fingerprint": "YB4E5o91CKdoG15D",
//               "funding": "credit",
//               "generated_card": null,
//               "last4": "9969",
//               "read_method": "contact_emv",
//               "receipt": {
//                 "application_cryptogram": "FD23DE9A53706C39",
//                 "application_preferred_name": "Stripe Credit",
//                 "authorization_code": null,
//                 "authorization_response_code": "5A33",
//                 "cardholder_verification_method": "signature",
//                 "dedicated_file_name": "A0000000031010",
//                 "terminal_verification_results": "8080008000",
//                 "transaction_status_information": "6800"
//               }
//             }
//           }
//         }
//       ]
//     }
//   }
// }

async function sendSMSReceipt(smsAgent, action, order) {
  log('ReceiptSMSWillSend', { ...order, ...action });
  await smsAgent.actions.SendSMS({
    to: `1${action.contact.value}`,
    message: `Thanks for visting Ono Blends! Your receipt is here: https://onoblends.co/receipt/${order.id} \n\nWe hope to see you again soon ❤️`,
  });
  log('ReceiptSMSDidSend', { ...order, ...action });
  return {
    sendTime: Date.now(),
    type: 'sms',
    contact: action.contact,
  };
}
async function sendEmailReceipt(emailAgent, action, order) {
  const cardPresentMeta =
    order.stripeIntent &&
    order.stripeIntent.charges.data[0].source &&
    order.stripeIntent.charges.data[0].source.card_present;

  log('ReceiptEmailWillSend', { ...order, ...action });
  const { html, errors } = render(
    <Mjml>
      <Header
        title="Thank you for ordering from Ono Blends"
        metaTitle={`Your receipt for ${formatCurrency(order.total)}`}
      />
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#f7f7f7">
          <MjmlColumn>
            <MjmlImage src="https://onofood.co/img/icons.svg" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlText>
              {order.orderName.firstName} {order.orderName.lastName}
            </MjmlText>
            <MjmlText>Order Id: {order.id}</MjmlText>
            <MjmlText>Subtotal: {formatCurrency(order.subTotal)}</MjmlText>
            <MjmlText>Tax: {formatCurrency(order.tax)}</MjmlText>
            <MjmlText>Total: {formatCurrency(order.total)}</MjmlText>
            <MjmlText>
              Your receipt can also be accessed here:
              <a href={`https://onoblends.co/receipt/${order.id}`}>
                https://onoblends.co/receipt/{order.id}
              </a>
            </MjmlText>
            <MjmlButton
              padding="20px"
              backgroundColor="#346DB7"
              href="https://onofood.co"
            >
              sign up for updates from ono
            </MjmlButton>
            {cardPresentMeta && (
              <MjmlText>
                Application Name: {cardPresentMeta.application_preferred_name},
                AID: {cardPresentMeta.dedicated_file_name}
              </MjmlText>
            )}
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>,
    { validationLevel: 'soft' },
  );
  if (errors.length) {
    error('ReceiptMJMLError', { errors });
    throw new Error('Cannot construct email!', errors);
  }
  await emailAgent.actions.SendEmail({
    to: action.contact.value,
    subject: 'Your purchase from Ono Blends',
    message: 'Thanks for your order! \n\n -The Ono Blends Team',
    messageHTML: html,
  });
  log('ReceiptEmailDidSend', { ...order, ...action });
  return {
    sendTime: Date.now(),
    type: 'email',
    contact: action.contact,
  };
}

export default async function sendReceipt({
  cloud,
  smsAgent,
  emailAgent,
  action,
}) {
  const order = cloud.get(`ConfirmedOrders/${action.orderId}`);
  const orderValue = await order.value.load();
  if (!orderValue) {
    throw new Error('Cannot find this order ' + action.orderId);
  }
  if (!action.contact) {
    throw new Error('Invalid SendReceipt action');
  }
  if (action.contact.type === 'sms') {
    const sent = await sendSMSReceipt(smsAgent, action, orderValue);
    await order.transact(o => ({
      ...o,
      receipts: [...(o.receipts || []), sent],
    }));
  }
  if (action.contact.type === 'email') {
    const sent = await sendEmailReceipt(emailAgent, action, orderValue);
    await order.transact(o => ({
      ...o,
      receipts: [...(o.receipts || []), sent],
    }));
  }
  return;
}
