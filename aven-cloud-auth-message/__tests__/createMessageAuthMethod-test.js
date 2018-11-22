import startMemoryDataSource from "../../aven-cloud/startMemoryDataSource";
import CloudAuth from "../../aven-cloud-auth/CloudAuth";
import { hashSecureString } from "../../aven-cloud-utils/Crypto";
import createMessageAuthMethod from "../createMessageAuthMethod";

describe("Auth messaging behavior", () => {
  test("Auth message flow", async () => {
    const dataSource = startMemoryDataSource({
      domain: "test"
    });

    const authMethodName = "example-method";

    function identifyAuthInfo(authInfo) {
      if (!authInfo || !authInfo.address) {
        return null;
      }
      return String(authInfo.address);
    }

    const sendVerification = jest.fn();

    const method = createMessageAuthMethod({
      authMethodName,
      sendVerification,
      identifyAuthInfo
    });

    const authDataSource = CloudAuth({ dataSource, methods: [method] });

    const verifyAuthResponse = await authDataSource.dispatch({
      type: "CreateSession",
      domain: "test",
      authInfo: {
        address: "foobar"
      },
      accountId: "foo"
    });

    expect(sendVerification.mock.calls.length).toBe(1);
    expect(sendVerification.mock.calls[0][0].address).toEqual("foobar");
    expect(sendVerification.mock.calls[0][1].length).toEqual(6);

    const createSessionResp = await authDataSource.dispatch({
      type: "CreateSession",
      domain: "test",
      authInfo: {
        address: "foobar"
      },
      verificationResponse: {
        key: sendVerification.mock.calls[0][1]
      },
      accountId: "foo"
    });

    expect(typeof createSessionResp.session.token).toEqual("string");
    expect(typeof createSessionResp.session.accountId).toEqual("string");
    expect(typeof createSessionResp.session.sessionId).toEqual("string");
  });
});
