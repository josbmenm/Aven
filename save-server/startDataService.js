import prepareSocketServer from './prepareSocketServer';
import startDBService from '../save-server/startDBService';
const fs = require('fs-extra');
const pathJoin = require('path').join;

const startDataService = async ({ pgConfig, rootDomain }) => {
  const dbService = await startDBService({ pgConfig });

  const uploadFile = async filePath => {
    const fileData = await fs.readFile(filePath);
    const objectId = await dbService.actions.putObject({
      object: {
        data: fileData.toString('hex'),
      },
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
          return await uploadFolder(filePath, dbService);
        } else {
          return await uploadFile(filePath, dbService);
        }
      }),
    );
    const files = {};
    filesInDir.forEach((fileName, index) => {
      files[fileName] = fileList[index];
    });
    const objectId = await dbService.actions.putObject({ object: { files } });
    return objectId;
  };

  const putFolder = async ({ domain, folderPath, refName }) => {
    const folder = await uploadFolder(folderPath);
    await putRef({
      owner: null,
      domain,
      objectId: folder.id,
      ref: refName,
    });
    return folder;
  };
  const getObject = async action => {
    return await dbService.actions.getObject({ id: action.id });
  };

  const getRef = async action => {
    return await dbService.actions.getRef({
      ref: action.ref,
      domain: rootDomain,
    });
  };

  const putObject = async action => {
    return await dbService.actions.putObject({ object: action.value });
  };

  const putRef = async action => {
    await dbService.actions.putRef({
      owner: null,
      domain: action.domain,
      objectId: action.objectId,
      ref: action.ref,
    });
    return {};
  };

  const dispatch = async action => {
    switch (action.type) {
      case 'getObject':
        return getObject(action);
      case 'getRef':
        return getRef(action);
      case 'putObject':
        return putObject(action);
      case 'putRef':
        return putRef(action);
      default:
        throw `Unknown action type "${action.type}"`;
    }
  };

  const close = () => {
    dbService.close();
  };

  const startSocketServer = prepareSocketServer(dbService);

  return { dispatch, startSocketServer, putFolder, close };
};

export default startDataService;
