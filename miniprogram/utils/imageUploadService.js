const api = require('../config/api.js')
const session = require('./session.js')
const uploadCredential = require('./uploadCredential.js')
const qiniuUploader = require('./qiniuUploader.js')
const qiniuUploaderShudong = require('./qiniuUploader_shudong.js')
const qiniuUploaderTouxiang = require('./qiniuUploader_touxiang.js')
const qiniuUploaderShichang = require('./qiniuUploader_shichang.js')

const UPLOADERS = {
  default: qiniuUploader,
  comment: qiniuUploader,
  verify: qiniuUploader,
  task: qiniuUploaderShudong,
  shudong: qiniuUploaderShudong,
  avatar: qiniuUploaderTouxiang,
  touxiang: qiniuUploaderTouxiang,
  shichang: qiniuUploaderShichang
}

function parseJson(data) {
  if (!data) return {}
  if (typeof data === 'object') return data
  try {
    return JSON.parse(data)
  } catch (e) {
    return {}
  }
}

function resolveUploader(scene, uploaderType) {
  return UPLOADERS[uploaderType] || UPLOADERS[scene] || UPLOADERS.default
}

function checkImage(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('missing image path'))
      return
    }
    wx.uploadFile({
      url: api.ImgCheck,
      filePath,
      name: 'file',
      header: session.authHeader(),
      success(res) {
        const data = parseJson(res.data)
        if (data.errmsg === 'ok' || data.code === 0 || data.code === 200) {
          resolve(data)
          return
        }
        reject(new Error(data.errcode === '40006' ? '图片太大！' : '图片违规！'))
      },
      fail() {
        reject(new Error('图片审核失败'))
      }
    })
  })
}

function uploadToQiniu(filePath, options) {
  const scene = options.scene || 'task'
  const uploader = resolveUploader(scene, options.uploaderType)
  return uploadCredential.getUploadCredential(scene, filePath).then(credential => {
    return new Promise((resolve, reject) => {
      uploader.upload(
        filePath,
        res => {
          const url = uploadCredential.normalizeImageUrl(res.imageURL)
          if (!url) {
            reject(new Error('上传失败'))
            return
          }
          resolve({ url, raw: res, credential })
        },
        err => {
          reject(err instanceof Error ? err : new Error('上传失败'))
        },
        uploadCredential.qiniuOptions(credential),
        options.onProgress || function() {}
      )
    })
  })
}

function uploadImage(filePath, options) {
  const config = options || {}
  const shouldCheck = config.checkBeforeUpload !== false
  const start = shouldCheck ? checkImage(filePath) : Promise.resolve()
  return start.then(() => uploadToQiniu(filePath, config))
}

function chooseImageFiles(options) {
  const config = options || {}
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: config.count || 1,
      mediaType: ['image'],
      sourceType: config.sourceType || ['album', 'camera'],
      success(res) {
        resolve((res.tempFiles || []).map(file => file.tempFilePath || file.path).filter(Boolean))
      },
      fail: reject
    })
  })
}

module.exports = {
  checkImage,
  uploadImage,
  chooseImageFiles
}
