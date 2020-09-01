let fs = require('fs')
const pathLib = require('path')
const log4js = require('log4js')
const logger = log4js.getLogger('dataAccess')
const mime = require('mime-types')


/**
 * Returns an object tree of folders and files. Includes base64 data so that entire contents can be delivered in single response.
 * 
 * Object Tree
 * Probably want to migrate from a tree structure to an address based structure, as shown in fileSystemExample.js
 * The API could be flexible depending on front-end needs.
 * 
 * File Data
 * Although simple and quick for small data sets, sending all data in a single response can be cumbersome and does not scale.
 * An improvement would be to make the data optional or a separate call. Move towards pagination and caching.
 */
async function getFileTree(folderPath, limit = 10000, includeData = true) {
  if (limit <= 0) {
    logger.warn(`Aborting file system recursion. Depth limit reached. The path "${folderPath}" is too deep at depth of ${depth}`)
    return []
  }
  const folder = {
    path: slashPath(folderPath),
    files: [],
    folders: {}
  }
  const subPaths = fs.readdirSync(folderPath)
  for (const subPath of subPaths) {
    const fullPath = slashPath(pathLib.join(folderPath, subPath));
    const fileInfo = fs.statSync(fullPath)
    if (fileInfo.isDirectory()) {
      folder.folders[fullPath] = await getFileTree(fullPath, --limit, includeData)
    } else if (fileInfo.isFile()) {
      const data = fs.readFileSync(fullPath)
      folder.files.push({
        path: slashPath(fullPath),
        data: includeData ? Buffer.from(data, "binary").toString("base64") : null,
        type: mime.contentType(fullPath)
      })
      if (!includeData) {
        delete folder.files[folder.files.length - 1].data
      }
    } else {
      logger.debug(`Skipping unknown file type at path "${fullPath}"`)
    }
  }
  return folder
}

function slashPath(path) {
  let prefix = (path.match(/^\.*\/*/) || [''])[0]
  path = path.substring(prefix.length)
  return path.replace(/\\/g, '/')
}

// TODO: Send file data separately
// async function getFileData(filePath) {
//   return  {
//     path: filePath,
//     data: fs.readFileSync(filePath),
//     type: mime.contentType(filePath)
//   }
// }

async function getFiles () {
  logger.debug('Getting Files')
  return getFileTree('./database/fileSystem')
}

module.exports = { getFiles }