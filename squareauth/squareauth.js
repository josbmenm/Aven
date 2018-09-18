var SquareConnect = require("square-connect");

var defaultClient = SquareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
var oauth2 = defaultClient.authentications["oauth2"];
oauth2.accessToken = "sq0atp-O8EARLwemMK6Hmqc8ihbWg";

var apiInstance = new SquareConnect.MobileAuthorizationApi();

var body = new SquareConnect.CreateMobileAuthorizationCodeRequest.constructFromObject(
  {
    location_id: "B58S8E1R59M6D"
  }
); // CreateMobileAuthorizationCodeRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.

apiInstance.createMobileAuthorizationCode(body).then(
  function(data) {
    console.log("API called successfully. Returned data: ", data);
  },
  function(error) {
    console.error(error);
  }
);
