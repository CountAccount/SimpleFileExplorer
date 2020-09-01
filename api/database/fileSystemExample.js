/**
 * Alternative data structure that is closer to an actual file system.
 * This would handle address queries better and some scenarios like reparse points/symlinks.
 */

let fs = require('fs')
const pathLib = require('path')

function Folder () { 
  return {files: [], folders: []}
}

function File () { return {type}}

async function getFileSystem(parentPath, limit = 10000, fileSystem) {
  if (limit <= 0) {
    logger.warn(`Aborting file system recursion. Depth limit reached. The path "${parentPath}" is too deep at depth of ${depth}`)
    return []
  }
  const folder = Folder()
  if (!fileSystem) {
    fileSystem = {}
    fileSystem.root = parentPath
    fileSystem.makePath = (path) => {
      return path.replace(fileSystem.root, '') || '/'
    }
  }
  function getSubPath(path) {
    
  }
  const key = fileSystem.makePath(parentPath)
  fileSystem[key] = folder
  const subPaths = fs.readdirSync(parentPath)
  for (const subPath of subPaths) {
    const localPath = slashPath(pathLib.join(parentPath, subPath));
    const fileSystemPath = fileSystem.makePath(localPath)
    const fileInfo = fs.statSync(localPath)
    if (fileInfo.isDirectory()) {
      fileSystem[key].folders.push(fileSystemPath)
      await getFileSystem(localPath, --limit, fileSystem)
    } else if (fileInfo.isFile()) {
      fileSystem[key].files.push(fileSystemPath)
    } else {
      logger.debug(`Skipping unknown file type at path "${localPath}"`)
    }
  }
  return fileSystem
}

function slashPath(path) {
  return path.replace(/\\/g, '/')
}

getFileSystem('C:/c/10pct/explorer/_explorer-api/data').then(fileSystem => {
  const result = JSON.stringify(fileSystem, null, 2)
  console.log(result)
  fs.writeFileSync('fileSystemExample Data.json', result)
})
