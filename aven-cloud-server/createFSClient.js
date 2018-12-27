const fs = require('fs-extra');
const pathJoin = require('path').join;

export default function createFSClient({ client }) {
  async function uploadFile({ filePath, doc }) {
    const fileData = await fs.readFile(filePath);
    let block;
    try {
      block = JSON.parse(fileData);
    } catch (e) {
      block = {
        type: 'BinaryFileHex',
        data: fileData.toString('hex'),
      };
    }
    const { id } = await doc.write(block);
    return id;
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
      })
    );
    const files = {};
    filesInDir.forEach((fileName, index) => {
      files[fileName] = { id: fileList[index] };
    });
    const folderObj = { files, type: 'Folder' };
    const { id } = await doc.write(folderObj);
    return id;
  }

  async function putFolder({ folderPath, name }) {
    const doc = client.get(name);
    const id = await uploadFolder({ folderPath, doc });
    await doc.putId(id);
    return { id, name };
  }

  return { ...client, uploadFile, uploadFolder, putFolder };
}
