const api = require('../config/api.js')
const token = require('./qntoken.js')
const { authHeader } = require('./session.js')
const {
  QINIU_CONFIG,
} = require('./constants_private.js')

function legacyLocalQiniuToken() {
  return token.token({
    ak: QINIU_CONFIG.ak,
    sk: QINIU_CONFIG.sk,
    bkt: QINIU_CONFIG.bkt,
    cdn: ''
  })
}

function normalizeDomain(domain) {
  const value = domain || 'imgbf.yqtech.ltd'
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function normalizeImageUrl(imageURL) {
  if (!imageURL) return ''
  return imageURL.indexOf('http') === 0 ? imageURL : 'https://' + imageURL
}

function fileNameFromPath(filePath) {
  if (!filePath) return ''
  const parts = filePath.split('/')
  return parts[parts.length - 1] || ''
}

function getFileSize(filePath) {
  return new Promise(resolve => {
    if (!filePath) {
      resolve(0)
      return
    }
    wx.getFileInfo({
      filePath,
      success: res => resolve(res.size || 0),
      fail: () => resolve(0)
    })
  })
}

function normalizeCredential(data) {
  if (!data) return null
  const payload = data.result || data.data || data
  const uptoken = payload.uptoken || payload.token || payload.uploadToken
  if (!uptoken) return null
  return {
    source: 'backend',
    uptoken,
    key: payload.key || '',
    uploadURL: payload.uploadURL || payload.uploadUrl || 'https://upload-z1.qiniup.com',
    domain: normalizeDomain(payload.domain)
  }
}

function requestBackendQiniuToken(scene, filePath) {
  return getFileSize(filePath).then(fileSize => new Promise((resolve, reject) => {
    if (!api.QiniuUploadToken) {
      reject(new Error('missing qiniu upload token api'))
      return
    }
    wx.request({
      url: api.QiniuUploadToken,
      method: 'POST',
      data: {
        openid: wx.getStorageSync('openid') || '',
        unionid: wx.getStorageSync('unionid') || '',
        scene,
        fileName: fileNameFromPath(filePath),
        mimeType: 'image/*',
        contentType: 'image/*',
        size: fileSize
      },
      header: authHeader({ 'content-type': 'application/json' }),
      timeout: 2000,
      success: function(res) {
        const credential = normalizeCredential(res.data)
        if (credential) {
          resolve(credential)
        } else {
          reject(new Error('invalid qiniu upload token response'))
        }
      },
      fail: reject
    })
  }))
}

function getUploadCredential(scene, filePath) {
  return requestBackendQiniuToken(scene, filePath).catch(() => {
    return {
      source: 'legacy',
      uptoken: legacyLocalQiniuToken(),
      key: '',
      uploadURL: 'https://upload-z1.qiniup.com',
      domain: 'imgbf.yqtech.ltd'
    }
  })
}

function qiniuOptions(credential) {
  return {
    region: 'NCN',
    uptoken: credential.uptoken,
    uploadURL: credential.uploadURL,
    domain: credential.domain,
    key: credential.key || undefined
  }
}

module.exports = {
  getUploadCredential,
  normalizeImageUrl,
  qiniuOptions
}
