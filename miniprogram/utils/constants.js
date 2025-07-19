// utils/constants.js

const CryptoJS = require('./aes.js');

// 🌐 API 根地址（开发或占位地址，生产地址勿暴露）
const API_ROOT_URL = 'https://your-dev-api.example.com/';

// 🔐 AES 加密配置（占位符）
const AES_KEY = CryptoJS.enc.Utf8.parse('YOUR_AES_KEY_HERE');
const AES_IV = CryptoJS.enc.Utf8.parse('YOUR_AES_IV_HERE');

// 📦 七牛云上传配置（建议通过后端生成 token）
const QINIU_CONFIG = {
  ak: 'YOUR_QINIU_AK_HERE',
  sk: 'YOUR_QINIU_SK_HERE',
  bkt: 'your-bucket-name',
};

// 🔔 订阅消息模板 ID（示例占位）
const SUBSCRIBE_TEMPLATE_IDS = 'your-subscribe-template-id';

// 🔐 验证码模板 ID（示例占位）
const VERIFY_TEMPLATE_ID = 'your-verify-template-id';

// 📐 页面功能配置
const MAX_IMAGE_COUNT = 3;
const COMPRESS_WIDTH = 400;

module.exports = {
  API_ROOT_URL,
  AES_KEY,
  AES_IV,
  QINIU_CONFIG,
  SUBSCRIBE_TEMPLATE_IDS,
  VERIFY_TEMPLATE_ID,
  MAX_IMAGE_COUNT,
  COMPRESS_WIDTH,
};
