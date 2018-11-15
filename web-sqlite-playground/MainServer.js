import App from "./App";
import WebServer from "../aven-web/WebServer";
import startSQLDataSource from "../aven-cloud-sql/startSQLDataSource";
import createCloudClient from "../aven-cloud/createCloudClient";
import CloudContext from "../aven-cloud/CloudContext";

const runServer = async () => {
  console.log("☁️ Starting Cloud 💨");

  const dataSource = await startSQLDataSource({
    client: "sqlite3", // must have sqlite3 in the dependencies of this module.
    connection: {
      filename: "cloud.sqlite"
    }
  });
  const client = createCloudClient({
    dataSource,
    domain: "example.aven.cloud"
  });
  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv("PORT");
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    dataSource,
    serverListenLocation
  });
  console.log("☁️️ Web Ready 🕸");

  return {
    close: async () => {
      await webService.close();
      await dataSource.close();
    }
  };
};

export default runServer;
