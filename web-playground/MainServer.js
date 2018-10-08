import App from "./App";
import WebServer from "../aven-web/WebServer";
import { getSecretConfig, IS_DEV } from "../aven-web/config";
import startDataService from "../save-server/startDataService";

const runServer = async () => {
  const domain = "example.aven.cloud";
  console.log("☁️ Starting Cloud 💨");
  const pgConfig = {
    user: getSecretConfig("SQL_USER"),
    password: getSecretConfig("SQL_PASSWORD"),
    database: getSecretConfig("SQL_DATABASE")
  };

  if (getSecretConfig("SQL_INSTANCE_CONNECTION_NAME") && !IS_DEV) {
    pgConfig.host = `/cloudsql/${getSecretConfig(
      "SQL_INSTANCE_CONNECTION_NAME"
    )}`;
  } else if (getSecretConfig("SQL_HOST")) {
    pgConfig.host = getSecretConfig("SQL_HOST");
  }
  const saveService = await startDataService({ pgConfig, rootDomain: domain });

  console.log("☁️ Data Server Ready 💼");

  const dispatch = async action => {
    switch (action.type) {
      default:
        return await saveService.dispatch(action);
    }
  };
  const webService = await WebServer(
    App,
    dispatch,
    saveService.startSocketServer
  );
  console.log("☁️️ Web Ready 🕸");

  return {
    close: async () => {
      await webService.close();
      await saveService.close();
    }
  };
};

export default runServer;
