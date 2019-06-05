const fs = require('fs-extra');
const pathJoin = require('path').join;

export default function createFSClient({ client }) {
  async function uploadFile({ filePath, doc }) {
    const fileData = await fs.readFile(filePath);
    let blockValue;
    try {
      blockValue = JSON.parse(fileData);
    } catch (e) {
      blockValue = {
        type: 'BinaryFileHex',
        data: fileData.toString('hex'),
      };
    }
    const block = await doc.writeBlockCompletely(blockValue);
    return block;
  }

  async function uploadFolder({ folderPath, doc }) {
    const filesInDir = await fs.readdir(folderPath);
    const fileList = await Promise.all(
      filesInDir.map(async fileName => {
        const filePath = pathJoin(folderPath, fileName);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          return await uploadFolder({ folderPath: filePath, doc });
        } else {
          return await uploadFile({ filePath, doc });
        }
      }),
    );
    const files = {};
    filesInDir.forEach((fileName, index) => {
      files[fileName] = fileList[index].getReference();
    });
    const folderObj = { files, type: 'Folder' };
    const block = await doc.writeBlockCompletely(folderObj);

    return block;
  }

  async function putFolder({ folderPath, name }) {
    const doc = client.get(name);
    const folderBlock = await uploadFolder({
      folderPath,
      doc,
    });
    const id = folderBlock.getId();
    await doc.putBlock(folderBlock);
    return { id, name };
  }

  return { ...client, uploadFile, uploadFolder, putFolder };
}
