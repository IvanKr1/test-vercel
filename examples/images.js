const path = require('path');
const fsp = require('fs-promise');
const parser = require('../src');

async function parseRtfImages(rtfPath) {
  try {
    const doc = await parser.parseFile(rtfPath);
    const pics = doc.getChildren(parser.model.command.Picture, true);

    const result = [];
    for (const pict of pics) {
      result.push(pict.getPicture());
    }
    return result;
  } catch (error) {
    console.error('Error parsing RTF file:', error);
    throw error;
  }
}

module.exports = parseRtfImages;
