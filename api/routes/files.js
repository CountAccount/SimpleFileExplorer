var express = require('express');
var router = express.Router();
let fileTree = require('../database/fileTree')
let logger = require('log4js').getLogger('API')

router.get('/', async function(req, res, next) {
  let data = await fileTree.getFiles()
  console.log('files length: ' + data.files.length)
  res.json(data);
});

module.exports = router;
