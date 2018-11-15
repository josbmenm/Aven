const fs = require("fs-extra");
const pathJoin = require("path").join;

export default function createFSClient({ client }) {
  async function uploadFile({ filePath, ref }) {
    const fileData = await fs.readFile(filePath);
    let object;
    try {
      object = JSON.parse(fileData);
    } catch (e) {
      object = {
        type: "BinaryFileHex",
        data: fileData.toString("hex")
      };
    }
    const { id } = await ref.write(object);
    return id;
  }

  async function uploadFolder({ folderPath, ref }) {
    const filesInDir = await fs.readdir(folderPath);
    const fileList = await Promise.all(
      filesInDir.map(async fileName => {
        const filePath = pathJoin(folderPath, fileName);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          return await uploadFolder({ folderPath: filePath, ref });
        } else {
          return await uploadFile({ filePath, ref });
        }
      })
    );
    const files = {};
    filesInDir.forEach((fileName, index) => {
      files[fileName] = { id: fileList[index] };
    });
    const folderObj = { files, type: "Folder" };
    const { id } = await ref.write(folderObj);
    return id;
  }

  async function putFolder({ folderPath, name }) {
    const ref = client.getRef(name);
    const id = await uploadFolder({ folderPath, ref });
    await ref.putId(id);
    return { id, name };
  }

  return { ...client, uploadFile, uploadFolder, putFolder };
}
