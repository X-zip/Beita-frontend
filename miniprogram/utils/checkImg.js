const imageUploadService = require('./imageUploadService.js');

async function checkString(mediaUrl) {
  if (!mediaUrl) return false;
  return imageUploadService.checkImage(mediaUrl)
    .then(() => true)
    .catch(() => false);
}

module.exports = {
  checkString: checkString
};
