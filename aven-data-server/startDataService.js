import prepareSocketServer from "./prepareSocketServer";
const fs = require("fs-extra");
const pathJoin = require("path").join;

const startDataService = async ({ dataSource, rootDomain }) => {
  const uploadFile = async filePath => {
    const fileData = await fs.readFile(filePath);
    let object;
    try {
      object = JSON.parse(fileData);
    } catch (e) {
      object = {
        data: fileData.toString("hex")
      };
    }
    const objectId = await dataSource.actions.putObject({
      object
    });
    return objectId;
  };

  const uploadFolder = async folderPath => {
    const filesInDir = await fs.readdir(folderPath);
    const fileList = await Promise.all(
      filesInDir.map(async fileName => {
        const filePath = pathJoin(folderPath, fileName);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          return await uploadFolder(filePath, dataSource);
        } else {
          return await uploadFile(filePath, dataSource);
        }
      })
    );
    const files = {};
    filesInDir.forEach((fileName, index) => {
      files[fileName] = fileList[index];
    });
    const objectId = await dataSource.actions.putObject({ object: { files } });
    return objectId;
  };

  const putFolder = async ({ domain, folderPath, refName }) => {
    const folder = await uploadFolder(folderPath);
    await putRef({
      owner: null,
      domain,
      objectId: folder.id,
      ref: refName
    });
    return folder;
  };
  const getObject = async action => {
    return await dataSource.actions.getObject({ id: action.id });
  };

  const getRef = async action => {
    return await dataSource.actions.getRef({
      ref: action.ref,
      domain: rootDomain
    });
  };

  const putObject = async action => {
    return await dataSource.actions.putObject({ object: action.value });
  };

  const putRef = async action => {
    await dataSource.actions.putRef({
      owner: null,
      domain: action.domain,
      objectId: action.objectId,
      ref: action.ref
    });
    return {};
  };

  const dispatch = async action => {
    switch (action.type) {
      case "getObject":
        return getObject(action);
      case "getRef":
        return getRef(action);
      case "putObject":
        return putObject(action);
      case "putRef":
        return putRef(action);
      case "debug":
        return await dataSource.actions.getStatus();
      default:
        throw `Unknown action type "${action.type}"`;
    }
  };

  const close = () => {};

  const startSocketServer = prepareSocketServer(dataSource);

  return { dispatch, startSocketServer, putFolder, close };
};

export default startDataService;
