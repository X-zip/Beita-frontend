const imageUploadService = require('../../utils/imageUploadService.js')

function normalizeList(value) {
  if (!Array.isArray(value)) return []
  return value
    .map(item => {
      if (typeof item === 'string') return { url: item }
      if (item && item.url) return { url: item.url }
      return null
    })
    .filter(Boolean)
}

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },

  externalClasses: ['custom-class', 'trigger-class'],

  properties: {
    scene: {
      type: String,
      value: 'task'
    },
    uploaderType: {
      type: String,
      value: ''
    },
    chooseMode: {
      type: String,
      value: 'media'
    },
    value: {
      type: Array,
      value: [],
      observer(value) {
        this.setData({ displayList: normalizeList(value) })
      }
    },
    maxCount: {
      type: Number,
      value: 1
    },
    customTrigger: {
      type: Boolean,
      value: false
    },
    replaceWhenFull: {
      type: Boolean,
      value: false
    },
    checkBeforeUpload: {
      type: Boolean,
      value: true
    },
    sourceType: {
      type: Array,
      value: ['album', 'camera']
    },
    disabled: {
      type: Boolean,
      value: false
    },
    loadingText: {
      type: String,
      value: '正在上传图片...'
    },
    placeholder: {
      type: String,
      value: '/images/pic.png'
    },
    previewSuffix: {
      type: String,
      value: '?imageView2/2/w/100'
    }
  },

  data: {
    uploading: false,
    displayList: []
  },

  lifetimes: {
    attached() {
      this.setData({ displayList: normalizeList(this.data.value) })
    }
  },

  methods: {
    choose() {
      if (this.data.disabled || this.data.uploading || this.data.chooseMode === 'avatar') return
      const current = normalizeList(this.data.value)
      if (current.length >= this.data.maxCount && !this.data.replaceWhenFull) {
        wx.showToast({ title: `最多上传${this.data.maxCount}张图片`, icon: 'none' })
        return
      }
      const count = this.data.replaceWhenFull ? 1 : Math.max(this.data.maxCount - current.length, 1)
      imageUploadService.chooseImageFiles({
        count,
        sourceType: this.data.sourceType
      }).then(paths => {
        this.uploadPaths(paths)
      }).catch(() => {})
    },

    onChooseAvatar(event) {
      if (this.data.disabled || this.data.uploading) return
      const filePath = event.detail && event.detail.avatarUrl
      if (!filePath) return
      this.uploadPaths([filePath])
    },

    uploadPaths(paths) {
      if (!paths || !paths.length) return
      this.setData({ uploading: true })
      const startList = this.data.replaceWhenFull ? [] : normalizeList(this.data.value)
      const uploaded = []
      const uploadNext = index => {
        if (index >= paths.length) {
          const nextList = startList.concat(uploaded)
          this.finishUpload(nextList)
          return
        }
        imageUploadService.uploadImage(paths[index], {
          scene: this.data.scene,
          uploaderType: this.data.uploaderType,
          checkBeforeUpload: this.data.checkBeforeUpload
        }).then(result => {
          uploaded.push({ url: result.url })
          this.triggerEvent('success', result)
          uploadNext(index + 1)
        }).catch(error => {
          this.failUpload(error)
        })
      }
      uploadNext(0)
    },

    finishUpload(nextList) {
      this.setData({
        uploading: false,
        displayList: nextList
      })
      this.emitChange(nextList)
    },

    failUpload(error) {
      this.setData({ uploading: false })
      const message = (error && error.message) || '上传失败'
      wx.showToast({ title: message, icon: 'none' })
      this.triggerEvent('fail', { message, error })
    },

    deleteImage(event) {
      const index = event.currentTarget.dataset.index
      const nextList = normalizeList(this.data.value)
      nextList.splice(index, 1)
      this.setData({ displayList: nextList })
      this.triggerEvent('delete', { index, fileList: nextList, urls: nextList.map(item => item.url) })
      this.emitChange(nextList)
    },

    emitChange(list) {
      const fileList = normalizeList(list)
      this.triggerEvent('change', {
        fileList,
        urls: fileList.map(item => item.url)
      })
    }
  }
})
