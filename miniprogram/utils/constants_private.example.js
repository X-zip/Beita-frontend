const CryptoJS = require('./aes.js')

const API_ROOT_URL = 'https://your-api.example.com/'

const AES_KEY = CryptoJS.enc.Utf8.parse('YOUR_AES_KEY_HERE')
const AES_IV = CryptoJS.enc.Utf8.parse('YOUR_AES_IV_HERE')

const QINIU_CONFIG = {
  ak: 'YOUR_QINIU_AK_HERE',
  sk: 'YOUR_QINIU_SK_HERE',
  bkt: 'beifanggx'
}

const SUBSCRIBE_TEMPLATE_IDS = 'your-subscribe-template-id'
const VERIFY_TEMPLATE_ID = 'your-verify-template-id'

const MAX_IMAGE_COUNT = 3
const COMPRESS_WIDTH = 400

module.exports = {
  API_ROOT_URL,
  AES_KEY,
  AES_IV,
  QINIU_CONFIG,
  SUBSCRIBE_TEMPLATE_IDS,
  VERIFY_TEMPLATE_ID,
  MAX_IMAGE_COUNT,
  COMPRESS_WIDTH
}
